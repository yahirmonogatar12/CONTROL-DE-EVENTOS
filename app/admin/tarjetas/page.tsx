"use client"

import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, CreditCard } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import QRCode from "qrcode"

export default function TarjetasPage() {
  const { getAllUserCards } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCard, setSelectedCard] = useState<any>(null)

  const allCards = getAllUserCards()

  const filteredCards = allCards.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.card.curp?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const generateQRCode = async (data: string) => {
    try {
      return await QRCode.toDataURL(data, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
    } catch (err) {
      console.error(err)
      return ""
    }
  }

  const handleViewCard = async (cardData: any) => {
    const qrData = await generateQRCode(
      JSON.stringify({
        name: cardData.card.name,
        curp: cardData.card.curp,
        email: cardData.email,
      }),
    )
    setSelectedCard({ ...cardData, qrCode: qrData })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al Inicio
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <CreditCard className="w-8 h-8" />
                Tarjetas de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por nombre, correo o CURP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {selectedCard ? (
                <div className="space-y-4">
                  <Button variant="outline" onClick={() => setSelectedCard(null)} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a la lista
                  </Button>

                  <Card className="bg-white border-2">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <h3 className="text-2xl font-bold text-neutral-900">{selectedCard.card.name}</h3>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-semibold">Email:</span> {selectedCard.email}
                            </p>
                            <p>
                              <span className="font-semibold">CURP:</span> {selectedCard.card.curp}
                            </p>
                            <p>
                              <span className="font-semibold">Sexo:</span> {selectedCard.card.sexo}
                            </p>
                            <p>
                              <span className="font-semibold">Folio:</span> {selectedCard.card.folioNo}
                            </p>
                            <p>
                              <span className="font-semibold">Distrito:</span> {selectedCard.card.distrito}
                            </p>
                            <p>
                              <span className="font-semibold">Sección:</span> {selectedCard.card.seccion}
                            </p>
                            <p>
                              <span className="font-semibold">Dirección:</span> {selectedCard.card.address}
                            </p>
                            <p>
                              <span className="font-semibold">Teléfono:</span> {selectedCard.card.phone}
                            </p>
                            {selectedCard.card.programas && selectedCard.card.programas.length > 0 && (
                              <p>
                                <span className="font-semibold">Programas:</span>{" "}
                                {selectedCard.card.programas.join(", ")}
                              </p>
                            )}
                            {selectedCard.card.fecha && (
                              <p>
                                <span className="font-semibold">Fecha:</span> {selectedCard.card.fecha}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                          {selectedCard.qrCode && (
                            <img src={selectedCard.qrCode || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCards.length === 0 ? (
                    <p className="text-center text-neutral-500 py-8">No se encontraron tarjetas</p>
                  ) : (
                    filteredCards.map((item) => (
                      <Card key={item.email} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{item.card.name}</h3>
                            <p className="text-sm text-neutral-600">{item.email}</p>
                            {item.card.curp && <p className="text-sm text-neutral-600">CURP: {item.card.curp}</p>}
                          </div>
                          <Button onClick={() => handleViewCard(item)} variant="outline">
                            Ver Tarjeta
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
