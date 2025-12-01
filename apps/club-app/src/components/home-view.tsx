'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { UserProfile, Friend, FriendRequest } from '@nightlife/core'
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { getDbInstance } from '@nightlife/core'
import { useTranslation } from '@nightlife/ui'
import { Icon, Button, Card } from '@nightlife/ui'
import { QRCodeDisplay } from './qr-code-display'

interface HomeViewProps {
  user: User
  userData: UserProfile
  onAcceptRequest: (req: Friend & { id: string }) => void
}

export const HomeView = ({ user, userData, onAcceptRequest }: HomeViewProps) => {
  const { t } = useTranslation()
  const [showQR, setShowQR] = useState(false)
  const [requests, setRequests] = useState<(FriendRequest & { id: string })[]>([])
  const screenWidth = typeof window !== 'undefined' 
    ? Math.min(window.innerWidth - 60, 350) 
    : 300

  // Freundschaftsanfragen laden
  useEffect(() => {
    const db = getDbInstance()
    const requestsRef = collection(db, 'users', user.uid, 'requests')
    
    const unsubscribe = onSnapshot(requestsRef, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (FriendRequest & { id: string })[]
      setRequests(reqs)
    })

    return () => unsubscribe()
  }, [user.uid])

  const toggleCheckIn = async () => {
    const db = getDbInstance()
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, {
      checkedIn: !userData.checkedIn
    })
  }

  const toggleQR = () => {
    setShowQR(!showQR)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Status Badge */}
      <Card
        className={`w-full max-w-sm flex justify-between items-center ${
          userData.checkedIn
            ? 'bg-green-900/50 border-green-500'
            : 'bg-slate-900 border-slate-700'
        }`}
      >
        <span className="text-xs font-bold uppercase text-slate-400">
          {t('home.statusLabel')}
        </span>
        <span
          className={`text-sm font-black ${
            userData.checkedIn ? 'text-green-400' : 'text-slate-200'
          }`}
        >
          {userData.checkedIn ? t('home.statusInClub') : t('home.statusOutside')}
        </span>
      </Card>

      {/* Freundschaftsanfragen Banner */}
      {requests.length > 0 && requests[0] && (
        <div
          className="w-full max-w-sm bg-gradient-to-r from-fuchsia-600 to-purple-600 p-4 rounded-2xl shadow-lg animate-pulse cursor-pointer"
          onClick={() => onAcceptRequest(requests[0] as any)}
        >
          <div className="flex justify-between items-center text-white">
            <div>
              <div className="font-bold text-lg">{t('home.newRequest')}</div>
              <div className="text-xs opacity-90">
                {requests[0]?.email?.split('@')[0] || 'Unbekannt'}
              </div>
              {requests[0]?.message && (
                <div className="text-xs italic mt-1 bg-black/20 p-1 rounded">
                  "{requests[0].message}"
                </div>
              )}
            </div>
            <div className="bg-white text-fuchsia-600 p-2 rounded-full font-bold text-xs px-3">
              {t('home.acceptRequest')}
            </div>
          </div>
        </div>
      )}

      {/* QR Code mit Blur-Effekt */}
      <div
        className="bg-white p-6 rounded-3xl shadow-2xl shadow-fuchsia-500/20 relative overflow-hidden cursor-pointer select-none"
        onClick={toggleQR}
      >
        <div
          className={`transition-all duration-300 ${
            showQR ? 'filter-none' : 'blur-xl opacity-40'
          }`}
        >
          <QRCodeDisplay
            text={userData.friendCode || 'INIT'}
            size={screenWidth - 40}
          />
          <div className="text-center mt-4">
            <p className="text-black font-black text-4xl tracking-widest font-mono">
              {userData.friendCode || '-------'}
            </p>
          </div>
        </div>

        {!showQR && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <div className="bg-black/90 text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2">
              <Icon name="eye-off" size={18} />
              <span>{t('home.tapToShow')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Check-In/Out Button */}
      <Button
        onClick={toggleCheckIn}
        variant={userData.checkedIn ? 'secondary' : 'primary'}
        size="lg"
        fullWidth
        className="max-w-sm"
      >
        <Icon name="map-pin" />
        {userData.checkedIn ? t('home.checkOut') : t('home.checkIn')}
      </Button>
    </div>
  )
}
