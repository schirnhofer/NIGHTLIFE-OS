/**
 * Generiert eine eindeutige Device-ID (UUID v4)
 * Diese wird lokal im Browser gespeichert und nur der Hash wird an Firebase gesendet
 */
export const generateDeviceId = (): string => {
  // UUID v4 generieren
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Speichert die Device-ID in IndexedDB
 */
export const saveDeviceId = async (deviceId: string): Promise<void> => {
  if (typeof window === 'undefined' || !window.indexedDB) {
    console.warn('IndexedDB nicht verfügbar')
    return
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NightlifeDB', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['device'], 'readwrite')
      const store = transaction.objectStore('device')
      store.put({ id: 'deviceId', value: deviceId })
      
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('device')) {
        db.createObjectStore('device', { keyPath: 'id' })
      }
    }
  })
}

/**
 * Lädt die Device-ID aus IndexedDB
 */
export const loadDeviceId = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !window.indexedDB) {
    console.warn('IndexedDB nicht verfügbar')
    return null
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NightlifeDB', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      
      if (!db.objectStoreNames.contains('device')) {
        resolve(null)
        return
      }

      const transaction = db.transaction(['device'], 'readonly')
      const store = transaction.objectStore('device')
      const getRequest = store.get('deviceId')

      getRequest.onsuccess = () => {
        resolve(getRequest.result?.value || null)
      }
      getRequest.onerror = () => reject(getRequest.error)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('device')) {
        db.createObjectStore('device', { keyPath: 'id' })
      }
    }
  })
}

/**
 * Holt oder generiert die Device-ID
 */
export const getOrCreateDeviceId = async (): Promise<string> => {
  let deviceId = await loadDeviceId()
  
  if (!deviceId) {
    deviceId = generateDeviceId()
    await saveDeviceId(deviceId)
  }

  return deviceId
}
