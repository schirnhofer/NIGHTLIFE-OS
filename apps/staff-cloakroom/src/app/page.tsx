'use client';

import { Button, Card, CardHeader, CardTitle, CardContent } from '@nightlife-os/ui';
import { useI18n } from '@nightlife-os/core';
import { Package, PackageOpen, QrCode, Printer } from 'lucide-react';

export default function StaffCloakroomPage() {
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
            🧥 Staff Cloakroom - Garderobe
          </p>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('staff.cloakroom.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Dies ist die <strong>Garderoben-App</strong> für Garderobe-Personal. In Phase 1 ist dies ein minimaler Screen.
            </p>
            <p className="text-slate-400 text-sm">
              Gegenstände einlagern/ausgeben, Tickets verwalten.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-lg">{t('staff.cloakroom.checkIn')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Gegenstand einlagern
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <PackageOpen className="h-6 w-6 text-green-400" />
                <CardTitle className="text-lg">{t('staff.cloakroom.checkOut')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Gegenstand ausgeben
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <QrCode className="h-6 w-6 text-purple-400" />
                <CardTitle className="text-lg">{t('staff.cloakroom.ticket')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Ticket scannen
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Printer className="h-6 w-6 text-yellow-400" />
                <CardTitle className="text-lg">Ticket Drucken</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Neues Ticket drucken
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
