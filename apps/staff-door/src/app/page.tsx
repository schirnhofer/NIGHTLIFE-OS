'use client';

import { Button, Card, CardHeader, CardTitle, CardContent } from '@nightlife-os/ui';
import { useI18n } from '@nightlife-os/core';
import { QrCode, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

export default function StaffDoorPage() {
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
            🚪 Staff Door - Türsteher
          </p>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('staff.door.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Dies ist die <strong>Türsteher-App</strong> für Door Security. In Phase 1 ist dies ein minimaler Screen.
            </p>
            <p className="text-slate-400 text-sm">
              QR-Codes scannen, Trust-Level prüfen, Check-In/Out.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <QrCode className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-lg">{t('staff.door.scanQR')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Gäste-QR-Code scannen
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-green-400" />
                <CardTitle className="text-lg">{t('staff.door.trustLevel')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Trust-Level prüfen
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <UserCheck className="h-6 w-6 text-blue-400" />
                <CardTitle className="text-lg">{t('staff.door.verify')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Nutzer verifizieren
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <CardTitle className="text-lg">{t('staff.door.blacklist')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Blacklist-Prüfung
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
