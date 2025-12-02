/**
 * Storage-Utilities für Chat-Medien
 * 
 * Phase 5: Upload von Images, Audio, Video zu Firebase Storage
 */

import { uploadFile as firebaseUploadFile } from '../firebase/storage';

export interface UploadChatMediaResult {
  downloadUrl: string;
  storagePath: string;
}

/**
 * Lädt Chat-Medien zu Firebase Storage hoch
 * 
 * @param clubId Club-ID
 * @param chatId Chat-ID
 * @param file Datei (Image, Audio, Video)
 * @param type Media-Typ
 * @returns Download-URL und Storage-Pfad
 */
export async function uploadChatMedia(
  clubId: string,
  chatId: string,
  file: File,
  type: 'image' | 'audio' | 'video'
): Promise<UploadChatMediaResult> {
  // Generiere eindeutigen Dateinamen
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const ext = file.name.split('.').pop() || 'bin';
  const fileName = `${timestamp}_${randomId}.${ext}`;
  
  // Storage-Pfad
  const storagePath = `clubs/${clubId}/chats/${chatId}/${type}/${fileName}`;
  
  // Upload
  const downloadUrl = await firebaseUploadFile(storagePath, file);
  
  return {
    downloadUrl,
    storagePath
  };
}
