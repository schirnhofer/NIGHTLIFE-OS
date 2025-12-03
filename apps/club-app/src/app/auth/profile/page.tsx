'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Loader, Input } from '@nightlife-os/ui';
import { useAuth, usePlatformUserData, useI18n, updateUserProfile, findUserByFriendCode } from '@nightlife-os/core';
import { User as UserIcon, Mail, Code, LogOut, Loader2, Edit, Save, X, Search } from 'lucide-react';
import { PlatformUser } from '@nightlife-os/shared-types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, signOut } = useAuth();
  const { user: platformUser, loading: userLoading, generateNewFriendCode } = usePlatformUserData(user?.uid);
  const { t } = useI18n();
  
  const [generatingCode, setGeneratingCode] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');
  
  // Friend-Code-Suche
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<PlatformUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

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

  const handleEditName = () => {
    setIsEditingName(true);
    setNewDisplayName(platformUser?.displayName || '');
    setNameError('');
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setNewDisplayName('');
    setNameError('');
  };

  const handleSaveName = async () => {
    if (!user?.uid) return;
    
    if (!newDisplayName.trim()) {
      setNameError('Name darf nicht leer sein');
      return;
    }

    setSavingName(true);
    setNameError('');
    
    try {
      await updateUserProfile(user.uid, {
        displayName: newDisplayName.trim(),
      });
      setIsEditingName(false);
    } catch (err: any) {
      setNameError(err.message || 'Fehler beim Speichern des Namens');
    } finally {
      setSavingName(false);
    }
  };

  const handleSearchFriendCode = async () => {
    if (!searchCode.trim()) {
      setSearchError('Bitte gib einen Friend-Code ein');
      return;
    }

    setSearching(true);
    setSearchError('');
    setSearchResult(null);
    
    try {
      const result = await findUserByFriendCode(searchCode.trim());
      if (result) {
        setSearchResult(result);
      } else {
        setSearchError('Kein Benutzer mit diesem Friend-Code gefunden');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Fehler bei der Suche');
    } finally {
      setSearching(false);
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
                {isEditingName ? (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      error={nameError}
                      placeholder="Dein Name"
                      disabled={savingName}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        disabled={savingName}
                      >
                        {savingName ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Speichern
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={savingName}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-lg text-slate-200">
                      {platformUser?.displayName || user?.displayName || 'Kein Name'}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEditName}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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

        {/* Friend-Code Suche */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Search className="h-6 w-6 text-cyan-400" />
              <CardTitle>Benutzer suchen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              Suche nach einem Benutzer über dessen Friend-Code
            </p>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Friend-Code eingeben"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  disabled={searching}
                  error={searchError}
                  maxLength={7}
                />
              </div>
              <Button
                onClick={handleSearchFriendCode}
                disabled={searching || !searchCode.trim()}
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Suchergebnis */}
            {searchResult && (
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                  <UserIcon className="h-8 w-8 text-cyan-400" />
                  <div className="flex-1">
                    <p className="text-lg font-medium text-slate-200">
                      {searchResult.displayName || 'Unbekannt'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {searchResult.email}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {searchResult.friendCode}
                    </p>
                  </div>
                </div>
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
