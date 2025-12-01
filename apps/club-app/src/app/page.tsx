'use client';

import { Button, Card, CardHeader, CardTitle, CardContent, Loader } from '@nightlife-os/ui';
import { useI18n } from '@nightlife-os/core';
import { Home, MessageCircle, Users, Music } from 'lucide-react';

export default function HomePage() {
  const { t, locale, setLocale } = useI18n();

  return (
    <main className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">
            Nightlife OS
          </h1>
          <p className="text-xl text-slate-300">
            🎵 Club App - Besucher-PWA
          </p>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('common.welcome')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Dies ist die <strong>Club-App</strong> für Gäste. In Phase 1 ist dies ein minimaler Screen.
            </p>
            <p className="text-slate-400 text-sm">
              Sprache: <strong>{locale}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Home className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-lg">{t('home.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Check-In/Out, QR-Code, Status
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-lg">{t('chat.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                1:1 und Gruppen-Chats, Ephemeral Images
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-lg">{t('friends.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Freunde hinzufügen via Friend-Code
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Music className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-lg">Lichtshow</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Overlays, Countdown, Gewinnspiele
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="default" fullWidth>
            {t('auth.login')}
          </Button>
          <Button variant="ghost" fullWidth>
            {t('auth.signup')}
          </Button>
        </div>

        {/* Language Switcher */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400 mb-2">Sprache wechseln:</p>
          <div className="flex gap-2 justify-center">
            <Button size="sm" variant="ghost" onClick={() => setLocale('de')}>
              🇩🇪 DE
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setLocale('en')}>
              🇬🇧 EN
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
