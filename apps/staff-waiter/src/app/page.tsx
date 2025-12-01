'use client';

import { Button, Card, CardHeader, CardTitle, CardContent } from '@nightlife-os/ui';
import { useI18n } from '@nightlife-os/core';
import { ClipboardList, Plus, Table2, CreditCard } from 'lucide-react';

export default function StaffWaiterPage() {
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
            🍸 Staff Waiter - Kellner/Bar
          </p>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('staff.waiter.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Dies ist die <strong>Kellner/Bar-App</strong> für Service-Personal. In Phase 1 ist dies ein minimaler Screen.
            </p>
            <p className="text-slate-400 text-sm">
              Bestellungen verwalten, Tischplan, Bezahlung.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ClipboardList className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-lg">{t('staff.waiter.orders')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Offene Bestellungen anzeigen
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Plus className="h-6 w-6 text-green-400" />
                <CardTitle className="text-lg">{t('staff.waiter.newOrder')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Neue Bestellung erstellen
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Table2 className="h-6 w-6 text-purple-400" />
                <CardTitle className="text-lg">{t('staff.waiter.table')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Tischplan anzeigen
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-yellow-400" />
                <CardTitle className="text-lg">{t('staff.waiter.payment')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Bezahlung abschließen
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
