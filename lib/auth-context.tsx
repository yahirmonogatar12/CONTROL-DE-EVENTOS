"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"
import bcrypt from "bcryptjs"

export type UserRole = "global-admin" | "admin" | "user" | null

interface CardData {
  referente: string
  name: string
  apellidoPaterno: string
  apellidoMaterno: string
  telefono: string
  correoElectronico: string
  calleNumero: string
  colonia: string
  municipio: string
  estado: string
  edad: number
  sexo: string
  seccion: string
  necesidad: string
  buzon: string
  seguimientoBuzon: string
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
  updateCard: (cardData: CardData) => Promise<void>
  hasCard: boolean
  events: Event[]
  createEvent: (eventData: Omit<Event, "id" | "qrCode" | "confirmationCode" | "attendees" | "createdBy">) => Promise<void>
  deleteEvent: (eventId: string) => Promise<void>
  registerAttendance: (eventId: string, userEmail: string) => Promise<void>
  registerAttendanceByCode: (confirmationCode: string, userEmail: string) => Promise<boolean>
  getAllUserCards: () => Promise<Array<{ email: string; name: string; card: CardData }>>
  createUser: (email: string, password: string, role: UserRole, name?: string) => Promise<{ success: boolean; message: string }>
  getAllUsers: () => Promise<Array<{ id: string; email: string; role: string; name: string }>>
  deleteUser: (userId: string) => Promise<void>
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
        // Mapear los campos de la DB al formato de CardData
        const cardData: CardData = {
          referente: data.referente,
          name: data.nombre,
          apellidoPaterno: data.apellido_paterno,
          apellidoMaterno: data.apellido_materno,
          telefono: data.telefono,
          correoElectronico: data.correo_electronico,
          calleNumero: data.calle_numero,
          colonia: data.colonia,
          municipio: data.municipio,
          estado: data.estado,
          edad: data.edad,
          sexo: data.sexo,
          seccion: data.seccion,
          necesidad: data.necesidad,
          buzon: data.buzon,
          seguimientoBuzon: data.seguimiento_buzon,
        }
        setUser((prev) => prev ? { ...prev, card: cardData } : null)
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
    try {
      console.log("🔐 Intentando login para:", email)

      // Buscar usuario en Supabase
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()

      if (error || !userData) {
        console.error("❌ Usuario no encontrado:", error)
        return false
      }

      console.log("👤 Usuario encontrado, verificando contraseña...")
      console.log("🔑 Hash en DB:", userData.password.substring(0, 20) + "...")

      // Verificar contraseña hasheada
      const passwordMatch = await bcrypt.compare(password, userData.password)
      console.log("🔐 Resultado comparación:", passwordMatch)

      if (!passwordMatch) {
        console.error("❌ Contraseña incorrecta")
        return false
      }

      console.log("✅ Login exitoso")

      // Crear objeto de usuario
      const user: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name || userData.email.split("@")[0],
      }

      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      await loadUserCard(email)
      return true
    } catch (error) {
      console.error("❌ Error en login:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const registerCard = async (cardData: CardData) => {
    if (!user) return

    try {
      console.log("🔍 Intentando registrar tarjeta para:", user.email)
      console.log("📝 Datos de la tarjeta:", cardData)
      
      const { data, error } = await supabase
        .from("cards")
        .upsert({
          user_email: user.email,
          referente: cardData.referente,
          nombre: cardData.name,
          apellido_paterno: cardData.apellidoPaterno,
          apellido_materno: cardData.apellidoMaterno,
          telefono: cardData.telefono,
          correo_electronico: cardData.correoElectronico,
          calle_numero: cardData.calleNumero,
          colonia: cardData.colonia,
          municipio: cardData.municipio,
          estado: cardData.estado,
          edad: cardData.edad,
          sexo: cardData.sexo,
          seccion: cardData.seccion,
          necesidad: cardData.necesidad,
          buzon: cardData.buzon,
          seguimiento_buzon: cardData.seguimientoBuzon,
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Error de Supabase:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log("✅ Tarjeta registrada exitosamente:", data)
      const updatedUser = { ...user, card: cardData }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    } catch (error: any) {
      console.error("❌ Error registering card:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        full: error
      })
      throw error
    }
  }

  const updateCard = async (cardData: CardData) => {
    if (!user) return

    try {
      console.log("🔄 Actualizando tarjeta para:", user.email)
      console.log("📝 Nuevos datos:", cardData)
      
      const { data, error } = await supabase
        .from("cards")
        .update({
          referente: cardData.referente,
          nombre: cardData.name,
          apellido_paterno: cardData.apellidoPaterno,
          apellido_materno: cardData.apellidoMaterno,
          telefono: cardData.telefono,
          correo_electronico: cardData.correoElectronico,
          calle_numero: cardData.calleNumero,
          colonia: cardData.colonia,
          municipio: cardData.municipio,
          estado: cardData.estado,
          edad: cardData.edad,
          sexo: cardData.sexo,
          seccion: cardData.seccion,
          necesidad: cardData.necesidad,
          buzon: cardData.buzon,
          seguimiento_buzon: cardData.seguimientoBuzon,
        })
        .eq("user_email", user.email)
        .select()
        .single()

      if (error) {
        console.error("❌ Error de Supabase al actualizar:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log("✅ Tarjeta actualizada exitosamente:", data)
      const updatedUser = { ...user, card: cardData }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    } catch (error: any) {
      console.error("❌ Error updating card:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        full: error
      })
      throw error
    }
  }

  const createEvent = async (eventData: Omit<Event, "id" | "qrCode" | "confirmationCode" | "attendees" | "createdBy">) => {
    if (!user) return

    try {
      const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const eventId = Date.now().toString()
      const qrCode = `EVENT-${eventId}-${confirmationCode}`

      console.log("🎉 Creando evento:", {
        title: eventData.title,
        code: confirmationCode,
        createdBy: user.id
      })

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

      if (error) {
        console.error("❌ Error de Supabase al crear evento:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log("✅ Evento creado exitosamente:", data)
      await loadEvents()
    } catch (error: any) {
      console.error("❌ Error creating event:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        full: error
      })
      throw error
    }
  }

  const deleteEvent = async (eventId: string) => {
    try {
      console.log("🗑️ Eliminando evento:", eventId)

      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) {
        console.error("❌ Error al eliminar evento:", error)
        throw error
      }

      console.log("✅ Evento eliminado exitosamente")
      await loadEvents()
    } catch (error) {
      console.error("❌ Error deleting event:", error)
      throw error
    }
  }

  const registerAttendance = async (eventId: string, userEmail: string) => {
    try {
      console.log("📝 Registrando asistencia:", { eventId, userEmail })

      const { error } = await supabase.from("event_attendees").insert({
        event_id: eventId,
        user_email: userEmail,
      })

      if (error && error.code !== "23505") {
        // 23505 es duplicate key (ya está registrado)
        console.error("❌ Error al registrar asistencia:", error)
        throw error
      }

      if (error && error.code === "23505") {
        console.log("⚠️ Usuario ya registrado en este evento")
      } else {
        console.log("✅ Asistencia registrada exitosamente")
      }

      await loadEvents()
    } catch (error) {
      console.error("❌ Error registering attendance:", error)
      throw error
    }
  }

  const registerAttendanceByCode = async (confirmationCode: string, userEmail: string): Promise<boolean> => {
    try {
      console.log("🎫 Registrando con código:", confirmationCode, "para:", userEmail)

      // Buscar evento por código
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id, title")
        .eq("confirmation_code", confirmationCode.toUpperCase())
        .single()

      if (eventError || !event) {
        console.error("❌ Evento no encontrado con código:", confirmationCode)
        return false
      }

      console.log("✅ Evento encontrado:", event.title)

      // Verificar si ya está registrado
      const { data: existing } = await supabase
        .from("event_attendees")
        .select("id")
        .eq("event_id", event.id)
        .eq("user_email", userEmail)
        .single()

      if (existing) {
        console.log("⚠️ Usuario ya registrado en este evento")
        return false // Ya está registrado
      }

      // Registrar asistencia
      const { error } = await supabase.from("event_attendees").insert({
        event_id: event.id,
        user_email: userEmail,
      })

      if (error) {
        console.error("❌ Error al insertar asistencia:", error)
        throw error
      }

      console.log("✅ Asistencia registrada exitosamente")
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
        name: card.nombre,
        card: {
          referente: card.referente,
          name: card.nombre,
          apellidoPaterno: card.apellido_paterno,
          apellidoMaterno: card.apellido_materno,
          telefono: card.telefono,
          correoElectronico: card.correo_electronico,
          calleNumero: card.calle_numero,
          colonia: card.colonia,
          municipio: card.municipio,
          estado: card.estado,
          edad: card.edad,
          sexo: card.sexo,
          seccion: card.seccion,
          necesidad: card.necesidad,
          buzon: card.buzon,
          seguimientoBuzon: card.seguimiento_buzon,
        },
      }))
    } catch (error) {
      console.error("Error getting user cards:", error)
      return []
    }
  }

  const createUser = async (email: string, password: string, role: UserRole, name?: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log("👤 Creando nuevo usuario:", email, "con rol:", role)

      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .single()

      if (existingUser) {
        return { success: false, message: "El usuario ya existe" }
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10)
      console.log("🔐 Contraseña hasheada")

      // Usar el nombre proporcionado o el email como fallback
      const userName = name || email.split("@")[0]

      // Insertar usuario en Supabase
      const { data, error } = await supabase
        .from("users")
        .insert({
          email,
          name: userName,
          password: hashedPassword,
          role: role || "user",
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Error al crear usuario:", error)
        return { success: false, message: error.message }
      }

      console.log("✅ Usuario creado exitosamente:", data)
      return { success: true, message: "Usuario creado exitosamente" }
    } catch (error: any) {
      console.error("❌ Error al crear usuario:", error)
      return { success: false, message: error?.message || "Error desconocido" }
    }
  }

  const getAllUsers = async (): Promise<Array<{ id: string; email: string; role: string; name: string }>> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, role, name")
        .order("created_at", { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error getting users:", error)
      return []
    }
  }

  const deleteUser = async (userId: string): Promise<void> => {
    try {
      console.log("🗑️ Eliminando usuario:", userId)

      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId)

      if (error) {
        console.error("❌ Error al eliminar usuario:", error)
        throw error
      }

      console.log("✅ Usuario eliminado exitosamente")
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
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
        updateCard,
        hasCard: !!user?.card,
        events,
        createEvent,
        deleteEvent,
        registerAttendance,
        registerAttendanceByCode,
        getAllUserCards,
        createUser,
        getAllUsers,
        deleteUser,
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
