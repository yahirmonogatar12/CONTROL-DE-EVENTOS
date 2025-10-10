"use client"

import { Calendar, BarChart3, Gift } from "lucide-react"

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "eventos", label: "Eventos", icon: Calendar },
    { id: "estadisticas", label: "Estadísticas", icon: BarChart3 },
    { id: "incentivos", label: "Incentivos", icon: Gift },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors"
            >
              <Icon className={`w-6 h-6 ${isActive ? "text-blue-600" : "text-neutral-400"}`} />
              <span className={`text-xs font-medium ${isActive ? "text-blue-600" : "text-neutral-600"}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
