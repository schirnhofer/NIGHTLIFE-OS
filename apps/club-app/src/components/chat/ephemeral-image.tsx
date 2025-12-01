'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@nightlife/ui'
import { Icon } from '@nightlife/ui'
import Image from 'next/image'

interface EphemeralImageProps {
  src: string
  timer: number | null
  isMe: boolean
  onExpire: () => void
}

export const EphemeralImage = ({ src, timer, isMe, onExpire }: EphemeralImageProps) => {
  const { t } = useTranslation()
  const [viewed, setViewed] = useState(false)
  const [cnt, setCnt] = useState(timer || 0)

  useEffect(() => {
    if (viewed && timer && cnt > 0) {
      const interval = setInterval(() => setCnt((c) => c - 1), 1000)
      return () => clearInterval(interval)
    } else if (viewed && timer && cnt === 0) {
      onExpire()
    }
  }, [viewed, cnt, timer, onExpire])

  // Eigenes Bild
  if (isMe) {
    return (
      <div className="relative mb-1">
        <div className="relative w-[200px] h-[200px]">
          <Image
            src={src}
            alt="Bild"
            fill
            className="rounded-lg opacity-50 object-cover"
          />
        </div>
        {timer && (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold">
            Timer: {timer}s
          </span>
        )}
      </div>
    )
  }

  // Empfangenes Bild mit Timer, noch nicht angesehen
  if (timer && !viewed) {
    return (
      <button
        onClick={() => setViewed(true)}
        className="bg-fuchsia-900/50 border border-fuchsia-500 text-fuchsia-300 px-4 py-6 rounded-xl font-bold flex flex-col items-center gap-2 mb-1 hover:bg-fuchsia-900/70 transition-colors"
      >
        <Icon name="flame" size={24} />
        <span>{t('chat.viewTimer', { timer })}</span>
      </button>
    )
  }

  // Bild wird angesehen (mit Countdown) oder permanentes Bild
  return (
    <div className="relative mb-1">
      <div className="relative w-[200px] h-[200px]">
        <Image
          src={src}
          alt="Bild"
          fill
          className="rounded-lg object-cover"
        />
      </div>
      {timer && viewed && (
        <span className="absolute top-2 right-2 bg-red-600 text-white font-bold px-3 py-1 rounded-full animate-pulse">
          {cnt}
        </span>
      )}
    </div>
  )
}
