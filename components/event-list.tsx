"use client"

import { useAuth } from "@/lib/auth-context"
import { EventCard } from "@/components/event-card"

interface EventListProps {
  searchQuery: string
}

export function EventList({ searchQuery }: EventListProps) {
  const { events } = useAuth()

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (filteredEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">No se encontraron eventos</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
