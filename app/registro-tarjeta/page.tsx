"use client"

import { CardRegistrationForm } from "@/components/cards/card-registration-form"
import { MyCard } from "@/components/cards/my-card"
import { PointsLeaderboard } from "@/components/cards/points-leaderboard"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth-context"

export default function RegistroTarjetaPage() {
  const { hasCard } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {!hasCard ? <CardRegistrationForm /> : <MyCard />}
              <div className="lg:hidden">
                <PointsLeaderboard />
              </div>
            </div>

            <div className="space-y-6">
              <div className="hidden lg:block">
                <PointsLeaderboard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
