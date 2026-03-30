"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "global-admin" | "admin" | "user" | null

interface CardData {
  name: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  curp?: string // Added CURP to card data interface
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
  confirmationCode: string // Código de confirmación para registrarse
  attendees: string[] // Array of user emails who attended
  createdBy: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isGlobalAdmin: boolean
  registerCard: (cardData: CardData) => void
  hasCard: boolean
  events: Event[]
  createEvent: (eventData: Omit<Event, "id" | "qrCode" | "confirmationCode" | "attendees" | "createdBy">) => void
  deleteEvent: (eventId: string) => void
  registerAttendance: (eventId: string, userEmail: string) => void
  registerAttendanceByCode: (confirmationCode: string, userEmail: string) => boolean
  getAllUserCards: () => Array<{ email: string; name: string; card: CardData }> // Added method to get all user cards
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    const storedEvents = localStorage.getItem("events")
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents))
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const foundUser = DEMO_USERS.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const storedCards = localStorage.getItem("userCards")
      const userCards = storedCards ? JSON.parse(storedCards) : {}

      const userData = {
        email: foundUser.email,
        role: foundUser.role,
        name: foundUser.name,
        card: userCards[foundUser.email] || undefined,
      }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const registerCard = (cardData: CardData) => {
    if (!user) return

    const storedCards = localStorage.getItem("userCards")
    const userCards = storedCards ? JSON.parse(storedCards) : {}

    userCards[user.email] = cardData
    localStorage.setItem("userCards", JSON.stringify(userCards))

    const updatedUser = { ...user, card: cardData }
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  const createEvent = (eventData: Omit<Event, "id" | "qrCode" | "confirmationCode" | "attendees" | "createdBy">) => {
    if (!user) return

    // Generar código de confirmación único de 6 caracteres alfanuméricos
    const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const eventId = Date.now().toString()

    const newEvent: Event = {
      ...eventData,
      id: eventId,
      qrCode: `EVENT-${eventId}-${confirmationCode}`,
      confirmationCode,
      attendees: [],
      createdBy: user.email,
    }

    const updatedEvents = [...events, newEvent]
    setEvents(updatedEvents)
    localStorage.setItem("events", JSON.stringify(updatedEvents))
  }

  const deleteEvent = (eventId: string) => {
    const updatedEvents = events.filter((e) => e.id !== eventId)
    setEvents(updatedEvents)
    localStorage.setItem("events", JSON.stringify(updatedEvents))
  }

  const registerAttendance = (eventId: string, userEmail: string) => {
    const updatedEvents = events.map((event) => {
      if (event.id === eventId && !event.attendees.includes(userEmail)) {
        return { ...event, attendees: [...event.attendees, userEmail] }
      }
      return event
    })
    setEvents(updatedEvents)
    localStorage.setItem("events", JSON.stringify(updatedEvents))
  }

  const registerAttendanceByCode = (confirmationCode: string, userEmail: string): boolean => {
    const event = events.find((e) => e.confirmationCode === confirmationCode)
    
    if (!event) {
      return false
    }

    if (event.attendees.includes(userEmail)) {
      return false // Ya está registrado
    }

    const updatedEvents = events.map((e) => {
      if (e.confirmationCode === confirmationCode) {
        return { ...e, attendees: [...e.attendees, userEmail] }
      }
      return e
    })
    
    setEvents(updatedEvents)
    localStorage.setItem("events", JSON.stringify(updatedEvents))
    return true
  }

  const getAllUserCards = () => {
    const storedCards = localStorage.getItem("userCards")
    if (!storedCards) return []

    const userCards = JSON.parse(storedCards)
    return Object.entries(userCards).map(([email, card]) => ({
      email,
      name: (card as CardData).name,
      card: card as CardData,
    }))
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
        getAllUserCards, // Added to context value
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
