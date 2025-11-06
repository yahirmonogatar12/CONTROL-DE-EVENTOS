"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { ComplaintsSuggestions } from "@/components/complaints-suggestions"

export default function QuejasPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pb-20">
        <div className="container max-w-4xl mx-auto p-4 pt-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Quejas y Sugerencias
            </h1>
            <p className="text-neutral-600 mt-2">
              Tu opinión nos ayuda a mejorar
            </p>
          </div>
          <ComplaintsSuggestions />
        </div>
      </div>
    </ProtectedRoute>
  )
}
