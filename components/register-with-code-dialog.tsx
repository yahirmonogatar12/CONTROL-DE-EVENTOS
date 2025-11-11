"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { CheckCircle, XCircle, Ticket, Camera, Keyboard } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"

interface RegisterWithCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: "manual" | "qr"
}

export function RegisterWithCodeDialog({ open, onOpenChange, initialTab = "manual" }: RegisterWithCodeDialogProps) {
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab)
  const { user, registerAttendanceByCode } = useAuth()
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      stopScanner()
    }
  }, [])

  useEffect(() => {
    if (!open) {
      stopScanner()
      setCode("")
      setStatus("idle")
      setMessage("")
      setActiveTab(initialTab)
    } else {
      // Cuando se abre el diálogo, establecer la pestaña inicial
      setActiveTab(initialTab)
      if (initialTab === "qr") {
        // Iniciar el escáner automáticamente si se abre en modo QR
        setTimeout(() => startScanner(), 300)
      }
    }
  }, [open, initialTab])

  const startScanner = async () => {
    try {
      setIsScanning(true)
      setStatus("idle")
      setMessage("")
      
      // Si ya hay un escáner, limpiarlo primero
      if (scannerRef.current) {
        try {
          await scannerRef.current.clear()
        } catch (e) {
          // Ignorar errores de limpieza
        }
      }
      
      const html5QrCode = new Html5Qrcode("qr-reader")
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR Code successfully scanned
          handleQRCodeScanned(decodedText)
          stopScanner()
        },
        (errorMessage) => {
          // Error scanning, ignore
          // No hacer nada, es normal tener errores mientras escanea
        }
      )
    } catch (err: any) {
      console.error("Error starting scanner:", err)
      setStatus("error")
      
      // Mensajes de error más específicos
      if (err.toString().includes("NotAllowedError") || err.toString().includes("Permission")) {
        setMessage("Permiso de cámara denegado. Por favor, permite el acceso a la cámara en tu navegador.")
      } else if (err.toString().includes("NotFoundError") || err.toString().includes("Camera streaming not supported")) {
        setMessage("No se encontró una cámara disponible. Usa el código manual o prueba en un dispositivo móvil.")
      } else if (err.toString().includes("NotReadableError")) {
        setMessage("La cámara está siendo usada por otra aplicación. Ciérrala e intenta de nuevo.")
      } else {
        setMessage("No se pudo acceder a la cámara. Intenta usar el código manual en su lugar.")
      }
      
      setIsScanning(false)
      scannerRef.current = null
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const scannerState = await scannerRef.current.getState()
        // Solo detener si el escáner está realmente corriendo
        if (scannerState === 2) { // 2 = SCANNING state
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
        scannerRef.current = null
      } catch (err) {
        // Ignorar errores al detener, solo limpiar
        try {
          if (scannerRef.current) {
            scannerRef.current.clear()
            scannerRef.current = null
          }
        } catch (e) {
          // Silenciar errores de limpieza
        }
      }
    }
    setIsScanning(false)
  }

  const handleQRCodeScanned = async (scannedText: string) => {
    // Extract confirmation code from QR
    // QR format: EVENT-{eventId}-{confirmationCode}
    const parts = scannedText.split("-")
    const confirmationCode = parts[parts.length - 1]
    
    if (confirmationCode && user) {
      const success = await registerAttendanceByCode(confirmationCode, user.email)
      
      if (success) {
        setStatus("success")
        setMessage("¡Registro exitoso! Has sido registrado al evento")
        setTimeout(() => {
          onOpenChange(false)
        }, 2000)
      } else {
        setStatus("error")
        setMessage("Código inválido o ya estás registrado en este evento")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setStatus("error")
      setMessage("Debes iniciar sesión para registrarte")
      return
    }

    if (!code.trim()) {
      setStatus("error")
      setMessage("Por favor ingresa un código de confirmación")
      return
    }

    const success = await registerAttendanceByCode(code.toUpperCase().trim(), user.email)
    
    if (success) {
      setStatus("success")
      setMessage("¡Registro exitoso! Has sido registrado al evento")
      setCode("")
      setTimeout(() => {
        onOpenChange(false)
        setStatus("idle")
        setMessage("")
      }, 2000)
    } else {
      setStatus("error")
      setMessage("Código inválido o ya estás registrado en este evento")
    }
  }

  const handleClose = () => {
    stopScanner()
    setCode("")
    setStatus("idle")
    setMessage("")
    setActiveTab(initialTab)
    onOpenChange(false)
  }

  const handleTabChange = (value: string) => {
    if (value === "qr" && !isScanning) {
      setActiveTab(value)
      // Pequeño delay para asegurar que el DOM esté listo
      setTimeout(() => startScanner(), 100)
    } else if (value === "manual") {
      setActiveTab(value)
      // Solo detener si realmente está escaneando
      if (isScanning) {
        stopScanner()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Ticket className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center">Registrarse al Evento</DialogTitle>
          <DialogDescription className="text-center">
            Ingresa el código o escanea el QR proporcionado por el administrador
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="gap-2">
              <Keyboard className="w-4 h-4" />
              Código
            </TabsTrigger>
            <TabsTrigger value="qr" className="gap-2">
              <Camera className="w-4 h-4" />
              Escanear QR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de Confirmación</Label>
                <Input
                  id="code"
                  placeholder="Ej: A1B2C3"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-wider uppercase"
                  autoComplete="off"
                />
                <p className="text-xs text-neutral-500 text-center">
                  El código consta de 6 caracteres alfanuméricos
                </p>
              </div>

              {status !== "idle" && (
                <div className={`rounded-lg border p-4 ${status === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <div className="flex items-center gap-2">
                    {status === "success" ? (
                      <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                    )}
                    <p className={`text-sm ${status === "success" ? "text-green-800" : "text-red-800"}`}>
                      {message}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={status === "success"}
                >
                  Registrar
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4 mt-4">
            <div className="space-y-4">
              {!isScanning && status === "idle" && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 text-center">
                    💡 <strong>Nota:</strong> La cámara funciona mejor en dispositivos móviles con HTTPS. 
                    Si hay problemas, usa la pestaña "Código" para registrarte manualmente.
                  </p>
                </div>
              )}
              
              <div 
                id="qr-reader" 
                className="w-full rounded-lg overflow-hidden border-2 border-blue-200"
                style={{ minHeight: "300px" }}
              />
              
              {!isScanning && (
                <Button
                  onClick={startScanner}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Iniciar Cámara
                </Button>
              )}

              {isScanning && (
                <div className="text-center">
                  <p className="text-sm text-neutral-600 mb-3">
                    Apunta la cámara al código QR del evento
                  </p>
                  <Button
                    onClick={stopScanner}
                    variant="outline"
                    className="w-full"
                  >
                    Detener Cámara
                  </Button>
                </div>
              )}

              {status !== "idle" && (
                <div className={`rounded-lg border p-4 ${status === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {status === "success" ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                      )}
                      <p className={`text-sm ${status === "success" ? "text-green-800" : "text-red-800"}`}>
                        {message}
                      </p>
                    </div>
                    {status === "error" && (
                      <Button
                        onClick={() => {
                          setActiveTab("manual")
                          setStatus("idle")
                          setMessage("")
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full bg-white hover:bg-neutral-50"
                      >
                        <Keyboard className="w-4 h-4 mr-2" />
                        Usar Código Manual
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
