'use client';

import { Button, Card, CardHeader, CardTitle, CardContent } from '@nightlife-os/ui';
import { useI18n } from '@nightlife-os/core';
import { Settings, Users, BarChart3, CreditCard } from 'lucide-react';

export default function ClubAdminPage() {
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
            🏢 Club-Admin - Dashboard
          </p>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('admin.dashboard')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Dies ist das <strong>Club-Admin Dashboard</strong> für Club-Owner. In Phase 1 ist dies ein minimaler Screen.
            </p>
            <p className="text-slate-400 text-sm">
              Verwalte deinen Club, Personal, Einstellungen und Abo.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-green-400" />
                <CardTitle className="text-lg">{t('admin.analytics')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Besucherstatistiken, Umsatz, Trends
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-lg">{t('admin.staff')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Personal hinzufügen, Rollen verwalten
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-purple-400" />
                <CardTitle className="text-lg">{t('admin.settings')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Club-Einstellungen, Theme, Features
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-yellow-400" />
                <CardTitle className="text-lg">{t('admin.subscription')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Abo-Verwaltung, Rechnungen, Upgrade
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
