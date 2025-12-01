'use client'

import QRCode from 'qrcode'

/**
 * Generiert einen QR-Code als Data-URL
 */
export const generateQRCode = async (text: string, size: number = 300): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
    return dataUrl
  } catch (err) {
    console.error('QR-Code Fehler:', err)
    throw err
  }
}
