"use client"

import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, CreditCard } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import QRCode from "qrcode"

export default function TarjetasPage() {
  const { getAllUserCards } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [allCards, setAllCards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCards = async () => {
      try {
        setIsLoading(true)
        const cards = await getAllUserCards()
        console.log("Tarjetas cargadas:", cards)
        setAllCards(cards || [])
      } catch (error) {
        console.error("Error cargando tarjetas:", error)
        setAllCards([])
      } finally {
        setIsLoading(false)
      }
    }
    loadCards()
  }, [])

  const filteredCards = Array.isArray(allCards) ? allCards.filter(
    (item) =>
      item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.card?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.card?.apellidoPaterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.card?.apellidoMaterno?.toLowerCase().includes(searchTerm.toLowerCase()),
  ) : []

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
                          <h3 className="text-2xl font-bold text-neutral-900">
                            {selectedCard.card.name} {selectedCard.card.apellidoPaterno} {selectedCard.card.apellidoMaterno}
                          </h3>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-semibold">Email:</span> {selectedCard.email}
                            </p>
                            <p>
                              <span className="font-semibold">Correo Electrónico:</span> {selectedCard.card.correoElectronico}
                            </p>
                            <p>
                              <span className="font-semibold">Teléfono:</span> {selectedCard.card.telefono}
                            </p>
                            <p>
                              <span className="font-semibold">Sexo:</span> {selectedCard.card.sexo}
                            </p>
                            <p>
                              <span className="font-semibold">Edad:</span> {selectedCard.card.edad}
                            </p>
                            <p>
                              <span className="font-semibold">Sección:</span> {selectedCard.card.seccion}
                            </p>
                            <p>
                              <span className="font-semibold">Dirección:</span> {selectedCard.card.calleNumero}
                            </p>
                            <p>
                              <span className="font-semibold">Colonia:</span> {selectedCard.card.colonia}
                            </p>
                            <p>
                              <span className="font-semibold">Municipio:</span> {selectedCard.card.municipio}
                            </p>
                            <p>
                              <span className="font-semibold">Estado:</span> {selectedCard.card.estado}
                            </p>
                            <p>
                              <span className="font-semibold">Referente:</span> {selectedCard.card.referente}
                            </p>
                            <p>
                              <span className="font-semibold">Necesidad:</span> {selectedCard.card.necesidad}
                            </p>
                            <p>
                              <span className="font-semibold">Buzón:</span> {selectedCard.card.buzon}
                            </p>
                            {selectedCard.card.seguimientoBuzon && (
                              <p>
                                <span className="font-semibold">Seguimiento Buzón:</span> {selectedCard.card.seguimientoBuzon}
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
                  {isLoading ? (
                    <p className="text-center text-neutral-500 py-8">Cargando tarjetas...</p>
                  ) : filteredCards.length === 0 ? (
                    <p className="text-center text-neutral-500 py-8">No se encontraron tarjetas</p>
                  ) : (
                    filteredCards.map((item) => (
                      <Card key={item.email} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {item.card.name} {item.card.apellidoPaterno} {item.card.apellidoMaterno}
                            </h3>
                            <p className="text-sm text-neutral-600">{item.email}</p>
                            <p className="text-sm text-neutral-600">Sección: {item.card.seccion}</p>
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
