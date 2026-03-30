import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const leaderboardData = [
  { operator: "Ana", points: 25 },
  { operator: "José", points: 18 },
  { operator: "Marta", points: 15 },
  { operator: "Carlos", points: 10 },
]

export function PointsLeaderboard() {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-neutral-900">Points Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="grid grid-cols-2 pb-3 border-b border-neutral-200">
            <div className="text-lg font-semibold text-neutral-900">Operator</div>
            <div className="text-lg font-semibold text-neutral-900 text-right">Points</div>
          </div>

          {leaderboardData.map((item, index) => (
            <div key={index} className="grid grid-cols-2 py-4 border-b border-neutral-100 last:border-0">
              <div className="text-lg text-neutral-900">{item.operator}</div>
              <div className="text-lg text-neutral-900 text-right">{item.points}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
