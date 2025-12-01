/**
 * Firebase Auth-Helpers
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { getAuthInstance } from './init';

/**
 * Login mit E-Mail und Passwort
 */
export async function login(
  email: string,
  password: string
): Promise<UserCredential> {
  const auth = getAuthInstance();
  return signInWithEmailAndPassword(auth, email, password);
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
 * Logout
 */
export async function logout(): Promise<void> {
  const auth = getAuthInstance();
  return firebaseSignOut(auth);
}

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
 * Gibt den aktuell eingeloggten User zurück (oder null)
 */
export function getCurrentUser(): User | null {
  const auth = getAuthInstance();
  return auth.currentUser;
}
