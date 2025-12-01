'use client'

import { useState, useEffect, useRef } from 'react'
import { User } from 'firebase/auth'
import { UserProfile, GlobalState } from '@nightlife/core'
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { getDbInstance } from '@nightlife/core'
import { useAuth } from '@nightlife/core'
import { useTranslation } from '@nightlife/ui'
import { Button, Card, Icon, Input } from '@nightlife/ui'

interface AdminDashboardProps {
  user: User
  userData: UserProfile
}

export const AdminDashboard = ({ user, userData }: AdminDashboardProps) => {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [winnerCount, setWinnerCount] = useState(1)
  const [prizeCode, setPrizeCode] = useState('FREIGETRÄNK')
  const [msg, setMsg] = useState('')
  const [msgTarget, setMsgTarget] = useState<'in' | 'out' | 'all'>('in')
  const [isAudioSync, setIsAudioSync] = useState(false)
  const audioRef = useRef<any>(null)
  const syncInterval = useRef<any>(null)

  // Users laden
  useEffect(() => {
    const db = getDbInstance()
    const unsubscribe = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => d.data() as UserProfile))
    })
    return () => unsubscribe()
  }, [])

  const updateGlobal = async (data: Partial<GlobalState>) => {
    const db = getDbInstance()
    await setDoc(doc(db, 'public', 'globalState'), data, { merge: true })
  }

  // Lichtsteuerung
  const sendColor = (color: string) => {
    stopAudioSync()
    updateGlobal({
      mode: 'lightshow',
      lightConfig: { type: 'color', color },
    })
  }

  const sendEffect = (effect: 'psychedelic' | 'strobe') => {
    stopAudioSync()
    updateGlobal({
      mode: 'lightshow',
      lightConfig: { type: effect },
    })
  }

  // Audio-Sync
  const toggleAudioSync = async () => {
    if (isAudioSync) {
      stopAudioSync()
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const src = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 32
        src.connect(analyser)

        audioRef.current = { stream, ctx, analyser }
        setIsAudioSync(true)

        let lastVol = 0
        syncInterval.current = setInterval(() => {
          const buffer = new Uint8Array(analyser.frequencyBinCount)
          analyser.getByteFrequencyData(buffer)
          const vol = Math.floor(buffer.reduce((a, b) => a + b, 0) / buffer.length)

          if (Math.abs(vol - lastVol) > 10) {
            updateGlobal({
              mode: 'lightshow',
              lightConfig: { type: 'audio_sync', intensity: vol },
            })
            lastVol = vol
          }
        }, 100)
      } catch (err) {
        alert('Mikrofon-Zugriff fehlgeschlagen!')
        console.error(err)
      }
    }
  }

  const stopAudioSync = () => {
    if (syncInterval.current) clearInterval(syncInterval.current)
    if (audioRef.current) {
      audioRef.current.stream?.getTracks().forEach((t: any) => t.stop())
      audioRef.current.ctx?.close()
    }
    setIsAudioSync(false)
  }

  // Gewinnspiel
  const startLottery = async () => {
    stopAudioSync()
    await updateGlobal({
      mode: 'countdown',
      targetTime: Date.now() + 10000,
    })

    setTimeout(async () => {
      const eligible = users
        .filter(u => u.checkedIn && u.role === 'guest')
        .map(u => u.uid)

      // Fisher-Yates Shuffle
      for (let i = eligible.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[eligible[i], eligible[j]] = [eligible[j], eligible[i]]
      }

      const winners = eligible.slice(0, parseInt(String(winnerCount)))

      await updateGlobal({
        mode: 'lottery_result',
        winnerIds: winners,
        prizeCode: prizeCode,
      })
    }, 10000)
  }

  // Broadcast
  const sendBroadcast = () => {
    stopAudioSync()
    updateGlobal({
      mode: 'message',
      messageText: msg,
      targetGroup: msgTarget,
    })
  }

  // Stop/Reset
  const stopAll = () => {
    stopAudioSync()
    updateGlobal({
      mode: 'normal',
      messageText: '',
      winnerIds: [],
    })
  }

  const guestsInClub = users.filter(u => u.checkedIn && u.role === 'guest')

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            {t('admin.title')}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-400">
              <Icon name="users" size={24} />
              <span className="text-2xl font-black">{guestsInClub.length}</span>
            </div>
            <Button onClick={() => signOut()} variant="danger" size="sm">
              <Icon name="power" size={18} />
              {t('admin.logout')}
            </Button>
          </div>
        </div>

        {/* Lichtsteuerung */}
        <Card glass>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="zap" size={24} className="text-yellow-400" />
              {t('admin.lightControl')}
            </h2>
            <button
              onClick={toggleAudioSync}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                isAudioSync
                  ? 'bg-red-600 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {isAudioSync ? t('admin.audioSyncOn') : t('admin.audioSync')}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-3">
            {[
              { name: 'red', color: '#ff0000', bg: 'bg-red-600' },
              { name: 'green', color: '#00ff00', bg: 'bg-green-500' },
              { name: 'blue', color: '#0000ff', bg: 'bg-blue-600' },
              { name: 'yellow', color: '#ffff00', bg: 'bg-yellow-400' },
              { name: 'magenta', color: '#ff00ff', bg: 'bg-fuchsia-500' },
              { name: 'cyan', color: '#00ffff', bg: 'bg-cyan-400' },
              { name: 'white', color: '#ffffff', bg: 'bg-white' },
              { name: 'off', color: '#000000', bg: 'bg-black border-2 border-slate-700' },
            ].map((c) => (
              <button
                key={c.name}
                onClick={() => sendColor(c.color)}
                className={`${c.bg} h-16 rounded-xl btn-color font-bold text-sm ${c.name === 'white' ? 'text-black' : ''}`}
              >
                {t(`admin.colors.${c.name}`)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => sendEffect('psychedelic')}
              className="py-3 rounded-xl font-bold bg-gradient-to-r from-pink-500 via-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 hover:scale-105 transition-transform"
            >
              {t('admin.effects.psychedelic')}
            </button>
            <button
              onClick={() => sendEffect('strobe')}
              className="py-3 rounded-xl font-bold bg-white text-black hover:scale-105 transition-transform"
            >
              {t('admin.effects.strobe')}
            </button>
          </div>
        </Card>

        {/* Gewinnspiel */}
        <Card glass>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Icon name="trophy" size={24} className="text-yellow-400" />
            {t('admin.lottery')}
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">{t('admin.winnerCount')}</label>
              <Input
                type="number"
                min="1"
                value={winnerCount}
                onChange={(e) => setWinnerCount(parseInt(e.target.value) || 1)}
                className="text-center font-bold"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">{t('admin.prizeCode')}</label>
              <Input
                value={prizeCode}
                onChange={(e) => setPrizeCode(e.target.value.toUpperCase())}
                className="text-center font-bold text-yellow-400"
              />
            </div>
          </div>
          <Button onClick={startLottery} variant="primary" size="lg" fullWidth>
            <Icon name="trophy" size={20} />
            {t('admin.startLottery')}
          </Button>
        </Card>

        {/* Broadcast */}
        <Card glass>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Icon name="message-circle" size={24} className="text-cyan-400" />
            {t('admin.broadcast')}
          </h2>
          <div className="flex gap-2 mb-4">
            {(['in', 'out', 'all'] as const).map((target) => (
              <button
                key={target}
                onClick={() => setMsgTarget(target)}
                className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  msgTarget === target
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-500 hover:bg-slate-800'
                }`}
              >
                {t(`admin.target${target.charAt(0).toUpperCase() + target.slice(1)}`)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={t('admin.messagePlaceholder')}
              value={msg}
              onChange={(e) => setMsg(e.target.value.toUpperCase())}
              className="flex-1 text-center font-bold text-yellow-400 bg-black"
            />
            <Button onClick={sendBroadcast} variant="primary" disabled={!msg.trim()}>
              {t('admin.sendBroadcast')}
            </Button>
          </div>
        </Card>

        {/* Gästeliste */}
        <Card glass>
          <h2 className="text-lg font-bold mb-3">{t('admin.guestList')}</h2>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {guestsInClub.length === 0 ? (
              <p className="text-xs text-slate-600 italic text-center py-4">
                {t('admin.noGuests')}
              </p>
            ) : (
              guestsInClub.map((g) => (
                <div key={g.uid} className="flex items-center justify-between text-sm">
                  <span className="truncate w-40">{g.email}</span>
                  <span className="text-green-400 font-mono text-xs">{g.uid.slice(0, 4)}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Stop/Reset */}
        <Button
          onClick={stopAll}
          variant="danger"
          size="lg"
          fullWidth
          className="!bg-red-900/80 border-2 border-red-500 shadow-lg shadow-red-900/50 uppercase tracking-widest"
        >
          {t('admin.stopAll')}
        </Button>
      </div>
    </div>
  )
}
