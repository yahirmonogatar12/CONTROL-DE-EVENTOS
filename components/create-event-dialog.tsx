"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MapPin, Search } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { EmbeddedMap } from "@/components/embedded-map"
import { LocationPicker } from "@/components/location-picker"

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean)=> void
}

export function CreateEventDialog({ open, onOpenChange }: CreateEventDialogProps) {
  const { createEvent } = useAuth()
  const [date, setDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    latitude: null as number | null,
    longitude: null as number | null,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setFormData({
      ...formData,
      location: location.address.split(',')[0], // Usar solo la primera parte de la dirección
      latitude: location.lat,
      longitude: location.lng
    })
  }

  const handleSearchLocation = async () => {
    const query = formData.location
    if (!query) return
    
    setIsSearching(true)
    
    try {
      // Usar Nominatim de OpenStreetMap para geocodificación (gratis, sin API key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'EventRegistrationApp/1.0'
          }
        }
      )
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        setFormData({
          ...formData,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        })
        alert(`✓ Ubicación encontrada: ${result.display_name}`)
      } else {
        alert("No se encontró la ubicación. Intenta ser más específico o usa 'Mi Ubicación'")
      }
    } catch (error) {
      console.error("Error buscando ubicación:", error)
      alert("Error al buscar la ubicación. Intenta de nuevo.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            location: formData.location || `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          })
          setIsSearching(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("No se pudo obtener la ubicación actual")
          setIsSearching(false)
        }
      )
    } else {
      alert("Tu navegador no soporta geolocalización")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Construir la ubicación con coordenadas si están disponibles
    let locationString = formData.location
    if (formData.latitude && formData.longitude) {
      locationString = `${formData.location}|${formData.latitude},${formData.longitude}`
    }
    
    createEvent({
      title: formData.title,
      date: format(date, "dd 'de' MMMM 'de' yyyy", { locale: es }),
      location: locationString,
      description: formData.description,
    })
    onOpenChange(false)
    setFormData({ title: "", location: "", description: "", latitude: null, longitude: null })
    setSearchQuery("")
    setDate(new Date())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Crear Nuevo Evento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título del Evento <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Reunión comunitaria"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Fecha <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full h-11 justify-start text-left font-normal", !date && "text-muted-foreground")}
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

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Ubicación <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ej: Centro Vecinal, Calle Principal #123"
              className="h-11"
            />
            
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="default"
                onClick={() => setShowLocationPicker(true)}
                className="flex-1 h-10 bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-4 h-4 mr-2" />
                Seleccionar en Mapa
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleUseCurrentLocation}
                className="flex-1 h-10"
                disabled={isSearching}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {isSearching ? "Obteniendo..." : "Mi Ubicación"}
              </Button>
            </div>
            
            <p className="text-xs text-neutral-500 mb-2">
              �️ <strong>Seleccionar en Mapa:</strong> Busca visualmente la ubicación con Google Maps<br/>
              📍 <strong>Mi Ubicación:</strong> Usa tu GPS actual si estás en el lugar
            </p>
            
            {formData.latitude && formData.longitude && (
              <div className="space-y-2">
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200 font-medium">
                  ✓ Coordenadas capturadas: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </div>
                <EmbeddedMap 
                  latitude={formData.latitude} 
                  longitude={formData.longitude}
                  title="Vista previa de ubicación"
                  height="200px"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del evento (opcional)"
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-11">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-11 bg-blue-600 hover:bg-blue-700">
              Crear Evento
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Selector de ubicación con mapa */}
      <LocationPicker
        open={showLocationPicker}
        onOpenChange={setShowLocationPicker}
        onLocationSelect={handleLocationSelect}
        initialAddress={formData.location}
      />
    </Dialog>
  )
}
