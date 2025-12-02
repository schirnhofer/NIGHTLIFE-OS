'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Loader } from '@nightlife-os/ui';
import { useAuth, useCheckIn, useI18n } from '@nightlife-os/core';
import { Home, MessageCircle, Users, Music, LogIn, LogOut, UserCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { t, locale, setLocale } = useI18n();
  
  // Check-In für Demo-Club
  const { checkIn, checkOut, currentStatus, loading: checkInLoading } = useCheckIn('demo-club-1', user?.uid);
  
  const [actionLoading, setActionLoading] = useState(false);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await checkIn();
    } catch (err) {
      console.error('Check-in error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await checkOut();
    } catch (err) {
      console.error('Check-out error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className=\"min-h-screen bg-slate-900 p-8\">
      <div className=\"max-w-4xl mx-auto\">
        {/* Header */}
        <div className=\"text-center mb-12\">
          <h1 className=\"text-4xl font-bold text-cyan-400 mb-2\">
            Nightlife OS
          </h1>
          <p className=\"text-xl text-slate-300\">
            🎵 Club App - Besucher-PWA
          </p>
        </div>

        {/* Auth Status & Check-In */}
        {authLoading ? (
          <Card className=\"mb-8\">
            <CardContent className=\"py-8\">
              <div className=\"flex items-center justify-center gap-3\">
                <Loader size=\"md\" />
                <p className=\"text-slate-300\">{t('common.loading')}</p>
              </div>
            </CardContent>
          </Card>
        ) : isAuthenticated ? (
          // Eingeloggt - Check-In/Out
          <Card className=\"mb-8\">
            <CardHeader>
              <div className=\"flex items-center justify-between\">
                <div className=\"flex items-center gap-3\">
                  <UserCircle className=\"h-6 w-6 text-cyan-400\" />
                  <CardTitle>{t('common.welcome')}, {user?.displayName || user?.email?.split('@')[0]}</CardTitle>
                </div>
                <Button
                  size=\"sm\"
                  variant=\"ghost\"
                  onClick={() => router.push('/auth/profile')}
                >
                  <UserCircle className=\"h-4 w-4 mr-2\" />
                  {t('profile.title')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Check-In Status */}
              <div className=\"space-y-4\">
                <div className=\"flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700\">
                  <div className=\"flex items-center gap-3\">
                    {currentStatus === 'loading' ? (
                      <Loader2 className=\"h-5 w-5 animate-spin text-slate-400\" />
                    ) : currentStatus === 'checked_in' ? (
                      <CheckCircle className=\"h-5 w-5 text-green-400\" />
                    ) : (
                      <XCircle className=\"h-5 w-5 text-slate-400\" />
                    )}
                    <div>
                      <p className=\"text-sm text-slate-400\">Status</p>
                      <p className=\"text-lg font-semibold text-slate-200\">
                        {currentStatus === 'loading' 
                          ? t('checkin.status.loading')
                          : currentStatus === 'checked_in'
                          ? t('checkin.status.checkedIn')
                          : t('checkin.status.checkedOut')
                        }
                      </p>
                    </div>
                  </div>
                  
                  {currentStatus !== 'loading' && (
                    <Button
                      variant={currentStatus === 'checked_in' ? 'danger' : 'success'}
                      onClick={currentStatus === 'checked_in' ? handleCheckOut : handleCheckIn}
                      disabled={actionLoading || checkInLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className=\"h-4 w-4 animate-spin\" />
                      ) : currentStatus === 'checked_in' ? (
                        t('checkin.button.checkOut')
                      ) : (
                        t('checkin.button.checkIn')
                      )}
                    </Button>
                  )}
                </div>
                
                <p className=\"text-xs text-slate-400 text-center\">
                  Demo-Club: demo-club-1
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Nicht eingeloggt - Login/Signup
          <Card className=\"mb-8\">
            <CardHeader>
              <CardTitle>{t('common.welcome')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className=\"text-slate-300 mb-6\">
                Melde dich an oder registriere dich, um alle Features zu nutzen.
              </p>
              <div className=\"flex gap-4\">
                <Button variant=\"default\" fullWidth onClick={() => router.push('/auth/login')}>
                  <LogIn className=\"h-4 w-4 mr-2\" />
                  {t('auth.login')}
                </Button>
                <Button variant=\"ghost\" fullWidth onClick={() => router.push('/auth/signup')}>
                  {t('auth.signup')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6 mb-8\">
          <Card hover>
            <CardHeader>
              <div className=\"flex items-center gap-3\">
                <Home className=\"h-6 w-6 text-cyan-400\" />
                <CardTitle className=\"text-lg\">{t('home.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className=\"text-sm text-slate-400\">
                Check-In/Out, QR-Code, Status
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className=\"flex items-center gap-3\">
                <MessageCircle className=\"h-6 w-6 text-cyan-400\" />
                <CardTitle className=\"text-lg\">{t('chat.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className=\"text-sm text-slate-400\">
                1:1 und Gruppen-Chats, Ephemeral Images
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className=\"flex items-center gap-3\">
                <Users className=\"h-6 w-6 text-cyan-400\" />
                <CardTitle className=\"text-lg\">{t('friends.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className=\"text-sm text-slate-400\">
                Freunde hinzufügen via Friend-Code
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className=\"flex items-center gap-3\">
                <Music className=\"h-6 w-6 text-cyan-400\" />
                <CardTitle className=\"text-lg\">Lichtshow</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className=\"text-sm text-slate-400\">
                Overlays, Countdown, Gewinnspiele
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Language Switcher */}
        <div className=\"mt-8 text-center\">
          <p className=\"text-sm text-slate-400 mb-2\">Sprache wechseln:</p>
          <div className=\"flex gap-2 justify-center\">
            <Button size=\"sm\" variant=\"ghost\" onClick={() => setLocale('de')}>
              🇩🇪 DE
            </Button>
            <Button size=\"sm\" variant=\"ghost\" onClick={() => setLocale('en')}>
              🇬🇧 EN
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
