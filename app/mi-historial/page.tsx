"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { UserEventHistory } from "@/components/user-event-history"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function MiHistorialPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto p-4 md:p-8">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">Mi Historial</h1>
            <p className="text-neutral-600 mt-2">
              Revisa todos los eventos a los que has asistido
            </p>
          </div>
          
          <UserEventHistory />
        </div>
      </div>
    </ProtectedRoute>
  )
}
