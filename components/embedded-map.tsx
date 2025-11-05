"use client"

interface EmbeddedMapProps {
  latitude: number
  longitude: number
  title?: string
  height?: string
}

export function EmbeddedMap({ latitude, longitude, title = "Ubicación del evento", height = "300px" }: EmbeddedMapProps) {
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <iframe
        title={title}
        src={mapUrl}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}
