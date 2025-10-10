import { Card, CardContent } from "@/components/ui/card"

export function UserStats() {
  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <h2 className="text-xl md:text-2xl font-bold text-neutral-900">Tus estadísticas</h2>

      <Card className="bg-white shadow-sm border border-neutral-200">
        <CardContent className="p-4 md:p-8">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl md:text-4xl font-bold text-white">8</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-2xl font-bold text-neutral-900 break-words">Eventos registrados</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center py-6 md:py-8 px-4">
        <p className="text-base md:text-xl font-semibold text-neutral-900 mb-1 md:mb-2">¡Asiste a más eventos</p>
        <p className="text-base md:text-xl font-semibold text-neutral-900">y gana incentivos!</p>
      </div>
    </div>
  )
}
