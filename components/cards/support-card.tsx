import { Card, CardContent } from "@/components/ui/card"
import { QRCodeSVG } from "qrcode.react"

export function SupportCard() {
  const cardData = {
    name: "LUIS GARCÍA",
    sex: "MALE",
    age: "45",
    address: "CALLE 10, CIUDAD",
    phone: "(555) 123-4567",
  }

  const qrData = JSON.stringify(cardData)

  return (
    <Card className="bg-white shadow-md">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">{cardData.name}</h2>
            <p className="text-base text-neutral-700 mb-1">
              {cardData.sex}, {cardData.age}
            </p>
            <p className="text-base text-neutral-700 mb-1">{cardData.address}</p>
            <p className="text-base text-neutral-700">{cardData.phone}</p>
          </div>
          <div className="ml-4">
            <QRCodeSVG value={qrData} size={100} />
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-200">
          <h3 className="text-xl font-bold text-center text-neutral-900">SUPPORT CARD</h3>
        </div>
      </CardContent>
    </Card>
  )
}
