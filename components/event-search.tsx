"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface EventSearchProps {
  onSearch: (query: string) => void
}

export function EventSearch({ onSearch }: EventSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
      <Input
        placeholder="Buscar evento"
        className="h-14 pl-12 text-base bg-neutral-50 border-neutral-200"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
}
