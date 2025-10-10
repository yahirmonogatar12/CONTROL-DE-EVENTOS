"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { QRCodeSVG } from "qrcode.react"

export function MyCard() {
  const { user } = useAuth()

  if (!user?.card) return null

  const { name, sex, age, address, phone } = user.card

  // Generate QR code data
  const qrData = JSON.stringify({
    name,
    sex,
    age,
    address,
    phone,
  })

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold text-neutral-900">Mi Tarjeta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-neutral-200 rounded-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
            <div className="space-y-1 md:space-y-2 flex-1 w-full">
              <h3 className="text-xl md:text-2xl font-bold text-neutral-900 uppercase break-words">{name}</h3>
              <p className="text-base md:text-lg text-neutral-600">
                {sex === "male" || sex === "HOMBRE" ? "HOMBRE" : "MUJER"}, {age}
              </p>
              <p className="text-sm md:text-base text-neutral-600 uppercase break-words">{address}</p>
              <p className="text-sm md:text-base text-neutral-600">{phone}</p>
            </div>

            <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-neutral-200 mx-auto md:mx-0">
              <QRCodeSVG value={qrData} size={100} className="md:w-[120px] md:h-[120px]" level="H" />
            </div>
          </div>

          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t-2 border-neutral-200">
            <p className="text-lg md:text-xl font-bold text-center text-neutral-900">SUPPORT CARD</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
