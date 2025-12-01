/**
 * Generiert einen SHA-256 Hash aus einem String
 * @param input Der zu hashende String
 * @returns Hex-String des Hashes
 */
export const sha256 = async (input: string): Promise<string> => {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API nicht verfügbar')
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

/**
 * Generiert einen SHA-256 Hash der Device-ID
 */
export const hashDeviceId = async (deviceId: string): Promise<string> => {
  return sha256(deviceId)
}
