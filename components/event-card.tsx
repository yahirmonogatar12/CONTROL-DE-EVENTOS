"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRCodeSVG } from "qrcode.react"
import { useAuth, type Event } from "@/lib/auth-context"
import { Download, Trash2, Users, Copy, Check, Camera, MapPin, ExternalLink, User, Phone, MapPinned, Hash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { RegisterWithCodeDialog } from "@/components/register-with-code-dialog"
import { EmbeddedMap } from "@/components/embedded-map"
import { Separator } from "@/components/ui/separator"

interface EventCardProps {
  event: Event
}

// Helper para extraer coordenadas de la ubicación
function parseLocation(location: string): { address: string; lat?: number; lng?: number } {
  if (location.includes('|')) {
    const [address, coords] = location.split('|')
    const [lat, lng] = coords.split(',').map(Number)
    return { address, lat, lng }
  }
  return { address: location }
}

export function EventCard({ event }: EventCardProps) {
  const { user, deleteEvent, registerAttendance, getEventAttendeesDetailed, suspendEvent } = useAuth()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState("")
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [showCardDialog, setShowCardDialog] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null)
  const [attendeesDetailed, setAttendeesDetailed] = useState<any[]>([])
  const [codeCopied, setCodeCopied] = useState(false)
  const isAdmin = user?.role === "admin" || user?.role === "global-admin"

  useEffect(() => {
    if (showAttendanceDialog && isAdmin) {
      loadDetailedAttendees()
    }
  }, [showAttendanceDialog])

  const loadDetailedAttendees = async () => {
    const detailed = await getEventAttendeesDetailed(event.id)
    setAttendeesDetailed(detailed)
  }

  const handleViewCard = (attendee: any) => {
    setSelectedAttendee(attendee)
    setShowCardDialog(true)
  }

  const downloadQRCode = () => {
    const svg = document.getElementById(`qr-${event.id}`) as unknown as SVGElement
    if (svg) {
      // Convertir SVG a Canvas para poder descargar como PNG
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const svgData = new XMLSerializer().serializeToString(svg)
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const pngUrl = canvas.toDataURL("image/png")
        
        const downloadLink = document.createElement("a")
        downloadLink.href = pngUrl
        downloadLink.download = `evento-${event.title.replace(/\s+/g, "-")}.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
      }
      
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    }
  }

  const handleRegister = () => {
    // Verificar si el usuario tiene tarjeta
    if (!user?.card) {
      alert("Debes registrar tu tarjeta antes de poder asistir a eventos")
      return
    }
    // Abrir el diálogo con el escáner QR activado
    setShowRegisterDialog(true)
  }

  const handleDelete = async () => {
    const result = await deleteEvent(event.id)
    
    if (!result.success && result.hasAttendees) {
      // Mostrar mensaje y opción de suspender
      setDeleteMessage(result.message)
      setShowDeleteDialog(false)
      setShowSuspendDialog(true)
    } else if (result.success) {
      setShowDeleteDialog(false)
    }
  }

  const handleSuspend = async () => {
    await suspendEvent(event.id)
    setShowSuspendDialog(false)
  }

  const copyCodeToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(event.confirmationCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = event.confirmationCode
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCodeCopied(true)
        setTimeout(() => setCodeCopied(false), 2000)
      } catch (e) {
        console.error('Error al copiar con fallback:', e)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <>
      <Card className="bg-white shadow-sm border border-neutral-200">
        <CardContent className="p-4 md:p-6">
          {event.image_url && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-48 md:h-64 object-cover"
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {isAdmin && (
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <QRCodeSVG value={event.qrCode} size={80} id={`qr-preview-${event.id}`} />
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                <h3 className="text-lg md:text-xl font-semibold text-neutral-900">{event.title}</h3>
                {event.suspended && isAdmin && (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                    Suspendido
                  </Badge>
                )}
              </div>
              <p className="text-sm md:text-base text-neutral-600 mb-1">{event.date}</p>
              
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm md:text-base text-neutral-600">{parseLocation(event.location).address}</p>
                  {parseLocation(event.location).lat && (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
                      onClick={() => {
                        const { lat, lng } = parseLocation(event.location)
                        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver en Google Maps
                    </Button>
                  )}
                </div>
              </div>
              
              {event.description && <p className="text-sm text-neutral-500 mt-2">{event.description}</p>}
              
              {isAdmin && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-left">
                      <p className="text-xs font-medium text-blue-900 mb-1">Código de Confirmación</p>
                      <p className="text-xl font-bold font-mono tracking-wider text-blue-600">
                        {event.confirmationCode}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyCodeToClipboard}
                      className="flex-shrink-0"
                    >
                      {codeCopied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Comparte este código con los usuarios para que se registren
                  </p>
                </div>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAttendanceDialog(true)}
                className="flex-1 sm:flex-none"
              >
                <Users className="w-4 h-4 mr-2" />
                Asistentes ({event.attendees.length})
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowQRDialog(true)} className="flex-1 sm:flex-none">
                <Download className="w-4 h-4 mr-2" />
                Descargar QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          )}

          {/* Mapa embebido para TODOS los usuarios cuando hay coordenadas */}
          {parseLocation(event.location).lat && (
            <div className="mb-3">
              <EmbeddedMap 
                latitude={parseLocation(event.location).lat!} 
                longitude={parseLocation(event.location).lng!}
                title={`Ubicación: ${event.title}`}
                height="250px"
              />
            </div>
          )}

          {!isAdmin && (
            <Button
              onClick={handleRegister}
              disabled={user ? event.attendees.includes(user.email) : false}
              className="w-full h-10 md:h-12 text-sm md:text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 gap-2"
            >
              {user && event.attendees.includes(user.email) ? (
                "Ya Registrado"
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  Registrar
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El evento "{event.title}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No se puede eliminar el evento</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspend} className="bg-orange-600 hover:bg-orange-700">
              Suspender Evento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Código QR del Evento</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <QRCodeSVG value={event.qrCode} size={200} id={`qr-${event.id}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-900 mb-1">{event.title}</p>
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 mt-3">
                <p className="text-xs font-medium text-blue-900 mb-1">Código de Confirmación</p>
                <p className="text-lg font-bold font-mono tracking-wider text-blue-600">
                  {event.confirmationCode}
                </p>
              </div>
            </div>
            <Button onClick={downloadQRCode} className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Descargar como Imagen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Asistentes al Evento</DialogTitle>
            <DialogDescription>
              {attendeesDetailed.length} {attendeesDetailed.length === 1 ? 'persona registrada' : 'personas registradas'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {attendeesDetailed.length === 0 ? (
              <p className="text-center text-neutral-600 py-8">No hay asistentes registrados aún</p>
            ) : (
              <div className="space-y-3">
                {attendeesDetailed.map((attendee, index) => (
                  <div key={attendee.user_email} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <h4 className="text-base font-semibold text-neutral-900">
                            {attendee.user_name}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {attendee.referente && (
                            <div className="flex items-center gap-1.5 text-neutral-600">
                              <User className="w-4 h-4" />
                              <span className="text-xs text-neutral-500">Ref:</span>
                              <span>{attendee.referente}</span>
                            </div>
                          )}
                          
                          {attendee.telefono && (
                            <div className="flex items-center gap-1.5 text-neutral-600">
                              <Phone className="w-4 h-4" />
                              <span>{attendee.telefono}</span>
                            </div>
                          )}
                          
                          {attendee.municipio && (
                            <div className="flex items-center gap-1.5 text-neutral-600">
                              <MapPinned className="w-4 h-4" />
                              <span>{attendee.municipio}</span>
                            </div>
                          )}
                          
                          {attendee.seccion && (
                            <div className="flex items-center gap-1.5 text-neutral-600">
                              <Hash className="w-4 h-4" />
                              <span className="text-xs text-neutral-500">Sec:</span>
                              <span>{attendee.seccion}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-neutral-500">
                          Registrado: {new Date(attendee.attended_at).toLocaleString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCard(attendee)}
                        className="w-full sm:w-auto"
                      >
                        Ver Tarjeta
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver tarjeta completa */}
      <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tarjeta del Asistente</DialogTitle>
          </DialogHeader>
          {selectedAttendee && (
            <div className="space-y-4 py-4">
              <div className="text-center pb-4 border-b">
                <h3 className="text-xl font-bold text-neutral-900">{selectedAttendee.user_name}</h3>
                <p className="text-sm text-neutral-500">{selectedAttendee.user_email}</p>
              </div>

              <div className="space-y-3">
                {selectedAttendee.referente && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Referente</p>
                    <p className="text-sm text-neutral-900">{selectedAttendee.referente}</p>
                  </div>
                )}

                {selectedAttendee.telefono && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Teléfono</p>
                    <p className="text-sm text-neutral-900">{selectedAttendee.telefono}</p>
                  </div>
                )}

                {selectedAttendee.correo_electronico && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Correo</p>
                    <p className="text-sm text-neutral-900">{selectedAttendee.correo_electronico}</p>
                  </div>
                )}

                <Separator />

                {selectedAttendee.municipio && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Municipio</p>
                    <p className="text-sm text-neutral-900">{selectedAttendee.municipio}</p>
                  </div>
                )}

                {selectedAttendee.seccion && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Sección</p>
                    <p className="text-sm text-neutral-900">{selectedAttendee.seccion}</p>
                  </div>
                )}

                {(selectedAttendee.edad || selectedAttendee.sexo) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedAttendee.edad && (
                      <div>
                        <p className="text-xs font-medium text-neutral-500">Edad</p>
                        <p className="text-sm text-neutral-900">{selectedAttendee.edad} años</p>
                      </div>
                    )}
                    {selectedAttendee.sexo && (
                      <div>
                        <p className="text-xs font-medium text-neutral-500">Sexo</p>
                        <p className="text-sm text-neutral-900">{selectedAttendee.sexo}</p>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-xs font-medium text-neutral-500">Fecha de Registro</p>
                  <p className="text-sm text-neutral-900">
                    {new Date(selectedAttendee.attended_at).toLocaleString('es-MX', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RegisterWithCodeDialog 
        open={showRegisterDialog} 
        onOpenChange={setShowRegisterDialog}
        initialTab="qr"
      />
    </>
  )
}
