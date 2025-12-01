'use client'

import { useState, useEffect } from 'react'
import { 
  doc,
  onSnapshot,
  DocumentData,
  DocumentReference
} from 'firebase/firestore'
import { getDbInstance } from '../lib/firebase'

/**
 * Custom Hook für Firestore Realtime-Listener auf ein Dokument
 */
export const useFirestoreDoc = <T = DocumentData>(
  path: string,
  enabled = true
): { data: T | null; loading: boolean; error: Error | null } => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled || !path) {
      setLoading(false)
      return
    }

    try {
      const db = getDbInstance()
      const docRef = doc(db, path)

      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setData(snapshot.data() as T)
          } else {
            setData(null)
          }
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.error('Firestore Fehler:', err)
          setError(err as Error)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error('Firestore Init Fehler:', err)
      setError(err as Error)
      setLoading(false)
    }
  }, [path, enabled])

  return { data, loading, error }
}
