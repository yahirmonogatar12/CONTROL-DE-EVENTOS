"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user) {
    // Global admins have access to everything
    if (user.role === "global-admin") {
      return <>{children}</>
    }

    // Check if user's role matches the required role(s)
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Acceso Denegado</AlertTitle>
              <AlertDescription>
                No tienes permisos para acceder a esta sección.
                {allowedRoles.includes("admin") && " Solo los administradores pueden acceder a esta sección."}
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/")} className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              Volver al Inicio
            </Button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
