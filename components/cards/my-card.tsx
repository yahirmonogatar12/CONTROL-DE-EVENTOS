"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/lib/auth-context"
import { QRCodeSVG } from "qrcode.react"
import { Edit2, Save, X } from "lucide-react"
import { toast } from "sonner"

export function MyCard() {
  const { user, updateCard } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    referente: "",
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    telefono: "",
    correoElectronico: "",
    calleNumero: "",
    colonia: "",
    municipio: "",
    estado: "",
    edad: "",
    sexo: "",
    seccion: "",
    necesidad: "",
    buzon: "",
    seguimientoBuzon: "",
  })

  if (!user?.card) return null

  const { referente, name, apellidoPaterno, apellidoMaterno, telefono, correoElectronico, 
          calleNumero, colonia, municipio, estado, edad, sexo, seccion, necesidad, 
          buzon, seguimientoBuzon } = user.card

  // Generate QR code data
  const qrData = JSON.stringify({
    nombre: name,
    telefono,
    municipio,
    seccion,
  })

  const handleEdit = () => {
    setFormData({
      referente: referente || "",
      nombre: name?.split(' ')[0] || "",
      apellidoPaterno: apellidoPaterno || "",
      apellidoMaterno: apellidoMaterno || "",
      telefono: telefono || "",
      correoElectronico: correoElectronico || "",
      calleNumero: calleNumero || "",
      colonia: colonia || "",
      municipio: municipio || "",
      estado: estado || "",
      edad: edad?.toString() || "",
      sexo: sexo || "",
      seccion: seccion || "",
      necesidad: necesidad || "",
      buzon: buzon || "",
      seguimientoBuzon: seguimientoBuzon || "",
    })
    setIsEditing(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const fullName = `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`.trim()
      
      await updateCard({
        referente: formData.referente,
        name: fullName,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
        telefono: formData.telefono,
        correoElectronico: formData.correoElectronico,
        calleNumero: formData.calleNumero,
        colonia: formData.colonia,
        municipio: formData.municipio,
        estado: formData.estado,
        edad: formData.edad ? parseInt(formData.edad) : 0,
        sexo: formData.sexo,
        seccion: formData.seccion,
        necesidad: formData.necesidad,
        buzon: formData.buzon,
        seguimientoBuzon: formData.seguimientoBuzon,
      })
      
      toast.success("✅ Tarjeta actualizada exitosamente")
      setIsEditing(false)
    } catch (error) {
      console.error("Error al actualizar tarjeta:", error)
      toast.error("❌ Error al actualizar la tarjeta. Intenta de nuevo.")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold text-neutral-900">Actualizar Datos de Mi Tarjeta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Referente */}
            <div className="space-y-2">
              <Label htmlFor="referente" className="text-sm font-medium">Referente *</Label>
              <Input
                id="referente"
                value={formData.referente}
                onChange={(e) => setFormData({ ...formData, referente: e.target.value })}
                required
              />
            </div>

            {/* Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidoPaterno" className="text-sm font-medium">Apellido paterno *</Label>
                <Input
                  id="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidoMaterno" className="text-sm font-medium">Apellido materno *</Label>
                <Input
                  id="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-sm font-medium">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="correoElectronico" className="text-sm font-medium">Correo electrónico *</Label>
                <Input
                  id="correoElectronico"
                  type="email"
                  value={formData.correoElectronico}
                  onChange={(e) => setFormData({ ...formData, correoElectronico: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calleNumero" className="text-sm font-medium">Calle y número *</Label>
                <Input
                  id="calleNumero"
                  value={formData.calleNumero}
                  onChange={(e) => setFormData({ ...formData, calleNumero: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colonia" className="text-sm font-medium">Colonia *</Label>
                <Input
                  id="colonia"
                  value={formData.colonia}
                  onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="municipio" className="text-sm font-medium">Municipio *</Label>
                <Input
                  id="municipio"
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado" className="text-sm font-medium">Estado *</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edad" className="text-sm font-medium">Edad *</Label>
                <Input
                  id="edad"
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                  min="1"
                  max="150"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sexo *</Label>
                <RadioGroup
                  value={formData.sexo}
                  onValueChange={(value) => setFormData({ ...formData, sexo: value })}
                  className="flex gap-4"
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Masculino" id="masculino" />
                    <Label htmlFor="masculino" className="font-normal cursor-pointer">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Femenino" id="femenino" />
                    <Label htmlFor="femenino" className="font-normal cursor-pointer">Femenino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Otro" id="otro" />
                    <Label htmlFor="otro" className="font-normal cursor-pointer">Otro</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seccion" className="text-sm font-medium">Sección *</Label>
                <Input
                  id="seccion"
                  value={formData.seccion}
                  onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Buzón y seguimiento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buzon" className="text-sm font-medium">Buzón *</Label>
                <Input
                  id="buzon"
                  value={formData.buzon}
                  onChange={(e) => setFormData({ ...formData, buzon: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="necesidad" className="text-sm font-medium">Necesidad *</Label>
                <Textarea
                  id="necesidad"
                  value={formData.necesidad}
                  onChange={(e) => setFormData({ ...formData, necesidad: e.target.value })}
                  className="min-h-[80px]"
                  required
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl md:text-3xl font-bold text-neutral-900">Mi Tarjeta</CardTitle>
        <Button onClick={handleEdit} variant="outline" size="sm">
          <Edit2 className="w-4 h-4 mr-2" />
          Actualizar Datos
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-neutral-200 rounded-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
            <div className="space-y-3 flex-1 w-full">
              <div>
                <p className="text-xs text-neutral-500">Nombre completo</p>
                <h3 className="text-xl md:text-2xl font-bold text-neutral-900 uppercase break-words">{name}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">Referente</p>
                  <p className="text-sm font-medium text-neutral-700">{referente}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Teléfono</p>
                  <p className="text-sm font-medium text-neutral-700">{telefono}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">Edad / Sexo</p>
                  <p className="text-sm font-medium text-neutral-700">{edad} años / {sexo}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Sección</p>
                  <p className="text-sm font-medium text-neutral-700">{seccion}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Dirección</p>
                <p className="text-sm font-medium text-neutral-700">{calleNumero}, {colonia}</p>
                <p className="text-sm font-medium text-neutral-700">{municipio}, {estado}</p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Correo electrónico</p>
                <p className="text-sm font-medium text-neutral-700">{correoElectronico}</p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Buzón</p>
                <p className="text-sm font-medium text-neutral-700">{buzon}</p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Necesidad</p>
                <p className="text-sm text-neutral-700">{necesidad}</p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Seguimiento</p>
                <p className="text-sm text-neutral-700">{seguimientoBuzon}</p>
              </div>
            </div>

            <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-neutral-200 mx-auto md:mx-0">
              <QRCodeSVG value={qrData} size={120} level="H" />
              <p className="text-xs text-center mt-2 text-neutral-500">Código QR</p>
            </div>
          </div>

          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t-2 border-neutral-200">
            <p className="text-lg md:text-xl font-bold text-center text-neutral-900">TARJETA DE REGISTRO</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
