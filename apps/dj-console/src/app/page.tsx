'use client';

import { Button, Card, CardHeader, CardTitle, CardContent } from '@nightlife-os/ui';
import { useI18n } from '@nightlife-os/core';
import { Music, Lightbulb, Bell, Users } from 'lucide-react';

export default function DJConsolePage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">
            Nightlife OS
          </h1>
          <p className="text-xl text-slate-300">
            🎛️ DJ-Console - Steuerung
          </p>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('dj.console')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Dies ist die <strong>DJ-Console</strong> für DJ/Lichtjockey. In Phase 1 ist dies ein minimaler Screen.
            </p>
            <p className="text-slate-400 text-sm">
              Steuere Lichtshow, Audio-Sync, Gewinnspiele und Broadcasts.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
                <CardTitle className="text-lg">{t('dj.lightshow')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Farben, Effekte, Stroboskop
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Music className="h-6 w-6 text-purple-400" />
                <CardTitle className="text-lg">{t('dj.audioSync')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Mikrofon-Anbindung, Reaktive Beleuchtung
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-green-400" />
                <CardTitle className="text-lg">{t('dj.lottery')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Gewinnspiele starten, Gewinner auswählen
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-lg">{t('dj.guestList')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Eingecheckte Gäste anzeigen
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Button variant="default" fullWidth>
          {t('auth.login')}
        </Button>
      </div>
    </main>
  );
}
