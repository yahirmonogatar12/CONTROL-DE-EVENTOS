"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"

export type UserRole = "global-admin" | "admin" | "user" | null

interface CardData {
  name: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  curp?: string
  sex: string
  age: string
  address: string
  phone: string
  folioNo?: string
  distrito?: string
  seccion?: string
  calleNumero?: string
  colonia?: string
  programas?: string[]
  fecha?: string
  responsableCaptura?: string
  cancelada?: boolean
  observaciones?: string
}

interface User {
  id: string
  email: string
  role: UserRole
  name: string
  card?: CardData
}

export interface Event {
  id: string
  title: string
  date: string
  location: string
  description?: string
  qrCode: string
  confirmationCode: string
  attendees: string[]
  createdBy: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isGlobalAdmin: boolean
  registerCard: (cardData: CardData) => Promise<void>
  hasCard: boolean
  events: Event[]
  createEvent: (eventData: Omit<Event, "id" | "qrCode" | "confirmationCode" | "attendees" | "createdBy">) => Promise<void>
  deleteEvent: (eventId: string) => Promise<void>
  registerAttendance: (eventId: string, userEmail: string) => Promise<void>
  registerAttendanceByCode: (confirmationCode: string, userEmail: string) => Promise<boolean>
  getAllUserCards: () => Promise<Array<{ email: string; name: string; card: CardData }>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuarios demo (en producción esto debería venir de Supabase Auth)
const DEMO_USERS = [
  {
    email: "globaladmin@example.com",
    password: "global123",
    role: "global-admin" as UserRole,
    name: "Administrador Global",
  },
  { email: "admin@example.com", password: "admin123", role: "admin" as UserRole, name: "Administrador" },
  { email: "user@example.com", password: "user123", role: "user" as UserRole, name: "Usuario Normal" },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])

  // Cargar usuario y eventos al iniciar
  useEffect(() => {
    loadUser()
    loadEvents()
  }, [])

  const loadUser = () => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      loadUserCard(userData.email)
    }
    setIsLoading(false)
  }

  const loadUserCard = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("user_email", email)
        .single()

      if (data && !error) {
        setUser((prev) => prev ? { ...prev, card: data as CardData } : null)
      }
    } catch (error) {
      console.error("Error loading card:", error)
    }
  }

  const loadEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })

      if (eventsError) throw eventsError

      // Cargar asistentes para cada evento
      const eventsWithAttendees = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: attendeesData } = await supabase
            .from("event_attendees")
            .select("user_email")
            .eq("event_id", event.id)

          return {
            id: event.id,
            title: event.title,
            date: event.date,
            location: event.location,
            description: event.description,
            qrCode: event.qr_code,
            confirmationCode: event.confirmation_code,
            attendees: attendeesData?.map((a) => a.user_email) || [],
            createdBy: event.created_by,
          }
        })
      )

      setEvents(eventsWithAttendees)
    } catch (error) {
      console.error("Error loading events:", error)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const foundUser = DEMO_USERS.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const userData: User = {
        id: email, // En producción, esto vendría de Supabase Auth
        email: foundUser.email,
        role: foundUser.role,
        name: foundUser.name,
      }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      await loadUserCard(email)
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const registerCard = async (cardData: CardData) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("cards")
        .upsert({
          user_email: user.email,
          ...cardData,
          apellido_paterno: cardData.apellidoPaterno,
          apellido_materno: cardData.apellidoMaterno,
          folio_no: cardData.folioNo,
          calle_numero: cardData.calleNumero,
          responsable_captura: cardData.responsableCaptura,
        })
        .select()
        .single()

      if (error) throw error

      const updatedUser = { ...user, card: cardData }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Error registering card:", error)
      throw error
    }
  }

  const createEvent = async (eventData: Omit<Event, "id" | "qrCode" | "confirmationCode" | "attendees" | "createdBy">) => {
    if (!user) return

    try {
      const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const eventId = Date.now().toString()
      const qrCode = `EVENT-${eventId}-${confirmationCode}`

      const { data, error } = await supabase
        .from("events")
        .insert({
          title: eventData.title,
          date: eventData.date,
          location: eventData.location,
          description: eventData.description,
          qr_code: qrCode,
          confirmation_code: confirmationCode,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      await loadEvents()
    } catch (error) {
      console.error("Error creating event:", error)
      throw error
    }
  }

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) throw error

      await loadEvents()
    } catch (error) {
      console.error("Error deleting event:", error)
      throw error
    }
  }

  const registerAttendance = async (eventId: string, userEmail: string) => {
    try {
      const { error } = await supabase.from("event_attendees").insert({
        event_id: eventId,
        user_email: userEmail,
      })

      if (error && error.code !== "23505") {
        // 23505 es duplicate key (ya está registrado)
        throw error
      }

      await loadEvents()
    } catch (error) {
      console.error("Error registering attendance:", error)
      throw error
    }
  }

  const registerAttendanceByCode = async (confirmationCode: string, userEmail: string): Promise<boolean> => {
    try {
      // Buscar evento por código
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id")
        .eq("confirmation_code", confirmationCode)
        .single()

      if (eventError || !event) {
        return false
      }

      // Verificar si ya está registrado
      const { data: existing } = await supabase
        .from("event_attendees")
        .select("id")
        .eq("event_id", event.id)
        .eq("user_email", userEmail)
        .single()

      if (existing) {
        return false // Ya está registrado
      }

      // Registrar asistencia
      const { error } = await supabase.from("event_attendees").insert({
        event_id: event.id,
        user_email: userEmail,
      })

      if (error) throw error

      await loadEvents()
      return true
    } catch (error) {
      console.error("Error registering by code:", error)
      return false
    }
  }

  const getAllUserCards = async (): Promise<Array<{ email: string; name: string; card: CardData }>> => {
    try {
      const { data, error } = await supabase.from("cards").select("*")

      if (error) throw error

      return (data || []).map((card) => ({
        email: card.user_email,
        name: card.name,
        card: {
          name: card.name,
          apellidoPaterno: card.apellido_paterno,
          apellidoMaterno: card.apellido_materno,
          curp: card.curp,
          sex: card.sex,
          age: card.age,
          address: card.address,
          phone: card.phone,
          folioNo: card.folio_no,
          distrito: card.distrito,
          seccion: card.seccion,
          calleNumero: card.calle_numero,
          colonia: card.colonia,
          programas: card.programas,
          fecha: card.fecha,
          responsableCaptura: card.responsable_captura,
          cancelada: card.cancelada,
          observaciones: card.observaciones,
        },
      }))
    } catch (error) {
      console.error("Error getting user cards:", error)
      return []
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin" || user?.role === "global-admin",
        isGlobalAdmin: user?.role === "global-admin",
        registerCard,
        hasCard: !!user?.card,
        events,
        createEvent,
        deleteEvent,
        registerAttendance,
        registerAttendanceByCode,
        getAllUserCards,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
