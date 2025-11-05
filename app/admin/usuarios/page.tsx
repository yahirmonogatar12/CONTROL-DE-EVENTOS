"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { ArrowLeft, UserPlus, Trash2, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"

interface NewUser {
  name: string
  email: string
  password: string
  role: "global-admin" | "admin" | "user"
}

export default function UsuariosPage() {
  const { isGlobalAdmin, createUser, getAllUsers, deleteUser } = useAuth()

  const [users, setUsers] = useState<Array<{ id: string; email: string; role: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    email: "",
    password: "",
    role: "user",
  })

  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "global-admin" | "admin" | "user">("all")

  // Cargar usuarios al iniciar
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    const usersData = await getAllUsers()
    setUsers(usersData)
    setIsLoading(false)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    const result = await createUser(newUser.email, newUser.password, newUser.role, newUser.name)

    if (result.success) {
      setMessageType("success")
      setMessage(result.message)
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "user",
      })
      await loadUsers() // Recargar lista de usuarios
    } else {
      setMessageType("error")
      setMessage(result.message)
    }

    setIsCreating(false)
    setTimeout(() => setMessage(""), 3000)
  }

  const handleDeleteUser = async (userId: string, userRole: string) => {
    if (!isGlobalAdmin && userRole === "global-admin") {
      setMessageType("error")
      setMessage("No tienes permisos para eliminar administradores globales")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    try {
      await deleteUser(userId)
      setMessageType("success")
      setMessage("Usuario eliminado exitosamente")
      await loadUsers() // Recargar lista
    } catch (error) {
      setMessageType("error")
      setMessage("Error al eliminar usuario")
    }

    setTimeout(() => setMessage(""), 3000)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "global-admin":
        return "Administrador Global"
      case "admin":
        return "Administrador"
      case "user":
        return "Usuario"
      default:
        return role
    }
  }

  const canDeleteUser = (userRole: string) => {
    // Global admins can delete anyone
    if (isGlobalAdmin) return true
    // Regular admins cannot delete global admins
    if (userRole === "global-admin") return false
    return true
  }

  return (
    <ProtectedRoute requiredRole={["admin", "global-admin"]}>
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-neutral-900 mb-8">Gestión de Usuarios</h1>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Crear Nuevo Usuario
                </CardTitle>
                <CardDescription>Agrega un nuevo usuario al sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: "global-admin" | "admin" | "user") =>
                        setNewUser({ ...newUser, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario Normal</SelectItem>
                        {isGlobalAdmin && <SelectItem value="admin">Administrador</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>

                  {message && (
                    <Alert className={messageType === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
                      <AlertDescription className={messageType === "error" ? "text-red-800" : "text-green-800"}>
                        {message}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Usuario"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios Registrados</CardTitle>
                <CardDescription>Lista de todos los usuarios del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      placeholder="Buscar por nombre o correo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={roleFilter}
                    onValueChange={(value: "all" | "global-admin" | "admin" | "user") => setRoleFilter(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="global-admin">Administradores Globales</SelectItem>
                      <SelectItem value="admin">Administradores</SelectItem>
                      <SelectItem value="user">Usuarios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-neutral-600">Cargando usuarios...</span>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <p className="text-center text-neutral-500 py-4">No se encontraron usuarios</p>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium text-neutral-900">{user.name}</p>
                          <p className="text-sm text-neutral-500">{user.email}</p>
                          <p className="text-xs text-neutral-400 mt-1">{getRoleLabel(user.role)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.role)}
                          disabled={!canDeleteUser(user.role)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
