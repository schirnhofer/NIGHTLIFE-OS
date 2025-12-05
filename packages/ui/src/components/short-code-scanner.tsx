/**
 * ShortCodeScanner Komponente (Phase 9)
 * 
 * Einheitliches Scanner-UI für Shortcode-basierte Check-Ins
 * - QR-Scanner (html5-qrcode)
 * - Manuelle Eingabe (WORT + ZAHL)
 * - Taschenlampen-Support
 * - Feedback-Bereich
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Flashlight, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from './button';
import { Input } from './input';

export interface ShortCodeScannerProps {
  clubId: string;
  onCheckIn: (shortCode: string, source: 'qr' | 'manual') => Promise<{
    success: boolean;
    message?: string;
    userProfile?: any;
  }>;
  className?: string;
}

/**
 * ShortCodeScanner für Check-Ins
 */
export function ShortCodeScanner({ onCheckIn, className }: ShortCodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Manuelle Eingabe
  const [word, setWord] = useState('');
  const [number, setNumber] = useState('');
  
  // Feedback
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'loading' | null;
    message: string;
    userProfile?: any;
  }>({ type: null, message: '' });

  /**
   * Start QR-Scanner
   */
  useEffect(() => {
    let scanner: Html5Qrcode | null = null;

    const startScanning = async () => {
      try {
        scanner = new Html5Qrcode('shortcode-scanner-region');
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        };

        await scanner.start(
          // Browser-spezifische MediaTrackConstraints
          { 
            facingMode: 'environment',
            advanced: [
              { focusMode: 'continuous' },
              { zoom: 1.0 }
            ]
          } as any,
          config,
          async (decodedText) => {
            // Parse und verarbeite Shortcode
            const shortCode = normalizeShortCode(decodedText);
            if (shortCode) {
              await handleCheckIn(shortCode, 'qr');
            }
          },
          () => {
            // Scan-Fehler ignorieren (normal)
          }
        );

        setIsScanning(true);
        setError(null);
        
        // Prüfe Torch-Support
        checkTorchSupport();
        
      } catch (err: any) {
        console.error('QR Scanner error:', err);
        setError('Kamera-Zugriff fehlgeschlagen. Bitte nutze die manuelle Eingabe.');
        setIsScanning(false);
      }
    };

    startScanning();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    };
  }, []);

  /**
   * Prüfe Torch/Flashlight Support
   */
  const checkTorchSupport = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      // @ts-ignore - torch ist nicht in allen TS-Definitionen
      if (capabilities.torch) {
        setTorchSupported(true);
      }
      
      // Stream wieder stoppen
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.log('Torch not supported:', err);
    }
  };

  /**
   * Toggle Taschenlampe
   */
  const toggleTorch = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      const track = stream.getVideoTracks()[0];
      
      // Browser-spezifische MediaTrackConstraints (torch)
      await (track as any).applyConstraints({
        advanced: [{ torch: !isTorchOn }]
      });
      
      setIsTorchOn(!isTorchOn);
    } catch (err) {
      console.error('Error toggling torch:', err);
    }
  };

  /**
   * Normalisiere Shortcode
   */
  const normalizeShortCode = (raw: string): string | null => {
    const normalized = raw.trim().toUpperCase().replace(/\s+/g, ' ');
    
    // Format: "WORT 1234"
    const match = normalized.match(/^([A-Z]{4})\s+(\d{4})$/);
    if (match) {
      return normalized;
    }
    
    return null;
  };

  /**
   * Handle Check-In
   */
  const handleCheckIn = async (shortCode: string, source: 'qr' | 'manual') => {
    setFeedback({ type: 'loading', message: 'Prüfe Shortcode...' });
    
    try {
      const result = await onCheckIn(shortCode, source);
      
      if (result.success) {
        setFeedback({
          type: 'success',
          message: result.message || 'Check-In erfolgreich!',
          userProfile: result.userProfile
        });
        
        // Reset nach 3 Sekunden
        setTimeout(() => {
          setFeedback({ type: null, message: '' });
          setWord('');
          setNumber('');
        }, 3000);
      } else {
        setFeedback({
          type: 'error',
          message: result.message || 'Check-In fehlgeschlagen.'
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Fehler beim Check-In.'
      });
    }
  };

  /**
   * Handle Word Input
   */
  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 4);
    setWord(value);
    
    // Auto-Focus zu Number nach 4 Buchstaben
    if (value.length === 4 && numberInputRef.current) {
      numberInputRef.current.focus();
    }
  };

  /**
   * Handle Number Input
   */
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setNumber(value);
    
    // Auto-Submit nach 4 Ziffern
    if (value.length === 4 && word.length === 4) {
      const shortCode = `${word} ${value}`;
      handleCheckIn(shortCode, 'manual');
    }
  };

  /**
   * Handle Manual Submit
   */
  const handleManualSubmit = () => {
    if (word.length === 4 && number.length === 4) {
      const shortCode = `${word} ${number}`;
      handleCheckIn(shortCode, 'manual');
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* QR-Scanner */}
      <div className="relative">
        <div
          id="shortcode-scanner-region"
          className="rounded-lg overflow-hidden bg-slate-900 min-h-[300px]"
        />
        
        {/* Scanner Status */}
        {isScanning && (
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-sm text-white bg-black/70 px-4 py-2 rounded-full inline-block">
              <Camera className="inline w-4 h-4 mr-2" />
              Scanne QR-Code...
            </p>
          </div>
        )}
        
        {/* Torch Button */}
        {torchSupported && (
          <Button
            onClick={toggleTorch}
            className="absolute top-4 right-4"
            size="sm"
            variant={isTorchOn ? 'default' : 'ghost'}
          >
            <Flashlight className="w-5 h-5" />
          </Button>
        )}
        
        {/* Error */}
        {error && (
          <div className="absolute top-4 left-4 right-16">
            <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Manuelle Eingabe */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">Oder manuelle Eingabe</h3>
        
        <div className="flex gap-3 items-center justify-center">
          <Input
            ref={wordInputRef}
            type="text"
            placeholder="WORT"
            value={word}
            onChange={handleWordChange}
            maxLength={4}
            className="w-32 text-center text-2xl font-bold uppercase"
          />
          
          <span className="text-2xl font-bold">-</span>
          
          <Input
            ref={numberInputRef}
            type="tel"
            placeholder="1234"
            value={number}
            onChange={handleNumberChange}
            maxLength={4}
            className="w-32 text-center text-2xl font-bold"
          />
        </div>
        
        <div className="text-center">
          <Button
            onClick={handleManualSubmit}
            disabled={word.length !== 4 || number.length !== 4}
            size="lg"
          >
            Check-In starten
          </Button>
        </div>
      </div>

      {/* Feedback */}
      {feedback.type && (
        <div
          className={cn(
            'p-4 rounded-lg text-center',
            feedback.type === 'success' && 'bg-green-500/20 border border-green-500',
            feedback.type === 'error' && 'bg-red-500/20 border border-red-500',
            feedback.type === 'loading' && 'bg-blue-500/20 border border-blue-500'
          )}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            {feedback.type === 'loading' && <Loader2 className="w-6 h-6 animate-spin" />}
            {feedback.type === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
            {feedback.type === 'error' && <XCircle className="w-6 h-6 text-red-500" />}
          </div>
          
          <p className="font-medium">{feedback.message}</p>
          
          {feedback.userProfile && (
            <div className="mt-3 text-sm">
              <p className="text-slate-300">
                {feedback.userProfile.displayName || 'Gast'}
              </p>
              {feedback.userProfile.shortCode && (
                <p className="text-slate-400 text-xs mt-1">
                  {feedback.userProfile.shortCode}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
