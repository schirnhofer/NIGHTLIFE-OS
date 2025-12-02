/**
 * Settings Overview Page
 * Phase 8: Settings Hub
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useI18n } from '@nightlife-os/core';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@nightlife-os/ui';
import { Settings, Bell, Shield, User, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="h-7 w-7 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">
              {t('settings.title')}
            </h1>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="space-y-4">
          {/* Benachrichtigungen */}
          <Card
            className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-800/70 transition-colors"
            onClick={() => router.push('/settings/notifications')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-600/20 rounded-lg">
                  <Bell className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {t('settings.notifications')}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Push-Benachrichtigungen und Alerts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profil */}
          <Card
            className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-800/70 transition-colors"
            onClick={() => router.push('/auth/profile')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <User className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {t('settings.account')}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Profil und Freunde-Code
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privatsphäre (Placeholder) */}
          <Card className="bg-slate-800/50 border-slate-700 opacity-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600/20 rounded-lg">
                  <Shield className="h-6 w-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {t('settings.privacy')}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Demnächst verfügbar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mt-6 w-full text-white border-slate-700 hover:bg-slate-800/50"
        >
          {t('common.back')}
        </Button>
      </div>
    </div>
  );
}
