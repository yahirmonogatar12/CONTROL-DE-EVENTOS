"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Calendar, LogOut, User, Users, FileText } from "lucide-react"
import { useEffect } from "react"

export default function HomePage() {
  const { isAuthenticated, user, logout, isAdmin, hasCard } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto mb-6 md:mb-8">
        <div className="flex items-center justify-between bg-white rounded-lg p-3 md:p-4 shadow-sm gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-neutral-900 truncate">{user?.name}</p>
              <p className="text-sm text-neutral-500">{isAdmin ? "Administrador" : ""}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-1 md:gap-2 bg-transparent flex-shrink-0 text-sm md:text-base"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
            <span className="sm:hidden">Salir</span>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-neutral-900">
          Sistema Social Bienestar
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Link href="/registro-tarjeta" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
              <CardHeader className="flex-grow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl md:text-2xl">{hasCard ? "Mi Tarjeta" : "Registro de Tarjeta"}</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {hasCard
                    ? "Visualiza tu tarjeta personal y la tabla de clasificación"
                    : "Registra tu tarjeta personal y visualiza la tabla de clasificación"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm md:text-base">
                  {hasCard ? "Ver Mi Tarjeta" : "Ir a Registro de Tarjeta"}
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/eventos" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
              <CardHeader className="flex-grow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl md:text-2xl">Registro de Eventos</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Busca y registra eventos, visualiza tus estadísticas
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm md:text-base">Ir a Eventos</Button>
              </CardContent>
            </Card>
          </Link>

          {isAdmin && (
            <>
              <Link href="/admin/usuarios" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                  <CardHeader className="flex-grow">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl">Gestión de Usuarios</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Crea y administra usuarios del sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm md:text-base">
                      Gestionar Usuarios
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/tarjetas" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                  <CardHeader className="flex-grow">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl">Ver Tarjetas</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Visualiza todas las tarjetas registradas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm md:text-base">
                      Ver Todas las Tarjetas
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
