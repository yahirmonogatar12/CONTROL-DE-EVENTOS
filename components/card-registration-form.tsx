"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function CardRegistrationForm() {
  const { registerCard } = useAuth()
  const [date, setDate] = useState<Date>(new Date())

  const [formData, setFormData] = useState({
    folioNo: "",
    distrito: "",
    seccion: "",
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    curp: "", // Added CURP field
    sexo: "",
    calleNumero: "",
    colonia: "",
    telefono: "",
    programas: [] as string[],
    responsableCaptura: "",
    cancelada: false,
    observaciones: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fullName = `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`.trim()
    registerCard({
      name: fullName,
      apellidoPaterno: formData.apellidoPaterno,
      apellidoMaterno: formData.apellidoMaterno,
      curp: formData.curp, // Include CURP in card data
      sexo: formData.sexo,
      age: formData.distrito,
      address: `${formData.calleNumero}, ${formData.colonia}, Sección ${formData.seccion}`,
      phone: formData.telefono,
      folioNo: formData.folioNo,
      distrito: formData.distrito,
      seccion: formData.seccion,
      calleNumero: formData.calleNumero,
      colonia: formData.colonia,
      programas: formData.programas,
      fecha: format(date, "dd MMMM yy", { locale: es }).toUpperCase(),
      responsableCaptura: formData.responsableCaptura,
      cancelada: formData.cancelada,
      observaciones: formData.observaciones,
    })
  }

  const handleProgramaToggle = (programa: string) => {
    setFormData((prev) => ({
      ...prev,
      programas: prev.programas.includes(programa)
        ? prev.programas.filter((p) => p !== programa)
        : [...prev.programas, programa],
    }))
  }

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold text-neutral-900">Registro de Tarjeta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Folio No. */}
          <div className="space-y-2">
            <Label htmlFor="folioNo" className="text-sm md:text-base font-medium text-neutral-900">
              FOLIO NO. <span className="text-red-500">*</span>
            </Label>
            <Input
              id="folioNo"
              placeholder="Tu respuesta"
              value={formData.folioNo}
              onChange={(e) => setFormData({ ...formData, folioNo: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Distrito */}
          <div className="space-y-2">
            <Label htmlFor="distrito" className="text-sm md:text-base font-medium text-neutral-900">
              DISTRITO <span className="text-red-500">*</span>
            </Label>
            <Input
              id="distrito"
              placeholder="Tu respuesta"
              value={formData.distrito}
              onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
              required
            />
          </div>

          {/* Sección */}
          <div className="space-y-2">
            <Label htmlFor="seccion" className="text-sm md:text-base font-medium text-neutral-900">
              SECCION <span className="text-red-500">*</span>
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
              APELLIDO MATERNO <span className="text-red-500">*</span>
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

          {/* CURP */}
          <div className="space-y-2">
            <Label htmlFor="curp" className="text-sm md:text-base font-medium text-neutral-900">
              CURP <span className="text-red-500">*</span>
            </Label>
            <Input
              id="curp"
              placeholder="Tu respuesta"
              value={formData.curp}
              onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase() })}
              className="h-10 md:h-12 text-sm md:text-base uppercase"
              maxLength={18}
              required
            />
          </div>

          {/* Sexo */}
          <div className="space-y-3">
            <Label className="text-sm md:text-base font-medium text-neutral-900">
              SEXO <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.sexo}
              onValueChange={(value) => setFormData({ ...formData, sexo: value })}
              className="space-y-2"
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="HOMBRE" id="hombre" className="w-4 h-4 md:w-5 md:h-5" />
                <Label htmlFor="hombre" className="text-sm md:text-base font-normal cursor-pointer">
                  HOMBRE
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MUJER" id="mujer" className="w-4 h-4 md:w-5 md:h-5" />
                <Label htmlFor="mujer" className="text-sm md:text-base font-normal cursor-pointer">
                  MUJER
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Calle y Número */}
          <div className="space-y-2">
            <Label htmlFor="calleNumero" className="text-sm md:text-base font-medium text-neutral-900">
              CALLE Y NUMERO
            </Label>
            <Input
              id="calleNumero"
              placeholder="Tu respuesta"
              value={formData.calleNumero}
              onChange={(e) => setFormData({ ...formData, calleNumero: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
            />
          </div>

          {/* Colonia */}
          <div className="space-y-2">
            <Label htmlFor="colonia" className="text-sm md:text-base font-medium text-neutral-900">
              COLONIA
            </Label>
            <Input
              id="colonia"
              placeholder="Tu respuesta"
              value={formData.colonia}
              onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-sm md:text-base font-medium text-neutral-900">
              TELEFONO
            </Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="Tu respuesta"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
            />
          </div>

          {/* Sistema Social Bienestar */}
          <div className="space-y-3">
            <Label className="text-sm md:text-base font-medium text-neutral-900">SISTEMA SOCIAL BIENESTAR</Label>
            <div className="space-y-2">
              {["SALUD", "EDUCACION", "VIVIENDA", "EMPLEO"].map((programa) => (
                <div key={programa} className="flex items-center space-x-2">
                  <Checkbox
                    id={`programa-${programa}`}
                    checked={formData.programas.includes(programa)}
                    onCheckedChange={() => handleProgramaToggle(programa)}
                  />
                  <Label htmlFor={`programa-${programa}`} className="text-sm md:text-base font-normal cursor-pointer">
                    {programa}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label className="text-sm md:text-base font-medium text-neutral-900">FECHA</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-10 md:h-12 justify-start text-left font-normal text-sm md:text-base",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Responsable de Captura */}
          <div className="space-y-2">
            <Label htmlFor="responsableCaptura" className="text-sm md:text-base font-medium text-neutral-900">
              RESPONSABLE DE CAPTURA
            </Label>
            <Input
              id="responsableCaptura"
              placeholder="Tu respuesta"
              value={formData.responsableCaptura}
              onChange={(e) => setFormData({ ...formData, responsableCaptura: e.target.value })}
              className="h-10 md:h-12 text-sm md:text-base"
            />
          </div>

          {/* Cancelada */}
          <div className="space-y-3">
            <Label className="text-sm md:text-base font-medium text-neutral-900">CANCELADA</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cancelada"
                checked={formData.cancelada}
                onCheckedChange={(checked) => setFormData({ ...formData, cancelada: checked as boolean })}
              />
              <Label htmlFor="cancelada" className="text-sm md:text-base font-normal cursor-pointer">
                SI
              </Label>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm md:text-base font-medium text-neutral-900">
              OBSERVACIONES
            </Label>
            <Textarea
              id="observaciones"
              placeholder="Tu respuesta"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="min-h-[80px] text-sm md:text-base resize-none"
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
