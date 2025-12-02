/**
 * Voice-Recorder-Button-Komponente
 * 
 * Phase 5: Sprachnachrichten mit MediaRecorder API
 * Max. 30 Sekunden Aufnahme
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import { cn } from '../utils/cn';

export interface VoiceRecorderButtonProps {
  maxDurationSeconds?: number;
  onRecorded: (file: File, durationSeconds: number) => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * Voice-Recorder-Button (max. 30 Sekunden)
 */
export function VoiceRecorderButton({
  maxDurationSeconds = 30,
  onRecorded,
  onError,
  className
}: VoiceRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  /**
   * Starte Aufnahme
   */
  const startRecording = async () => {
    try {
      // Prüfe MediaRecorder-Support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaRecorder API not supported');
      }

      // Fordere Mikrofon-Zugriff an
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Erstelle MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Event: Daten verfügbar
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // Event: Aufnahme beendet
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const duration = (Date.now() - startTimeRef.current) / 1000;
        const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });

        // Stoppe Stream
        stream.getTracks().forEach((track) => track.stop());

        // Callback
        onRecorded(file, duration);

        // Reset
        setIsRecording(false);
        setRecordingTime(0);
      };

      // Starte Aufnahme
      mediaRecorder.start();
      startTimeRef.current = Date.now();
      setIsRecording(true);

      // Timer für UI
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setRecordingTime(elapsed);

        // Auto-Stopp nach maxDurationSeconds
        if (elapsed >= maxDurationSeconds) {
          stopRecording();
        }
      }, 100);
    } catch (err: any) {
      console.error('Recording error:', err);
      if (onError) {
        onError(err);
      }
    }
  };

  /**
   * Stoppe Aufnahme
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  /**
   * Toggle Recording
   */
  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'p-2 rounded-full transition-all',
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
        )}
      >
        {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>

      {/* Timer */}
      {isRecording && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-white bg-red-500 px-2 py-1 rounded">
            {recordingTime.toFixed(1)}s / {maxDurationSeconds}s
          </span>
        </div>
      )}
    </div>
  );
}
