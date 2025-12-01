'use client'

import Compressor from 'compressorjs'

/**
 * Komprimiert ein Bild-File zu Base64
 */
export const compressImage = async (
  file: File,
  options: {
    quality?: number
    maxWidth?: number
    maxHeight?: number
  } = {}
): Promise<string> => {
  const { quality = 0.6, maxWidth = 800, maxHeight = 800 } = options

  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality,
      maxWidth,
      maxHeight,
      success(result) {
        const reader = new FileReader()
        reader.readAsDataURL(result as Blob)
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
      },
      error(err) {
        reject(err)
      },
    })
  })
}
