/**
 * Firebase Storage-Helpers
 * 
 * Platzhalter für spätere Storage-Features
 * (z.B. Profilbilder, Chat-Bilder, etc.)
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { getStorageInstance } from './init';

/**
 * Lädt eine Datei in Firebase Storage hoch
 */
export async function uploadFile(
  path: string,
  file: File | Blob
): Promise<string> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/**
 * Gibt die Download-URL einer Datei zurück
 */
export async function getFileURL(path: string): Promise<string> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

/**
 * Löscht eine Datei aus Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, path);
  return deleteObject(storageRef);
}
