"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRCodeSVG } from "qrcode.react"
import { useAuth, type Event } from "@/lib/auth-context"
import { Download, Trash2, Users, Copy, Check, Camera } from "lucide-react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RegisterWithCodeDialog } from "@/components/register-with-code-dialog"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const { user, deleteEvent, registerAttendance } = useAuth()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const isAdmin = user?.role === "admin" || user?.role === "global-admin"

  const downloadQRCode = () => {
    const canvas = document.getElementById(`qr-${event.id}`) as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `evento-${event.title.replace(/\s+/g, "-")}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const handleRegister = () => {
    // Abrir el diálogo con el escáner QR activado
    setShowRegisterDialog(true)
  }

  const handleDelete = () => {
    deleteEvent(event.id)
    setShowDeleteDialog(false)
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
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {isAdmin && (
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <QRCodeSVG value={event.qrCode} size={80} id={`qr-preview-${event.id}`} />
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg md:text-xl font-semibold text-neutral-900 mb-2">{event.title}</h3>
              <p className="text-sm md:text-base text-neutral-600 mb-1">{event.date}</p>
              <p className="text-sm md:text-base text-neutral-600">{event.location}</p>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asistentes al Evento</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {event.attendees.length === 0 ? (
              <p className="text-center text-neutral-600">No hay asistentes registrados aún</p>
            ) : (
              <div className="space-y-2">
                {event.attendees.map((email, index) => (
                  <div key={email} className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-sm font-medium">
                      {index + 1}. {email}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
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
