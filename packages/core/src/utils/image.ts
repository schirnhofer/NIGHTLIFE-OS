/**
 * Komprimiert ein Bild-File zu Base64
 * Verwendet Compressor.js in der club-app
 */
export interface CompressImageOptions {
  quality?: number // 0-1, default: 0.6
  maxWidth?: number // default: 800
  maxHeight?: number // default: 800
}

/**
 * Helper-Funktion für Bild-Kompression (muss in der App implementiert werden)
 * Diese Funktion ist nur ein Interface - die eigentliche Implementierung
 * erfolgt in den Apps mit Compressor.js
 */
export const compressImage = async (
  file: File,
  options: CompressImageOptions = {}
): Promise<string> => {
  const {
    quality = 0.6,
    maxWidth = 800,
    maxHeight = 800
  } = options

  // Diese Funktion muss in der App mit Compressor.js überschrieben werden
  throw new Error('compressImage muss in der App implementiert werden')
}

/**
 * Konvertiert ein File zu Base64 ohne Kompression
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}
