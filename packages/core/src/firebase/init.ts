/**
 * Firebase-Initialisierung für Nightlife OS
 * 
 * Diese Datei initialisiert Firebase mit den Umgebungsvariablen.
 * 
 * WICHTIG: Echte Firebase-Credentials müssen in der .env-Datei konfiguriert werden.
 * Siehe .env.example im Root-Verzeichnis.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase-Konfiguration aus Umgebungsvariablen
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialisiert Firebase (oder gibt bestehende App zurück)
 */
export function initFirebase(): FirebaseApp {
  // Prüfe, ob Firebase bereits initialisiert ist
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  // Validiere Konfiguration
  if (!firebaseConfig.apiKey) {
    console.error(
      'Firebase-Konfiguration fehlt! Bitte .env-Datei mit NEXT_PUBLIC_FIREBASE_* Variablen erstellen.'
    );
    throw new Error('Firebase configuration missing');
  }

  // Initialisiere Firebase
  return initializeApp(firebaseConfig);
}

/**
 * Gibt die Firebase-App-Instanz zurück
 */
export function getFirebaseApp(): FirebaseApp {
  return initFirebase();
}

/**
 * Gibt die Firestore-Instanz zurück
 */
export function getFirestoreInstance(): Firestore {
  const app = getFirebaseApp();
  return getFirestore(app);
}

/**
 * Gibt die Auth-Instanz zurück
 */
export function getAuthInstance(): Auth {
  const app = getFirebaseApp();
  return getAuth(app);
}

/**
 * Gibt die Storage-Instanz zurück
 */
export function getStorageInstance(): FirebaseStorage {
  const app = getFirebaseApp();
  return getStorage(app);
}
