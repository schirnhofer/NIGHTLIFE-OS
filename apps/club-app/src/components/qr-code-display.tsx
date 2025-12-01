'use client'

import { useEffect, useState } from 'react'
import { generateQRCode } from '@/lib/qr-code'
import Image from 'next/image'

interface QRCodeDisplayProps {
  text: string
  size?: number
}

export const QRCodeDisplay = ({ text, size = 300 }: QRCodeDisplayProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (text) {
      generateQRCode(text, size)
        .then(setQrDataUrl)
        .catch(console.error)
    }
  }, [text, size])

  if (!qrDataUrl) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-800 rounded-xl"
        style={{ width: size, height: size }}
      >
        <p className="text-slate-500 text-sm">Laden...</p>
      </div>
    )
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src={qrDataUrl}
        alt="QR Code"
        fill
        className="rounded-xl shadow-lg border-4 border-white object-contain"
        priority
      />
    </div>
  )
}
