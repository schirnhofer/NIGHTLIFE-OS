/**
 * Video-Recorder-Button Komponente
 * 
 * Phase 6: Video-Aufnahme mit MediaRecorder API
 * - Max. 30 Sekunden (Hard Limit)
 * - Video + Audio
 * - Browser-Kamera-Zugriff
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Video, Square } from 'lucide-react';
import { cn } from '../utils/cn';

export interface VideoRecorderButtonProps {
  maxDurationSeconds?: number;
  onRecorded?: (file: File, durationSeconds: number) => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * Video-Recorder-Button
 * 
 * Nimmt Video (+ Audio) auf und gibt File zurück
 * - Hard Limit: 30 Sekunden (default)
 * - Toggle: Mic-Icon (inaktiv) / Square-Icon (aktiv)
 * - Timer-Anzeige während Aufnahme
 */
export function VideoRecorderButton({
  maxDurationSeconds = 30,
  onRecorded,
  onError,
  className
}: VideoRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request camera + microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
        const file = new File([blob], `video_${Date.now()}.${ext}`, {
          type: mimeType
        });

        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        if (onRecorded) {
          onRecorded(file, duration);
        }

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Reset state
        setIsRecording(false);
        setRecordingTime(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;

          // Auto-stop after maxDurationSeconds
          if (newTime >= maxDurationSeconds) {
            stopRecording();
            return maxDurationSeconds;
          }

          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting video recording:', error);
      if (onError) {
        onError(error as Error);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleRecording}
      className={cn(
        'flex items-center gap-1 px-3 py-2 rounded-lg transition-colors',
        isRecording
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
        className
      )}
    >
      {isRecording ? (
        <>
          <Square className="h-4 w-4" />
          <span className="text-sm font-mono">
            {recordingTime}s / {maxDurationSeconds}s
          </span>
        </>
      ) : (
        <>
          <Video className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
