"use client"

import { useState } from "react"
import { EventSearch } from "@/components/event-search"
import { EventList } from "@/components/event-list"
import { UserStats } from "@/components/user-stats"
import { BottomNav } from "@/components/bottom-nav"
import { RegisterWithCodeDialog } from "@/components/register-with-code-dialog"
import Link from "next/link"
import { ArrowLeft, Plus, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { CreateEventDialog } from "@/components/create-event-dialog"

export default function EventosPage() {
  const [activeTab, setActiveTab] = useState("eventos")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRegisterCodeDialog, setShowRegisterCodeDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()

  const canCreateEvents = user?.role === "admin" || user?.role === "global-admin"

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white pb-20">
        <div className="max-w-2xl mx-auto px-4 md:px-0">
          <div className="p-4 md:p-6">
            <Link href="/">
              <Button variant="ghost" className="mb-4 md:mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900">Registrar evento</h1>
              <div className="flex gap-2 w-full sm:w-auto">
                {!canCreateEvents && activeTab === "eventos" && (
                  <Button
                    onClick={() => setShowRegisterCodeDialog(true)}
                    variant="outline"
                    className="flex-1 sm:flex-none"
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    Registrar con Código
                  </Button>
                )}
                {canCreateEvents && activeTab === "eventos" && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Evento
                  </Button>
                )}
              </div>
            </div>

            {activeTab === "eventos" && (
              <>
                <EventSearch onSearch={setSearchQuery} />
                <div className="mt-6">
                  <EventList searchQuery={searchQuery} />
                </div>
              </>
            )}

            {activeTab === "estadisticas" && (
              <div className="mt-6">
                <UserStats />
              </div>
            )}

            {activeTab === "incentivos" && (
              <div className="mt-6 text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Incentivos</h2>
                <p className="text-neutral-600">¡Asiste a más eventos y gana incentivos!</p>
              </div>
            )}
          </div>
        </div>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        <CreateEventDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
        <RegisterWithCodeDialog 
          open={showRegisterCodeDialog} 
          onOpenChange={setShowRegisterCodeDialog}
          initialTab="manual"
        />
      </div>
    </ProtectedRoute>
  )
}
