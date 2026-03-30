"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, CreditCard } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface AdminCardFormDialogProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  userName: string
  onSuccess?: () => void
}

interface CardFormData {
  referente: string
  name: string
  apellidoPaterno: string
  apellidoMaterno: string
  telefono: string
  correoElectronico: string
  calleNumero: string
  colonia: string
  municipio: string
  estado: string
  edad: string
  sexo: string
  seccion: string
  buzon: string
  necesidad: string
}

export function AdminCardFormDialog({ isOpen, onClose, userEmail, userName, onSuccess }: AdminCardFormDialogProps) {
  const { getUserCard, registerCard } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [hasExistingCard, setHasExistingCard] = useState(false)

  const [formData, setFormData] = useState<CardFormData>({
    referente: "",
    name: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    telefono: "",
    correoElectronico: userEmail,
    calleNumero: "",
    colonia: "",
    municipio: "",
    estado: "",
    edad: "",
    sexo: "",
    seccion: "",
    buzon: "",
    necesidad: "",
  })

  useEffect(() => {
    if (isOpen) {
      loadExistingCard()
    }
  }, [isOpen, userEmail])

  const loadExistingCard = async () => {
    setIsLoading(true)
    setError("")
    try {
      const existingCard = await getUserCard(userEmail)
      if (existingCard) {
        setHasExistingCard(true)
        setFormData({
          referente: existingCard.referente || "",
          name: existingCard.name || "",
          apellidoPaterno: existingCard.apellidoPaterno || "",
          apellidoMaterno: existingCard.apellidoMaterno || "",
          telefono: existingCard.telefono || "",
          correoElectronico: existingCard.correoElectronico || userEmail,
          calleNumero: existingCard.calleNumero || "",
          colonia: existingCard.colonia || "",
          municipio: existingCard.municipio || "",
          estado: existingCard.estado || "",
          edad: existingCard.edad?.toString() || "",
          sexo: existingCard.sexo || "",
          seccion: existingCard.seccion || "",
          buzon: existingCard.buzon || "",
          necesidad: existingCard.necesidad || "",
        })
      } else {
        setHasExistingCard(false)
        setFormData({
          ...formData,
          correoElectronico: userEmail,
        })
      }
    } catch (err) {
      console.error("Error loading card:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsSaving(true)

    try {
      const cardData = {
        referente: formData.referente,
        name: formData.name,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
        telefono: formData.telefono,
        correoElectronico: userEmail,
        calleNumero: formData.calleNumero,
        colonia: formData.colonia,
        municipio: formData.municipio,
        estado: formData.estado,
        edad: Number.parseInt(formData.edad) || 0,
        sexo: formData.sexo,
        seccion: formData.seccion,
        buzon: formData.buzon,
        necesidad: formData.necesidad,
        seguimientoBuzon: "", // Campo requerido por CardData
      }

      await registerCard(cardData)
      
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err?.message || "Error al guardar la tarjeta")
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      onClose()
      setError("")
      setSuccess(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {hasExistingCard ? "Editar" : "Crear"} Tarjeta de {userName}
          </DialogTitle>
          <DialogDescription>
            {hasExistingCard
              ? "Modifica la información de la tarjeta del usuario"
              : "Completa todos los campos para crear la tarjeta del usuario"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2">Cargando información...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sección: Información del Referente */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-neutral-700">Información del Referente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="referente" className="text-sm">
                    Nombre del Referente *
                  </Label>
                  <Input
                    id="referente"
                    value={formData.referente}
                    onChange={(e) => setFormData({ ...formData, referente: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sección: Información Personal */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-neutral-700">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">
                    Nombre *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidoPaterno" className="text-sm">
                    Apellido Paterno *
                  </Label>
                  <Input
                    id="apellidoPaterno"
                    value={formData.apellidoPaterno}
                    onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidoMaterno" className="text-sm">
                    Apellido Materno *
                  </Label>
                  <Input
                    id="apellidoMaterno"
                    value={formData.apellidoMaterno}
                    onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edad" className="text-sm">
                    Edad *
                  </Label>
                  <Input
                    id="edad"
                    type="number"
                    value={formData.edad}
                    onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sexo" className="text-sm">
                    Sexo *
                  </Label>
                  <Input
                    id="sexo"
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    placeholder="Ej: Masculino/Femenino"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seccion" className="text-sm">
                    Sección *
                  </Label>
                  <Input
                    id="seccion"
                    value={formData.seccion}
                    onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sección: Contacto */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-neutral-700">Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-sm">
                    Teléfono *
                  </Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correoElectronico" className="text-sm">
                    Correo Electrónico
                  </Label>
                  <Input id="correoElectronico" type="email" value={userEmail} disabled className="bg-neutral-100" />
                </div>
              </div>
            </div>

            {/* Sección: Dirección */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-neutral-700">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="calleNumero" className="text-sm">
                    Calle y Número *
                  </Label>
                  <Input
                    id="calleNumero"
                    value={formData.calleNumero}
                    onChange={(e) => setFormData({ ...formData, calleNumero: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colonia" className="text-sm">
                    Colonia *
                  </Label>
                  <Input
                    id="colonia"
                    value={formData.colonia}
                    onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipio" className="text-sm">
                    Municipio *
                  </Label>
                  <Input
                    id="municipio"
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-sm">
                    Estado *
                  </Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sección: Otros */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-neutral-700">Otros</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="buzon" className="text-sm">
                    Buzón *
                  </Label>
                  <Input
                    id="buzon"
                    value={formData.buzon}
                    onChange={(e) => setFormData({ ...formData, buzon: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="necesidad" className="text-sm">
                    Necesidad *
                  </Label>
                  <Textarea
                    id="necesidad"
                    value={formData.necesidad}
                    onChange={(e) => setFormData({ ...formData, necesidad: e.target.value })}
                    className="min-h-[60px] resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert className="border-red-500 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50">
                <AlertDescription className="text-green-800">
                  ¡Tarjeta {hasExistingCard ? "actualizada" : "creada"} exitosamente!
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {hasExistingCard ? "Actualizar" : "Crear"} Tarjeta
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
