/**
 * Helper-Funktionen für die Multi-Club-Struktur
 */

/**
 * Generiert den Pfad für ein User-Profil in der Multi-Club-Struktur
 */
export const getUserProfilePath = (clubId: string, userId: string): string => {
  return `clubs/${clubId}/users/${userId}`
}

/**
 * Generiert den Pfad für den globalen Club-Status
 */
export const getClubStatePath = (clubId: string): string => {
  return `clubs/${clubId}/state/global`
}

/**
 * Generiert den Pfad für eine Chat-Message
 */
export const getChatMessagePath = (clubId: string, chatId: string, messageId?: string): string => {
  const basePath = `clubs/${clubId}/chats/${chatId}/messages`
  return messageId ? `${basePath}/${messageId}` : basePath
}

/**
 * Generiert den Pfad für Freunde in der Multi-Club-Struktur
 */
export const getFriendsPath = (clubId: string, userId: string, friendId?: string): string => {
  const basePath = `clubs/${clubId}/users/${userId}/friends`
  return friendId ? `${basePath}/${friendId}` : basePath
}

/**
 * Generiert den Pfad für Freundschaftsanfragen
 */
export const getRequestsPath = (clubId: string, userId: string, requestId?: string): string => {
  const basePath = `clubs/${clubId}/users/${userId}/requests`
  return requestId ? `${basePath}/${requestId}` : basePath
}

/**
 * Standard-Club-ID (für Entwicklung/Testing)
 * In Produktion sollte dies konfigurierbar sein
 */
export const DEFAULT_CLUB_ID = 'default-club'

/**
 * Holt die aktuelle Club-ID aus dem Environment oder verwendet Default
 */
export const getCurrentClubId = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    // Kann später aus URL-Parameter oder Subdomain gelesen werden
    const params = new URLSearchParams(window.location.search)
    const clubId = params.get('clubId')
    if (clubId) return clubId
  }
  
  return DEFAULT_CLUB_ID
}
