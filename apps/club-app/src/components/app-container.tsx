'use client'

import { useState, useEffect } from 'react'
import { useAuth, doc, setDoc, onSnapshot, getDbInstance, generateFriendCode } from '@nightlife/core'
import type { UserProfile, Friend } from '@nightlife/core'
import { Loading } from '@nightlife/ui'
import { LoginScreen } from './login-screen'
import { HomeView } from './home-view'
import { ChatSystem } from './chat-system'
import { GlobalOverlay } from './global-overlay'
import { TabNavigation } from './tab-navigation'
import type { GlobalState } from '@nightlife/core'

export const AppContainer = () => {
  const { user, loading: authLoading } = useAuth()
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [appState, setAppState] = useState<GlobalState>({ mode: 'normal' })
  const [activeTab, setActiveTab] = useState<'home' | 'chat'>('home')
  const [directChat, setDirectChat] = useState<Friend | null>(null)

  // User-Daten-Listener
  useEffect(() => {
    if (!user) {
      setUserData(null)
      return
    }

    const db = getDbInstance()
    const userRef = doc(db, 'users', user.uid)
    const isAdmin = user.email === 'admin@club.internal'

    const unsubscribe = onSnapshot(userRef, async (snap: any) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile
        
        // Auto-Fix: FriendCode generieren wenn fehlt
        if ((!data.friendCode || data.friendCode.length < 7) && !isAdmin) {
          const newCode = generateFriendCode()
          await setDoc(userRef, { friendCode: newCode }, { merge: true })
        }
        
        setUserData(data)
      } else {
        // Neues User-Dokument erstellen
        const newUserData: Partial<UserProfile> = {
          email: user.email || '',
          uid: user.uid,
          role: isAdmin ? 'admin' : 'guest',
          checkedIn: false,
          friendCode: isAdmin ? undefined : generateFriendCode(),
          // Trust-Felder mit Defaults
          phoneVerified: false,
          trustedLevel: 0,
          faceConsent: null,
          verifiedBy: null,
        }
        
        await setDoc(userRef, newUserData, { merge: true })
      }
    })

    return () => unsubscribe()
  }, [user])

  // Global State Listener
  useEffect(() => {
    const db = getDbInstance()
    const unsubscribe = onSnapshot(doc(db, 'public', 'globalState'), (snap) => {
      if (snap.exists()) {
        setAppState(snap.data() as GlobalState)
      }
    })

    return () => unsubscribe()
  }, [])

  // Freundschaftsanfrage akzeptieren
  const handleAcceptRequest = async (req: Friend & { id: string }) => {
    if (!user) return

    const db = getDbInstance()
    
    // Beidseitige Freundschaft erstellen
    await setDoc(doc(db, 'users', user.uid, 'friends', req.uid), {
      email: req.email,
      uid: req.uid,
    })
    await setDoc(doc(db, 'users', req.uid, 'friends', user.uid), {
      email: user.email || '',
      uid: user.uid,
    })

    // Anfrage löschen
    const { deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'users', user.uid, 'requests', req.id))

    // Direkt zum Chat navigieren
    setDirectChat({ uid: req.uid, email: req.email })
    setActiveTab('chat')
  }

  if (authLoading) {
    return <Loading fullScreen text="Laden..." />
  }

  if (!user) {
    return <LoginScreen />
  }

  if (!userData) {
    return <Loading fullScreen text="Lade Profil..." />
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Global Overlay (Admin-gesteuert) */}
      <GlobalOverlay 
        appState={appState} 
        myId={user.uid} 
        isCheckedIn={userData.checkedIn || false} 
      />

      {/* Haupt-Content */}
      <div className="container mx-auto max-w-lg px-4 py-6">
        {activeTab === 'home' && (
          <HomeView 
            user={user} 
            userData={userData} 
            onAcceptRequest={handleAcceptRequest} 
          />
        )}
        
        {activeTab === 'chat' && (
          <ChatSystem 
            user={user} 
            userData={userData}
            initialChat={directChat}
            clearInitial={() => setDirectChat(null)}
          />
        )}
      </div>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
