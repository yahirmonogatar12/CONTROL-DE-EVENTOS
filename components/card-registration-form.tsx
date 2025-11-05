"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"

export function CardRegistrationForm() {
  const { registerCard } = useAuth()
  const [date, setDate] = useState<Date>(new Date())

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fullName = `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`.trim()
    registerCard({
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
    
    // Resetear formulario
    setFormData({
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
  }

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold text-neutral-900">Registro de Tarjeta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Referente */}
          <div className="space-y-2">
            <Label htmlFor="referente" className="text-sm md:text-base font-medium text-neutral-900">
              Referente <span className="text-red-500">*</span>
            </Label>
            <Input
              id="referente"
              placeholder="Nombre de quien refiere"
              value={formData.referente}
              onChange={(e) => setFormData({ ...formData, referente: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm md:text-base font-medium text-neutral-900">
              NOMBRE <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Tu respuesta"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Apellido Paterno */}
          <div className="space-y-2">
            <Label htmlFor="apellidoPaterno" className="text-sm md:text-base font-medium text-neutral-900">
              APELLIDO PATERNO <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apellidoPaterno"
              placeholder="Tu respuesta"
              value={formData.apellidoPaterno}
              onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Apellido Materno */}
          <div className="space-y-2">
            <Label htmlFor="apellidoMaterno" className="text-sm md:text-base font-medium text-neutral-900">
              Apellido materno <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apellidoMaterno"
              placeholder="Tu respuesta"
              value={formData.apellidoMaterno}
              onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-sm md:text-base font-medium text-neutral-900">
              Teléfono <span className="text-red-500">*</span>
            </Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="10 dígitos"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Correo electrónico */}
          <div className="space-y-2">
            <Label htmlFor="correoElectronico" className="text-sm md:text-base font-medium text-neutral-900">
              Correo electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="correoElectronico"
              type="email"
              placeholder="ejemplo@correo.com"
              value={formData.correoElectronico}
              onChange={(e) => setFormData({ ...formData, correoElectronico: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Calle y número */}
          <div className="space-y-2">
            <Label htmlFor="calleNumero" className="text-sm md:text-base font-medium text-neutral-900">
              Calle y número <span className="text-red-500">*</span>
            </Label>
            <Input
              id="calleNumero"
              placeholder="Ej: Av. Principal 123"
              value={formData.calleNumero}
              onChange={(e) => setFormData({ ...formData, calleNumero: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Colonia */}
          <div className="space-y-2">
            <Label htmlFor="colonia" className="text-sm md:text-base font-medium text-neutral-900">
              Colonia <span className="text-red-500">*</span>
            </Label>
            <Input
              id="colonia"
              placeholder="Tu respuesta"
              value={formData.colonia}
              onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Municipio */}
          <div className="space-y-2">
            <Label htmlFor="municipio" className="text-sm md:text-base font-medium text-neutral-900">
              Municipio <span className="text-red-500">*</span>
            </Label>
            <Input
              id="municipio"
              placeholder="Tu respuesta"
              value={formData.municipio}
              onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado" className="text-sm md:text-base font-medium text-neutral-900">
              Estado <span className="text-red-500">*</span>
            </Label>
            <Input
              id="estado"
              placeholder="Tu respuesta"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Edad */}
          <div className="space-y-2">
            <Label htmlFor="edad" className="text-sm md:text-base font-medium text-neutral-900">
              Edad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edad"
              type="number"
              placeholder="Años"
              value={formData.edad}
              onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              min="1"
              max="150"
              required
            />
          </div>

          {/* Sexo */}
          <div className="space-y-3">
            <Label className="text-sm md:text-base font-medium text-neutral-900">
              Sexo <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.sexo}
              onValueChange={(value) => setFormData({ ...formData, sexo: value })}
              className="space-y-2"
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Masculino" id="masculino" className="w-4 h-4 md:w-5 md:h-5" />
                <Label htmlFor="masculino" className="text-sm md:text-base font-normal cursor-pointer">
                  Masculino
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Femenino" id="femenino" className="w-4 h-4 md:w-5 md:h-5" />
                <Label htmlFor="femenino" className="text-sm md:text-base font-normal cursor-pointer">
                  Femenino
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Otro" id="otro" className="w-4 h-4 md:w-5 md:h-5" />
                <Label htmlFor="otro" className="text-sm md:text-base font-normal cursor-pointer">
                  Otro
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sección */}
          <div className="space-y-2">
            <Label htmlFor="seccion" className="text-sm md:text-base font-medium text-neutral-900">
              Sección <span className="text-red-500">*</span>
            </Label>
            <Input
              id="seccion"
              placeholder="Tu respuesta"
              value={formData.seccion}
              onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Necesidad */}
          <div className="space-y-2">
            <Label htmlFor="necesidad" className="text-sm md:text-base font-medium text-neutral-900">
              Necesidad <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="necesidad"
              placeholder="Describe la necesidad"
              value={formData.necesidad}
              onChange={(e) => setFormData({ ...formData, necesidad: e.target.value })}
              className="min-h-[80px] text-sm md:text-base resize-none"
              required
            />
          </div>

          {/* Buzón */}
          <div className="space-y-2">
            <Label htmlFor="buzon" className="text-sm md:text-base font-medium text-neutral-900">
              Buzón <span className="text-red-500">*</span>
            </Label>
            <Input
              id="buzon"
              placeholder="Tu respuesta"
              value={formData.buzon}
              onChange={(e) => setFormData({ ...formData, buzon: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Seguimiento de buzón */}
          <div className="space-y-2">
            <Label htmlFor="seguimientoBuzon" className="text-sm md:text-base font-medium text-neutral-900">
              Seguimiento de buzón <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="seguimientoBuzon"
              placeholder="Seguimiento del buzón"
              value={formData.seguimientoBuzon}
              onChange={(e) => setFormData({ ...formData, seguimientoBuzon: e.target.value })}
              className="min-h-[80px] text-sm md:text-base resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10 md:h-12 text-sm md:text-base font-medium bg-neutral-900 hover:bg-neutral-800 text-white"
          >
            Capturar Tarjeta
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
