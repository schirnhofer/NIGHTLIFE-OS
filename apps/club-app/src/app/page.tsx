'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Loader } from '@nightlife-os/ui';
import { useAuth, useCheckIn, useI18n, usePlatformUserData, useFriends, generateUserQR } from '@nightlife-os/core';
import { Home, MessageCircle, Users, Music, LogIn, LogOut, UserCircle, Loader2, CheckCircle, XCircle, QrCode, EyeOff, MapPin, Eye } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { t, locale, setLocale } = useI18n();
  
  // User-Daten
  const { userData: platformUser, loading: userDataLoading } = usePlatformUserData(user?.uid);
  
  // Check-In für Demo-Club
  const { checkIn, checkOut, currentStatus, loading: checkInLoading } = useCheckIn('demo-club-1', user?.uid);
  
  // Friends & Requests
  const { requests, acceptFriendRequest } = useFriends(user?.uid);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

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

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const chatId = await acceptFriendRequest(requestId);
      alert(t('friendSuccess.accepted'));
      // Navigiere direkt zum Chat
      router.push(`/crew/chat/${chatId}`);
    } catch (err) {
      console.error('Error accepting request:', err);
      alert(t('common.error'));
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-400 mb-1">
            Nightlife OS
          </h1>
          <p className="text-sm text-slate-400">
            Club App
          </p>
        </div>

        {/* Auth Status & Check-In */}
        {authLoading ? (
          <Card className="mb-6">
            <CardContent className="py-8">
              <div className="flex items-center justify-center gap-3">
                <Loader size="md" />
                <p className="text-slate-300">{t('common.loading')}</p>
              </div>
            </CardContent>
          </Card>
        ) : isAuthenticated ? (
          // Eingeloggt
          <div className="space-y-4">
            {/* Status-Leiste */}
            <div className={`p-4 rounded-lg text-center font-bold text-lg ${
              currentStatus === 'checked_in' 
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' 
                : 'bg-slate-800 text-slate-400'
            }`}>
              {currentStatus === 'checked_in' ? t('status.inClub') : t('status.outside')}
            </div>

            {/* Freundschaftsanfragen */}
            {requests && requests.length > 0 && requests.filter(r => r.status === 'pending').map(request => (
              <Card key={request.requesterId} className="border-cyan-500/30">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-cyan-400 mb-1">
                        {t('friend.newRequest')}
                      </p>
                      <p className="text-sm text-slate-300 mb-1">
                        {request.displayName || request.email}
                      </p>
                      {request.message && (
                        <p className="text-xs text-slate-400 italic">
                          "{request.message}"
                        </p>
                      )}
                    </div>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleAcceptRequest(request.requesterId)}
                    >
                      {t('friend.accept')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* QR-Code */}
            {platformUser?.friendCode && (
              <Card className="relative overflow-hidden">
                <CardContent className="py-8">
                  <div 
                    className="flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => setQrVisible(!qrVisible)}
                  >
                    {/* QR-Code (Platzhalter) */}
                    <div className={`w-48 h-48 bg-white rounded-lg flex items-center justify-center transition-all duration-300 ${
                      !qrVisible ? 'blur-xl opacity-40' : ''
                    }`}>
                      <QrCode className="h-32 w-32 text-slate-900" />
                    </div>
                    
                    {/* Overlay */}
                    {!qrVisible && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50">
                        <EyeOff className="h-8 w-8 text-white mb-2" />
                        <p className="text-white font-semibold">{t('qr.tapToShow')}</p>
                      </div>
                    )}
                    
                    {/* Friend-Code */}
                    <p className="text-3xl font-bold text-cyan-400 mt-4 tracking-widest">
                      {platformUser.friendCode}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {t('qr.yourCode')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Check-In/Out Button (groß) */}
            <Button
              variant={currentStatus === 'checked_in' ? 'default' : 'default'}
              fullWidth
              size="lg"
              onClick={currentStatus === 'checked_in' ? handleCheckOut : handleCheckIn}
              disabled={actionLoading || checkInLoading}
              className={`py-6 text-lg font-bold ${
                currentStatus === 'checked_in'
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {actionLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <MapPin className="h-5 w-5 mr-2" />
              )}
              {currentStatus === 'checked_in' 
                ? t('checkin.button.checkOut')
                : t('checkin.button.checkIn')
              }
            </Button>

            {/* Navigation */}
            <div className="flex gap-2 mt-6">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => router.push('/crew')}
              >
                <Users className="h-4 w-4 mr-2" />
                {t('crew.title')}
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => router.push('/auth/profile')}
              >
                <UserCircle className="h-4 w-4 mr-2" />
                {t('profile.title')}
              </Button>
            </div>
          </div>
        ) : (
          // Nicht eingeloggt - Login/Signup
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('common.welcome')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-6">
                Melde dich an oder registriere dich, um alle Features zu nutzen.
              </p>
              <div className="flex gap-4">
                <Button variant="default" fullWidth onClick={() => router.push('/auth/login')}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('auth.login')}
                </Button>
                <Button variant="ghost" fullWidth onClick={() => router.push('/auth/signup')}>
                  {t('auth.signup')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Language Switcher */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 mb-2">Sprache:</p>
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
