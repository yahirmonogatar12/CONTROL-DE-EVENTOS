"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Send, CheckCircle, AlertCircle, Clock, X, Search, Image as ImageIcon, Upload } from "lucide-react"

export function ComplaintsSuggestions() {
  const { user, submitComplaint, getUserComplaints, getAllComplaints, updateComplaintStatus, isAdmin } = useAuth()
  const [type, setType] = useState<'queja' | 'sugerencia'>('queja')
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [userComplaints, setUserComplaints] = useState<any[]>([])
  const [allComplaints, setAllComplaints] = useState<any[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [adminResponse, setAdminResponse] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadComplaints()
  }, [])

  const loadComplaints = async () => {
    if (isAdmin) {
      const all = await getAllComplaints()
      setAllComplaints(all)
    } else {
      const userC = await getUserComplaints()
      setUserComplaints(userC)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      setError("Máximo 5 imágenes permitidas")
      return
    }

    setImages([...images, ...files])

    // Crear previews
    const newPreviews: string[] = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === files.length) {
          setImagePreview([...imagePreview, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreview(imagePreview.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!subject.trim() || !message.trim()) {
      setError("Por favor completa todos los campos")
      return
    }

    setIsLoading(true)

    const result = await submitComplaint(type, subject, message, images)

    if (result.success) {
      setSuccess(true)
      setSubject("")
      setMessage("")
      setImages([])
      setImagePreview([])
      setTimeout(() => setSuccess(false), 3000)
      loadComplaints()
    } else {
      setError(result.message)
    }

    setIsLoading(false)
  }

  const handleUpdateStatus = async (id: string, status: string, response?: string) => {
    try {
      await updateComplaintStatus(id, status, response)
      loadComplaints()
      setSelectedComplaint(null)
      setAdminResponse("")
      setNewStatus("")
    } catch (error) {
      console.error("Error updating:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pendiente: <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>,
      en_revision: <Badge className="bg-blue-100 text-blue-800 border-blue-300"><MessageSquare className="w-3 h-3 mr-1" />En Revisión</Badge>,
      resuelto: <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Resuelto</Badge>,
      cerrado: <Badge className="bg-gray-100 text-gray-800 border-gray-300"><X className="w-3 h-3 mr-1" />Cerrado</Badge>,
    }
    return badges[status] || badges.pendiente
  }

  const getTypeBadge = (t: string) => {
    return t === 'queja' 
      ? <Badge variant="destructive">Queja</Badge>
      : <Badge className="bg-blue-600">Sugerencia</Badge>
  }

  // Filtrar quejas por búsqueda
  const filteredComplaints = (isAdmin ? allComplaints : userComplaints).filter(complaint => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      complaint.folio?.toLowerCase().includes(searchLower) ||
      complaint.subject?.toLowerCase().includes(searchLower) ||
      complaint.user_name?.toLowerCase().includes(searchLower) ||
      complaint.user_email?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Enviar {type === 'queja' ? 'Queja' : 'Sugerencia'}
            </CardTitle>
            <CardDescription>
              Ayúdanos a mejorar compartiendo tu opinión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={type === 'queja' ? 'default' : 'outline'}
                    onClick={() => setType('queja')}
                    className="flex-1"
                  >
                    Queja
                  </Button>
                  <Button
                    type="button"
                    variant={type === 'sugerencia' ? 'default' : 'outline'}
                    onClick={() => setType('sugerencia')}
                    className="flex-1"
                  >
                    Sugerencia
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Asunto *</Label>
                <Input
                  id="subject"
                  placeholder="Breve descripción del tema"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje *</Label>
                <Textarea
                  id="message"
                  placeholder="Describe detalladamente tu queja o sugerencia"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Imágenes (Opcional - Máximo 5)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('images')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Imágenes ({images.length}/5)
                  </Button>
                </div>
                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 text-green-900 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ¡Tu mensaje ha sido enviado exitosamente!
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? "Enviando..." : "Enviar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {isAdmin ? "Todas las Quejas y Sugerencias" : "Mis Mensajes"}
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? "Gestiona las quejas y sugerencias de los usuarios"
              : "Historial de tus quejas y sugerencias enviadas"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Buscador */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder={`Buscar por ${isAdmin ? 'folio, nombre o correo' : 'folio o asunto'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              {searchTerm ? "No se encontraron resultados" : "No hay mensajes para mostrar"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <Card key={complaint.id} className="border-neutral-200">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {complaint.folio && (
                              <Badge variant="outline" className="font-mono text-xs">
                                {complaint.folio}
                              </Badge>
                            )}
                            {getTypeBadge(complaint.type)}
                            {getStatusBadge(complaint.status)}
                          </div>
                          <h3 className="font-semibold text-lg">{complaint.subject}</h3>
                          {isAdmin && (
                            <p className="text-sm text-neutral-500">
                              De: {complaint.user_name} ({complaint.user_email})
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 whitespace-nowrap">
                          {new Date(complaint.created_at).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>

                      <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                        {complaint.message}
                      </p>

                      {/* Mostrar imágenes si existen */}
                      {complaint.images && complaint.images.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="w-4 h-4 text-neutral-500" />
                            <p className="text-xs font-semibold text-neutral-600">
                              Imágenes adjuntas ({complaint.images.length})
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {complaint.images.map((imageUrl: string, index: number) => (
                              <a
                                key={index}
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Imagen ${index + 1}`}
                                  className="w-full h-24 object-cover rounded border hover:opacity-80 transition-opacity"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {complaint.admin_response && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-semibold text-blue-900 mb-1">
                            Respuesta del administrador:
                          </p>
                          <p className="text-sm text-blue-800 whitespace-pre-wrap">
                            {complaint.admin_response}
                          </p>
                        </div>
                      )}

                      {isAdmin && complaint.status !== 'cerrado' && (
                        <div className="pt-3 border-t space-y-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(complaint.id, 'en_revision')}
                            >
                              Marcar en Revisión
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 hover:bg-green-100"
                              onClick={() => setSelectedComplaint(complaint)}
                            >
                              Resolver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(complaint.id, 'cerrado')}
                            >
                              Cerrar
                            </Button>
                          </div>

                          {selectedComplaint?.id === complaint.id && (
                            <div className="space-y-2 pt-2">
                              <Textarea
                                placeholder="Escribe tu respuesta..."
                                value={adminResponse}
                                onChange={(e) => setAdminResponse(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateStatus(complaint.id, 'resuelto', adminResponse)}
                                  disabled={!adminResponse.trim()}
                                >
                                  Enviar y Resolver
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedComplaint(null)
                                    setAdminResponse("")
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
