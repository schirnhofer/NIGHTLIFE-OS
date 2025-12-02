/**
 * QR-Scanner-Komponente
 * 
 * Phase 5: Integration mit html5-qrcode
 * Erkennt nightlife://user/{FRIENDCODE} Format
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { cn } from '../utils/cn';

export interface QrScannerProps {
  onCodeScanned: (code: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * QR-Scanner für Friend-Codes
 */
export function QrScanner({ onCodeScanned, onError, className }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;

    const startScanning = async () => {
      try {
        // Erstelle Scanner-Instanz
        scanner = new Html5Qrcode('qr-scanner-region');
        scannerRef.current = scanner;

        // Starte Kamera
        await scanner.start(
          { facingMode: 'environment' }, // Rückkamera bevorzugen
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // Parse QR-Code
            const parsedCode = parseQRCode(decodedText);
            if (parsedCode) {
              onCodeScanned(parsedCode);
              // Stoppe Scanner nach erfolgreichem Scan
              stopScanning();
            } else {
              setError('Ungültiges QR-Format');
            }
          },
          () => {
            // Scan-Fehler (normal, passiert oft)
          }
        );

        setIsScanning(true);
        setError(null);
      } catch (err: any) {
        console.error('QR Scanner error:', err);
        setError('Kamera-Zugriff fehlgeschlagen');
        if (onError) {
          onError(err);
        }
      }
    };

    const stopScanning = async () => {
      if (scanner && isScanning) {
        try {
          await scanner.stop();
          scanner.clear();
        } catch (err) {
          console.error('Error stopping scanner:', err);
        }
      }
      setIsScanning(false);
    };

    // Starte Scanner
    startScanning();

    // Cleanup
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    };
  }, [onCodeScanned, onError, isScanning]);

  /**
   * Parse QR-Code und extrahiere Friend-Code
   */
  const parseQRCode = (raw: string): string | null => {
    // Format: nightlife://user/{FRIENDCODE}
    const match = raw.match(/^nightlife:\/\/user\/([A-Z0-9]{7})$/i);
    if (match) {
      return match[1].toUpperCase();
    }
    return null;
  };

  return (
    <div className={cn('relative', className)}>
      {/* Scanner-Region */}
      <div
        id="qr-scanner-region"
        className="rounded-lg overflow-hidden bg-slate-900"
      />

      {/* Status */}
      {isScanning && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-sm text-white bg-black/50 px-4 py-2 rounded-full inline-block">
            Scanne QR-Code...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
