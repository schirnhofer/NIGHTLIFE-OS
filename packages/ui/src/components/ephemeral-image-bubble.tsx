/**
 * Ephemeral-Image-Bubble-Komponente
 * 
 * Phase 5: Selbstzerstörende Bilder mit Timer
 */

'use client';

import { useState, useEffect } from 'react';
import { Eye, Timer } from 'lucide-react';
import { cn } from '../utils/cn';

export interface EphemeralImageBubbleProps {
  imageUrl: string;
  ephemeralSeconds: number;
  onExpire: () => void;
  className?: string;
}

/**
 * Ephemeral Image Bubble (selbstzerstörend)
 */
export function EphemeralImageBubble({
  imageUrl,
  ephemeralSeconds,
  onExpire,
  className
}: EphemeralImageBubbleProps) {
  const [isViewing, setIsViewing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(ephemeralSeconds);
  const [timerStarted, setTimerStarted] = useState(false);

  /**
   * Timer-Logik
   */
  useEffect(() => {
    if (!timerStarted || !isViewing) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 0.1;
        if (next <= 0) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [timerStarted, isViewing, onExpire]);

  /**
   * Bild anzeigen und Timer starten
   */
  const handleView = () => {
    setIsViewing(true);
    setTimerStarted(true);
  };

  if (!isViewing) {
    // Overlay: "Tippen zum Anzeigen"
    return (
      <button
        type="button"
        onClick={handleView}
        className={cn(
          'relative w-full h-48 bg-gradient-to-br from-cyan-900/50 to-blue-900/50',
          'rounded-lg overflow-hidden border border-cyan-500/30',
          'flex flex-col items-center justify-center gap-2',
          'hover:from-cyan-800/50 hover:to-blue-800/50 transition-all',
          className
        )}
      >
        <Eye className="h-8 w-8 text-cyan-400" />
        <p className="text-sm text-cyan-300 font-medium">Tippen zum Anzeigen</p>
        <p className="text-xs text-slate-400">
          <Timer className="inline h-3 w-3 mr-1" />
          Verschwindet in {ephemeralSeconds}s
        </p>
      </button>
    );
  }

  // Bild anzeigen mit Countdown
  return (
    <div className={cn('relative', className)}>
      <img
        src={imageUrl}
        alt="Ephemeral"
        className="w-full rounded-lg"
      />

      {/* Countdown-Overlay */}
      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
        <Timer className="inline h-3 w-3 mr-1" />
        {remainingSeconds.toFixed(1)}s
      </div>
    </div>
  );
}
