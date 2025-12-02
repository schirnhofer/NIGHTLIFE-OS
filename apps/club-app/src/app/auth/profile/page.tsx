'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Loader } from '@nightlife-os/ui';
import { useAuth, usePlatformUserData, useI18n } from '@nightlife-os/core';
import { User as UserIcon, Mail, Code, LogOut, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, signOut } = useAuth();
  const { user: platformUser, loading: userLoading, generateNewFriendCode } = usePlatformUserData(user?.uid);
  const { t } = useI18n();
  
  const [generatingCode, setGeneratingCode] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Redirect wenn nicht angemeldet
  if (!authLoading && !isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const handleGenerateFriendCode = async () => {
    setGeneratingCode(true);
    try {
      await generateNewFriendCode();
    } catch (err) {
      console.error('Error generating friend code:', err);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (authLoading || userLoading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader size="lg" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            {t('profile.myProfile')}
          </h1>
          <p className="text-slate-300">
            {t('profile.title')}
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserIcon className="h-6 w-6 text-cyan-400" />
              <CardTitle>{t('profile.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display Name */}
            <div className="flex items-start gap-3">
              <UserIcon className="h-5 w-5 text-slate-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-slate-400">{t('profile.displayName')}</p>
                <p className="text-lg text-slate-200">
                  {platformUser?.displayName || user?.displayName || 'Kein Name'}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-slate-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-slate-400">{t('auth.email')}</p>
                <p className="text-lg text-slate-200">
                  {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Friend Code Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Code className="h-6 w-6 text-cyan-400" />
              <CardTitle>{t('profile.friendCode')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {platformUser?.friendCode ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="text-3xl font-mono text-center text-cyan-400 tracking-widest">
                    {platformUser.friendCode}
                  </p>
                </div>
                <p className="text-sm text-slate-400 text-center">
                  Teile diesen Code mit deinen Freunden
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-400 text-center">
                  {t('profile.noFriendCode')}
                </p>
                <Button
                  variant="default"
                  fullWidth
                  onClick={handleGenerateFriendCode}
                  disabled={generatingCode}
                >
                  {generatingCode ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('profile.generateFriendCode')
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push('/')}
          >
            Zurück zur Startseite
          </Button>
          
          <Button
            variant="danger"
            fullWidth
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                {t('auth.logout')}
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
