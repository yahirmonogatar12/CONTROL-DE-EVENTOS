"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"
import bcrypt from "bcryptjs"

// URL base para producción
const getBaseUrl = () => {
  // En producción, usar siempre la URL de Vercel
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://control-de-eventos.vercel.app'
  }
  // En desarrollo, usar localhost
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
}

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
  suspended?: boolean
  image_url?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<void>
  loginWithApple: () => Promise<void>
  registerWithEmail: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isGlobalAdmin: boolean
  registerCard: (cardData: CardData) => Promise<void>
  updateCard: (cardData: CardData) => Promise<void>
  getUserCard: (userEmail: string) => Promise<CardData | null>
  hasCard: boolean
  events: Event[]
  createEvent: (eventData: Omit<Event, "id" | "qrCode" | "confirmationCode" | "attendees" | "createdBy">, image?: File) => Promise<void>
  deleteEvent: (eventId: string) => Promise<{ success: boolean; message: string; hasAttendees?: boolean }>
  suspendEvent: (eventId: string) => Promise<void>
  registerAttendance: (eventId: string, userEmail: string) => Promise<void>
  registerAttendanceByCode: (confirmationCode: string, userEmail: string) => Promise<boolean>
  getUserEventHistory: (userEmail: string) => Promise<any[]>
  getUserEventStats: (userEmail: string) => Promise<any>
  getEventAttendeesDetailed: (eventId: string) => Promise<any[]>
  getAllUserCards: () => Promise<Array<{ email: string; name: string; card: CardData }>>
  createUser: (email: string, password: string, role: UserRole, name?: string) => Promise<{ success: boolean; message: string }>
  getAllUsers: () => Promise<Array<{ id: string; email: string; role: string; name: string }>>
  deleteUser: (userId: string) => Promise<void>
  submitComplaint: (type: 'queja' | 'sugerencia', subject: string, message: string, images?: File[]) => Promise<{ success: boolean; message: string }>
  getUserComplaints: () => Promise<any[]>
  getAllComplaints: () => Promise<any[]>
  updateComplaintStatus: (id: string, status: string, adminResponse?: string) => Promise<void>
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

  // Verificar si hay una sesión activa de Supabase Auth (Google OAuth)
  const checkSupabaseSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Usuario autenticado con Google
        const { data: userData, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", session.user.email)
          .single()

        if (userData && !error) {
          const user: User = {
            id: userData.id,
            email: userData.email,
            role: userData.role as UserRole,
            name: userData.name || session.user.user_metadata.full_name || session.user.email?.split("@")[0],
          }

          setUser(user)
          localStorage.setItem("user", JSON.stringify(user))
          await loadUserCard(session.user.email!)
        }
      }
    } catch (error) {
      console.error("Error checking Supabase session:", error)
    }
  }

  const loadUser = async () => {
    // Primero verificar sesión de Supabase
    await checkSupabaseSession()
    
    // Si no hay sesión de Supabase, cargar desde localStorage
    if (!user) {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        loadUserCard(userData.email)
      }
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
      // Obtener rol del usuario actual
      const storedUser = localStorage.getItem("user")
      const currentUser = storedUser ? JSON.parse(storedUser) : null
      const isAdmin = currentUser?.role === "admin" || currentUser?.role === "global-admin"

      let query = supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })

      // Si no es admin, filtrar eventos suspendidos
      if (!isAdmin) {
        query = query.eq("suspended", false)
      }

      const { data: eventsData, error: eventsError } = await query

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
            suspended: event.suspended || false,
            image_url: event.image_url,
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

      // Verificar si el usuario tiene una cuenta en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("❌ Error de autenticación:", authError)
        
        // Verificar si el error es por email no confirmado
        if (authError.message.includes("Email not confirmed")) {
          throw new Error("Por favor verifica tu correo electrónico antes de iniciar sesión")
        }
        
        return false
      }

      // Verificar que el email esté confirmado
      if (authData.user && !authData.user.email_confirmed_at) {
        console.error("❌ Email no verificado")
        await supabase.auth.signOut()
        throw new Error("Por favor verifica tu correo electrónico antes de iniciar sesión")
      }

      // Buscar usuario en la tabla users
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()

      if (error || !userData) {
        console.error("❌ Usuario no encontrado en DB:", error)
        await supabase.auth.signOut()
        return false
      }

      console.log("✅ Login exitoso - Email verificado")

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

  const loginWithGoogle = async () => {
    try {
      const baseUrl = getBaseUrl()
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error("❌ Error en login con Google:", error)
      throw error
    }
  }

  const loginWithApple = async () => {
    try {
      const baseUrl = getBaseUrl()
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error("❌ Error en login con Apple:", error)
      throw error
    }
  }

  const registerWithEmail = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log("📧 Registrando usuario con email:", email)

      // Verificar si el email ya existe en la tabla users
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .single()

      if (existingUser) {
        return { success: false, message: "Este correo ya está registrado" }
      }

      // Crear usuario en Supabase Auth (esto enviará el correo de verificación)
      const baseUrl = getBaseUrl()
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback`,
          data: {
            full_name: name,
          }
        }
      })

      if (authError) {
        console.error("❌ Error al crear usuario en Auth:", authError)
        return { success: false, message: authError.message }
      }

      if (!authData.user) {
        return { success: false, message: "Error al crear usuario" }
      }

      // Hashear la contraseña para la tabla users
      const hashedPassword = await bcrypt.hash(password, 10)

      // Crear usuario en la tabla users (sin verificar aún)
      const { error: dbError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: email,
        name: name,
        role: "user",
        password: hashedPassword,
      })

      if (dbError) {
        console.error("❌ Error al crear usuario en DB:", dbError)
        return { success: false, message: "Error al crear usuario en la base de datos" }
      }

      console.log("✅ Usuario registrado exitosamente, correo de verificación enviado")
      return { 
        success: true, 
        message: "Cuenta creada. Por favor verifica tu correo electrónico." 
      }
    } catch (error) {
      console.error("❌ Error en registerWithEmail:", error)
      return { success: false, message: "Error al crear cuenta" }
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem("user")
    // Cerrar sesión de Supabase Auth si existe
    await supabase.auth.signOut()
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

  const getUserCard = async (userEmail: string): Promise<CardData | null> => {
    try {
      console.log("🔍 Buscando tarjeta para:", userEmail)
      
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("user_email", userEmail)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró la tarjeta
          console.log("📭 No se encontró tarjeta para:", userEmail)
          return null
        }
        throw error
      }

      if (!data) {
        return null
      }

      // Mapear los datos de la base de datos al formato CardData
      const cardData: CardData = {
        referente: data.referente || "",
        name: data.nombre || "",
        apellidoPaterno: data.apellido_paterno || "",
        apellidoMaterno: data.apellido_materno || "",
        telefono: data.telefono || "",
        correoElectronico: data.correo_electronico || "",
        calleNumero: data.calle_numero || "",
        colonia: data.colonia || "",
        municipio: data.municipio || "",
        estado: data.estado || "",
        edad: data.edad || 0,
        sexo: data.sexo || "",
        seccion: data.seccion || "",
        necesidad: data.necesidad || "",
        buzon: data.buzon || "",
        seguimientoBuzon: data.seguimiento_buzon || "",
      }

      console.log("✅ Tarjeta encontrada:", cardData)
      return cardData
    } catch (error: any) {
      console.error("❌ Error obteniendo tarjeta:", error)
      return null
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

  const createEvent = async (eventData: Omit<Event, "id" | "qrCode" | "confirmationCode" | "attendees" | "createdBy">, image?: File) => {
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

      let imageUrl: string | null = null

      // Subir imagen a Supabase Storage si existe
      if (image) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${user.id}/${eventId}-${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Error uploading event image:', uploadError)
        } else {
          // Obtener URL pública de la imagen
          const { data: urlData } = supabase.storage
            .from('event-images')
            .getPublicUrl(fileName)
          
          if (urlData?.publicUrl) {
            imageUrl = urlData.publicUrl
          }
        }
      }

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
          image_url: imageUrl,
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

  const deleteEvent = async (eventId: string): Promise<{ success: boolean; message: string; hasAttendees?: boolean }> => {
    try {
      console.log("🗑️ Intentando eliminar evento:", eventId)

      // Verificar si el evento tiene asistentes
      const { data: attendees, error: attendeesError } = await supabase
        .from("event_attendees")
        .select("id")
        .eq("event_id", eventId)

      if (attendeesError) {
        console.error("❌ Error al verificar asistentes:", attendeesError)
        throw attendeesError
      }

      // Si tiene asistentes, no permitir eliminar
      if (attendees && attendees.length > 0) {
        console.log("⚠️ Evento tiene asistentes, no se puede eliminar")
        return {
          success: false,
          message: `Este evento tiene ${attendees.length} asistente${attendees.length > 1 ? 's' : ''} registrado${attendees.length > 1 ? 's' : ''}. No se puede eliminar. Puedes suspenderlo en su lugar.`,
          hasAttendees: true
        }
      }

      // Si no tiene asistentes, eliminar
      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) {
        console.error("❌ Error al eliminar evento:", error)
        throw error
      }

      console.log("✅ Evento eliminado exitosamente")
      await loadEvents()
      return {
        success: true,
        message: "Evento eliminado exitosamente"
      }
    } catch (error) {
      console.error("❌ Error deleting event:", error)
      throw error
    }
  }

  const suspendEvent = async (eventId: string) => {
    try {
      console.log("⏸️ Suspendiendo evento:", eventId)

      const { error } = await supabase
        .from("events")
        .update({ suspended: true })
        .eq("id", eventId)

      if (error) {
        console.error("❌ Error al suspender evento:", error)
        throw error
      }

      console.log("✅ Evento suspendido exitosamente")
      await loadEvents()
    } catch (error) {
      console.error("❌ Error suspending event:", error)
      throw error
    }
  }

  const registerAttendance = async (eventId: string, userEmail: string) => {
    try {
      console.log("📝 Registrando asistencia:", { eventId, userEmail })

      // Obtener datos del evento
      const event = events.find(e => e.id === eventId)
      if (!event) {
        throw new Error("Evento no encontrado")
      }

      // Obtener datos de la tarjeta del usuario
      const { data: cardData, error: cardError } = await supabase
        .from("cards")
        .select("*")
        .eq("user_email", userEmail)
        .single()

      if (cardError || !cardData) {
        console.error("❌ Usuario sin tarjeta registrada")
        throw new Error("Debes registrar tu tarjeta antes de asistir a eventos")
      }

      // Registrar en event_attendees (tabla simple)
      const { error } = await supabase.from("event_attendees").insert({
        event_id: eventId,
        user_email: userEmail,
      })

      if (error && error.code !== "23505") {
        // 23505 es duplicate key (ya está registrado)
        console.error("❌ Error al registrar asistencia:", error)
        throw error
      }

      // Registrar en historial con datos completos
      if (!error || error.code !== "23505") {
        const { error: historyError } = await supabase
          .from("event_attendance_history")
          .insert({
            event_id: eventId,
            event_title: event.title,
            event_date: event.date,
            event_location: event.location,
            confirmation_code: event.confirmationCode,
            user_email: userEmail,
            user_name: cardData.nombre,
            referente: cardData.referente,
            telefono: cardData.telefono,
            correo_electronico: cardData.correo_electronico,
            municipio: cardData.municipio,
            seccion: cardData.seccion,
            edad: cardData.edad,
            sexo: cardData.sexo,
          })

        if (historyError) {
          console.error("⚠️ Error al guardar historial:", historyError)
        }
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

      // Verificar que el usuario tenga tarjeta registrada
      const { data: cardData, error: cardError } = await supabase
        .from("cards")
        .select("*")
        .eq("user_email", userEmail)
        .single()

      if (cardError || !cardData) {
        console.error("❌ Usuario sin tarjeta registrada")
        throw new Error("Debes registrar tu tarjeta antes de asistir a eventos")
      }

      // Buscar evento por código
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
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

      // Registrar en historial con datos completos
      const { error: historyError } = await supabase
        .from("event_attendance_history")
        .insert({
          event_id: event.id,
          event_title: event.title,
          event_date: event.date,
          event_location: event.location,
          confirmation_code: event.confirmation_code,
          user_email: userEmail,
          user_name: cardData.nombre,
          referente: cardData.referente,
          telefono: cardData?.telefono,
          correo_electronico: cardData?.correo_electronico,
          municipio: cardData?.municipio,
          seccion: cardData?.seccion,
          edad: cardData?.edad,
          sexo: cardData?.sexo,
        })

      if (historyError) {
        console.error("⚠️ Error al guardar historial:", historyError)
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

  const getUserEventHistory = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from("event_attendance_history")
        .select("*")
        .eq("user_email", userEmail)
        .order("attended_at", { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error getting user event history:", error)
      return []
    }
  }

  const getUserEventStats = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from("event_attendance_history")
        .select("*")
        .eq("user_email", userEmail)

      if (error) throw error

      const events = data || []
      const now = new Date()
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      return {
        total_events: events.length,
        unique_events: new Set(events.map(e => e.event_id)).size,
        events_last_30_days: events.filter(e => new Date(e.attended_at) >= last30Days).length,
        events_last_7_days: events.filter(e => new Date(e.attended_at) >= last7Days).length,
        first_event: events.length > 0 ? events[events.length - 1].attended_at : null,
        last_event: events.length > 0 ? events[0].attended_at : null,
      }
    } catch (error) {
      console.error("Error getting user stats:", error)
      return {
        total_events: 0,
        unique_events: 0,
        events_last_30_days: 0,
        events_last_7_days: 0,
        first_event: null,
        last_event: null,
      }
    }
  }

  const getEventAttendeesDetailed = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_attendance_history")
        .select("*")
        .eq("event_id", eventId)
        .order("attended_at", { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error getting event attendees:", error)
      return []
    }
  }

  const submitComplaint = async (type: 'queja' | 'sugerencia', subject: string, message: string, images?: File[]): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: "Debes iniciar sesión para enviar una queja o sugerencia" }
    }

    try {
      const imageUrls: string[] = []

      // Subir imágenes a Supabase Storage
      if (images && images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop()
          const fileName = `${user.email}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('complaint-images')
            .upload(fileName, image, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('Error uploading image:', uploadError)
            continue // Continuar con las demás imágenes si una falla
          }

          // Obtener URL pública de la imagen
          const { data: urlData } = supabase.storage
            .from('complaint-images')
            .getPublicUrl(fileName)
          
          if (urlData?.publicUrl) {
            imageUrls.push(urlData.publicUrl)
          }
        }
      }

      const { error } = await supabase.from("complaints_suggestions").insert({
        user_email: user.email,
        user_name: user.name,
        type,
        subject,
        message,
        status: 'pendiente',
        images: imageUrls,
      })

      if (error) throw error

      return { success: true, message: "Tu mensaje ha sido enviado exitosamente" }
    } catch (error) {
      console.error("Error submitting complaint:", error)
      return { success: false, message: "Error al enviar el mensaje" }
    }
  }

  const getUserComplaints = async () => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from("complaints_suggestions")
        .select("*")
        .eq("user_email", user.email)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting user complaints:", error)
      return []
    }
  }

  const getAllComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints_suggestions")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting all complaints:", error)
      return []
    }
  }

  const updateComplaintStatus = async (id: string, status: string, adminResponse?: string) => {
    const userIsAdmin = user?.role === "admin" || user?.role === "global-admin"
    if (!user || !userIsAdmin) {
      throw new Error("No tienes permisos para actualizar quejas")
    }

    try {
      const updateData: any = {
        status,
        admin_email: user.email,
      }

      if (adminResponse) {
        updateData.admin_response = adminResponse
      }

      if (status === 'resuelto') {
        updateData.resolved_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("complaints_suggestions")
        .update(updateData)
        .eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error updating complaint:", error)
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
        loginWithGoogle,
        loginWithApple,
        registerWithEmail,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin" || user?.role === "global-admin",
        isGlobalAdmin: user?.role === "global-admin",
        registerCard,
        updateCard,
        getUserCard,
        hasCard: !!user?.card,
        events,
        createEvent,
        deleteEvent,
        suspendEvent,
        registerAttendance,
        registerAttendanceByCode,
        getUserEventHistory,
        getUserEventStats,
        getEventAttendeesDetailed,
        getAllUserCards,
        createUser,
        getAllUsers,
        deleteUser,
        submitComplaint,
        getUserComplaints,
        getAllComplaints,
        updateComplaintStatus,
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
