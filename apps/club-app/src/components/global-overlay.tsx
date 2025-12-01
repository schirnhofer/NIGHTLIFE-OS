'use client'

import { useState, useEffect } from 'react'
import { GlobalState } from '@nightlife/core'
import { Icon } from '@nightlife/ui'
import { useTranslation } from '@nightlife/ui'

interface GlobalOverlayProps {
  appState: GlobalState
  myId: string
  isCheckedIn: boolean
}

export const GlobalOverlay = ({ appState, myId, isCheckedIn }: GlobalOverlayProps) => {
  const { t } = useTranslation()
  const [timer, setTimer] = useState(10)

  // Countdown-Timer
  useEffect(() => {
    if (appState.mode === 'countdown' && appState.targetTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((appState.targetTime! - Date.now()) / 1000))
        setTimer(remaining)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [appState.mode, appState.targetTime])

  // Nachrichten-Mode
  if (appState.mode === 'message' && appState.messageText) {
    const targetGroup = appState.targetGroup || 'all'
    const show =
      targetGroup === 'all' ||
      (targetGroup === 'in' && isCheckedIn) ||
      (targetGroup === 'out' && !isCheckedIn)

    if (!show) return null

    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-6">
        <h1 className="text-yellow-400 text-5xl font-black text-center animate-pulse uppercase">
          {appState.messageText}
        </h1>
      </div>
    )
  }

  // Lichtshow-Mode
  if (appState.mode === 'lightshow' && appState.lightConfig) {
    const cfg = appState.lightConfig

    // Einfarbig
    if (cfg.type === 'color' && cfg.color) {
      return (
        <div
          className="fixed inset-0 z-50 transition-colors duration-300"
          style={{ backgroundColor: cfg.color }}
        />
      )
    }

    // Stroboskop
    if (cfg.type === 'strobe') {
      return <div className="fixed inset-0 z-50 bg-white animate-[pulse_0.05s_infinite]" />
    }

    // Psychedelisch
    if (cfg.type === 'psychedelic') {
      return <div className="fixed inset-0 z-50 animate-psychedelic" />
    }

    // Audio-Sync
    if (cfg.type === 'audio_sync' && cfg.intensity !== undefined) {
      return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div
            className="absolute inset-0 bg-fuchsia-600 transition-opacity duration-75"
            style={{ opacity: Math.min(1, cfg.intensity / 100) }}
          />
        </div>
      )
    }
  }

  // Countdown-Mode
  if (appState.mode === 'countdown') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">
        <div className="text-4xl font-black text-fuchsia-500 mb-8 animate-bounce">
          {t('overlay.lottery')}
        </div>
        <div className="text-[15rem] font-black font-mono leading-none">
          {timer}
        </div>
      </div>
    )
  }

  // Verlosungs-Ergebnis
  if (appState.mode === 'lottery_result') {
    const isWinner = appState.winnerIds?.includes(myId) || false

    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center ${
          isWinner ? 'bg-green-600' : 'bg-red-600'
        }`}
      >
        {isWinner ? (
          <div className="text-white">
            <Icon name="trophy" size={100} className="mx-auto mb-4" />
            <h1 className="text-6xl font-black mt-4">{t('overlay.winner')}</h1>
            <div className="bg-white text-black font-bold p-4 rounded-xl mt-4 text-2xl">
              {appState.prizeCode || 'GEWONNEN'}
            </div>
          </div>
        ) : (
          <h1 className="text-4xl font-black opacity-50 text-white">
            {t('overlay.notWinner')}
          </h1>
        )}
      </div>
    )
  }

  // Normal-Mode: Kein Overlay
  return null
}
