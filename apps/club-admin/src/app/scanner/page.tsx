'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Loader, ShortCodeScanner } from '@nightlife-os/ui';
import { 
  useAuth, 
  checkInByShortCode 
} from '@nightlife-os/core';
import { QrCode, ArrowLeft } from 'lucide-react';

export default function ScannerPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Club-ID (in echter Anwendung würde das aus dem User-Profil oder einer Auswahl kommen)
  const [clubId] = useState('club-demo-001');

  // Redirect wenn nicht angemeldet
  if (!authLoading && !isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  /**
   * Handle Check-In via Shortcode
   */
  const handleCheckIn = async (shortCode: string, source: 'qr' | 'manual') => {
    try {
      const result = await checkInByShortCode(shortCode, clubId, source);
      
      return {
        success: result.success,
        message: result.message,
        userProfile: result.userProfile
      };
    } catch (error) {
      console.error('Check-In error:', error);
      return {
        success: false,
        message: 'Fehler beim Check-In'
      };
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader size="lg" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            Shortcode Scanner
          </h1>
          <p className="text-slate-300">
            Scanne QR-Codes oder gib Shortcodes manuell ein
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <QrCode className="h-6 w-6 text-cyan-400" />
              <CardTitle>Check-In System</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-3">
              Verwende den QR-Scanner oder die manuelle Eingabe, um Gäste einzuchecken.
            </p>
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400">
                <strong>Aktueller Club:</strong> {clubId}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scanner */}
        <Card>
          <CardContent className="pt-6">
            <ShortCodeScanner
              clubId={clubId}
              onCheckIn={handleCheckIn}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Startseite
          </Button>
        </div>

        {/* Hinweise */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-cyan-400 mb-2">
            Hinweise:
          </h3>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• Der QR-Scanner benötigt Kamera-Zugriff</li>
            <li>• Bei schlechten Lichtverhältnissen nutze die Taschenlampe</li>
            <li>• Format: WORT 1234 (z.B. "BOOM 1234")</li>
            <li>• Nach 4 Buchstaben springt der Fokus automatisch zur Zahlen-Eingabe</li>
            <li>• Nach 4 Ziffern wird der Check-In automatisch durchgeführt</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
