import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

// Firebase-Config wird aus window.clubConfig geladen
// Diese wird aus der bestehenden config.js-Datei geladen
interface ClubConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

declare global {
  interface Window {
    clubConfig?: ClubConfig
  }
}

let firebaseApp: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

/**
 * Initialisiert Firebase mit der bestehenden Config aus window.clubConfig
 */
export const initializeFirebase = (): { app: FirebaseApp; auth: Auth; db: Firestore; storage: FirebaseStorage } => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase kann nur im Browser initialisiert werden')
  }

  if (!window.clubConfig) {
    throw new Error('Firebase-Konfiguration nicht gefunden. Bitte config.js laden!')
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(window.clubConfig)
    auth = getAuth(firebaseApp)
    db = getFirestore(firebaseApp)
    storage = getStorage(firebaseApp)
  }

  return { 
    app: firebaseApp, 
    auth: auth!, 
    db: db!, 
    storage: storage! 
  }
}

/**
 * Gibt die Firebase-Instanzen zurück (muss vorher initialisiert worden sein)
 */
export const getFirebaseInstances = () => {
  if (!firebaseApp || !auth || !db || !storage) {
    throw new Error('Firebase wurde noch nicht initialisiert. Rufe initializeFirebase() auf!')
  }

  return { app: firebaseApp, auth, db, storage }
}

// Convenience Exports
export const getAuthInstance = () => getFirebaseInstances().auth
export const getDbInstance = () => getFirebaseInstances().db
export const getStorageInstance = () => getFirebaseInstances().storage
