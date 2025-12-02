/**
 * Firebase Auth-Helpers
 */

import {
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { getAuthInstance } from './init';
import { setDocument } from './firestore';

/**
 * Login mit E-Mail und Passwort
 */
export async function login(
  email: string,
  password: string
): Promise<UserCredential> {
  const auth = getAuthInstance();
  return firebaseSignIn(auth, email, password);
}

/**
 * Alias für login - verwendet von useAuth Hook
 */
export async function signInWithEmailAndPassword(
  email: string,
  password: string
): Promise<UserCredential> {
  return login(email, password);
}

/**
 * Registrierung mit E-Mail und Passwort
 */
export async function signup(
  email: string,
  password: string
): Promise<UserCredential> {
  const auth = getAuthInstance();
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Registrierung mit E-Mail, Passwort und Display Name
 */
export async function signUpWithEmailAndPassword(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  const auth = getAuthInstance();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Display Name setzen, falls angegeben
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
    
    // PlatformUser-Dokument erstellen
    await setDocument(`platform/users/${userCredential.user.uid}`, {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: displayName,
      photoURL: null,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      isPlatformAdmin: false,
      ownedClubs: [],
      memberClubs: [],
    });
  }
  
  return userCredential;
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  const auth = getAuthInstance();
  return firebaseSignOut(auth);
}

/**
 * Alias für logout - verwendet von useAuth Hook
 */
export const signOutUser = logout;

/**
 * Auth-State-Listener
 * Wird ausgeführt, wenn sich der Auth-State ändert (Login/Logout)
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void
): () => void {
  const auth = getAuthInstance();
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Alias für onAuthStateChanged - konsistente API
 */
export const onAuthStateChangedListener = onAuthStateChanged;

/**
 * Gibt den aktuell eingeloggten User zurück (oder null)
 */
export function getCurrentUser(): User | null {
  const auth = getAuthInstance();
  return auth.currentUser;
}
