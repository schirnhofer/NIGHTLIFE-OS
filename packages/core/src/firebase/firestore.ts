/**
 * Firestore-Helpers
 * 
 * Wrapper-Funktionen für Firestore-Operationen
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  DocumentReference,
  CollectionReference,
  QueryConstraint,
  DocumentData,
  Unsubscribe,
  WhereFilterOp,
  OrderByDirection,
} from 'firebase/firestore';
import { getFirestoreInstance } from './init';

/**
 * Liest ein Dokument aus Firestore
 */
export async function getDocument<T = DocumentData>(
  path: string
): Promise<T | null> {
  const db = getFirestoreInstance();
  const docRef = doc(db, path);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  
  return null;
}

/**
 * Schreibt ein Dokument in Firestore
 */
export async function setDocument(
  path: string,
  data: DocumentData,
  merge = false
): Promise<void> {
  const db = getFirestoreInstance();
  const docRef = doc(db, path);
  return setDoc(docRef, data, { merge });
}

/**
 * Aktualisiert ein Dokument in Firestore
 */
export async function updateDocument(
  path: string,
  data: Partial<DocumentData>
): Promise<void> {
  const db = getFirestoreInstance();
  const docRef = doc(db, path);
  return updateDoc(docRef, data);
}

/**
 * Löscht ein Dokument aus Firestore
 */
export async function deleteDocument(path: string): Promise<void> {
  const db = getFirestoreInstance();
  const docRef = doc(db, path);
  return deleteDoc(docRef);
}

/**
 * Query-Builder-Helper
 */
export function buildQuery(
  collectionPath: string,
  constraints: QueryConstraint[]
) {
  const db = getFirestoreInstance();
  const collectionRef = collection(db, collectionPath);
  return query(collectionRef, ...constraints);
}

/**
 * Liest eine Collection aus Firestore
 */
export async function getCollection<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const q = buildQuery(collectionPath, constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
}

/**
 * Realtime-Listener für ein Dokument
 */
export function onDocumentSnapshot<T = DocumentData>(
  path: string,
  callback: (data: T | null) => void
): Unsubscribe {
  const db = getFirestoreInstance();
  const docRef = doc(db, path);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as T);
    } else {
      callback(null);
    }
  });
}

/**
 * Realtime-Listener für eine Collection
 */
export function onCollectionSnapshot<T = DocumentData>(
  collectionPath: string,
  callback: (data: T[]) => void,
  constraints: QueryConstraint[] = []
): Unsubscribe {
  const q = buildQuery(collectionPath, constraints);
  
  return onSnapshot(q, (querySnapshot) => {
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    callback(data);
  });
}

// Export Firestore-Helper-Funktionen
export { where, orderBy, limit };
export type { WhereFilterOp, OrderByDirection };
