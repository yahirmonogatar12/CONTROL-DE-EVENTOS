"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Search, Loader2 } from "lucide-react"

interface LocationSuggestion {
  place_id: string
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
}

interface LocationPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void
  initialAddress?: string
}

export function LocationPicker({ open, onOpenChange, onLocationSelect, initialAddress = "" }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialAddress)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ address: string; lat: number; lng: number } | null>(null)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Buscar sugerencias mientras el usuario escribe
  useEffect(() => {
    const searchSuggestions = async () => {
      if (searchQuery.trim().length < 3) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsSearching(true)
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'EventRegistrationApp/1.0'
            }
          }
        )
        
        const data = await response.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch (error) {
        console.error("Error buscando sugerencias:", error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchSuggestions, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    const location = {
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    }
    setSelectedLocation(location)
    setSearchQuery(suggestion.display_name)
    setShowSuggestions(false)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    
    try {
      // Usar Nominatim de OpenStreetMap para geocodificación
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            'User-Agent': 'EventRegistrationApp/1.0'
          }
        }
      )
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        setSelectedLocation({
          address: result.display_name,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        })
      } else {
        alert("No se encontró la ubicación. Intenta ser más específico (agrega ciudad, estado o país)")
      }
    } catch (error) {
      console.error("Error buscando ubicación:", error)
      alert("Error al buscar la ubicación. Intenta de nuevo.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
      onOpenChange(false)
      setSelectedLocation(null)
      setSearchQuery("")
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setSelectedLocation(null)
    setSearchQuery(initialAddress)
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Seleccionar Ubicación</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Buscador con Autocomplete */}
          <div className="space-y-2 relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Escribe una dirección: Siena 154, Ciudad de México"
                  className="flex-1"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  </div>
                )}
                
                {/* Dropdown de sugerencias */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {suggestion.display_name.split(',')[0]}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {suggestion.display_name}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              💡 <strong>Empieza a escribir</strong> y aparecerán sugerencias automáticamente (mínimo 3 caracteres)
            </p>
          </div>

          {/* Mapa embebido */}
          {selectedLocation && (
            <div className="space-y-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Ubicación encontrada:</p>
                    <p className="text-xs text-green-700 mt-1">{selectedLocation.address}</p>
                    <p className="text-xs text-green-600 mt-1 font-mono">
                      📍 {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mapa de Google Maps embebido */}
              <div className="w-full rounded-lg overflow-hidden border border-gray-300 shadow-lg">
                <iframe
                  title="Mapa de ubicación seleccionada"
                  src={`https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Botón para abrir en Google Maps */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.open(`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`, '_blank')}
              >
                Abrir en Google Maps (nueva ventana)
              </Button>
            </div>
          )}

          {!selectedLocation && (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Busca una dirección para ver el mapa</p>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Confirmar Ubicación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
