'use client'

import { useState, useEffect } from 'react'
import { useAuth, UserProfile } from '@nightlife-os/core'
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore'
import { getDbInstance } from '@nightlife-os/core'
import { Loading } from '@nightlife/ui'
import { AdminLogin } from './admin-login'
import { AdminDashboard } from './admin-dashboard'

export const DJConsoleApp = () => {
  const { user, loading: authLoading } = useAuth()
  const [userData, setUserData] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!user) {
      setUserData(null)
      return
    }

    const db = getDbInstance()
    const userRef = doc(db, 'users', user.uid)
    const isAdmin = user.email === 'admin@club.internal'

    const unsubscribe = onSnapshot(userRef, async (snap) => {
      if (snap.exists()) {
        setUserData(snap.data() as UserProfile)
      } else if (isAdmin) {
        await setDoc(userRef, {
          email: user.email || '',
          uid: user.uid,
          role: 'admin',
          checkedIn: false,
          phoneVerified: false,
          trustedLevel: 0,
          faceConsent: null,
          verifiedBy: null,
        })
      }
    })

    return () => unsubscribe()
  }, [user])

  if (authLoading) {
    return <Loading fullScreen text="Laden..." />
  }

  if (!user) {
    return <AdminLogin />
  }

  if (!userData) {
    return <Loading fullScreen text="Lade Profil..." />
  }

  return <AdminDashboard user={user} userData={userData} />
}
