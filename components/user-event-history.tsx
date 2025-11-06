"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Calendar, MapPin, Hash, TrendingUp, Award, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function UserEventHistory() {
  const { user, getUserEventHistory, getUserEventStats } = useAuth()
  const [history, setHistory] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.email) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const [historyData, statsData] = await Promise.all([
        getUserEventHistory(user.email),
        getUserEventStats(user.email)
      ])
      setHistory(historyData)
      setStats(statsData)
    } catch (error) {
      console.error("Error cargando historial:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas Rápidas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_events}</p>
                  <p className="text-xs opacity-90">Total Eventos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-400 to-blue-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.events_last_30_days}</p>
                  <p className="text-xs opacity-90">Últimos 30 días</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.events_last_7_days}</p>
                  <p className="text-xs opacity-90">Últimos 7 días</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-700 to-blue-800 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unique_events}</p>
                  <p className="text-xs opacity-90">Eventos Únicos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Historial de Eventos */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Mi Historial de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-600 font-medium">No has asistido a ningún evento aún</p>
              <p className="text-sm text-neutral-500 mt-2">
                Registra tu asistencia escaneando códigos QR o ingresando códigos de confirmación
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((event, index) => (
                <div 
                  key={`${event.event_id}-${index}`} 
                  className="p-4 border border-neutral-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-900 text-lg">{event.event_title}</h4>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-neutral-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>{event.event_date}</span>
                            </div>
                            
                            {event.event_location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                <span className="line-clamp-1">
                                  {event.event_location.split('|')[0]}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Código: {event.confirmation_code}
                            </Badge>
                            <span className="text-xs text-neutral-500">
                              Registrado: {new Date(event.attended_at).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
