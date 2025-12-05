'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Loader } from '@nightlife-os/ui';
import { 
  createCheckIn, 
  findUserByFriendCode, 
  getCurrentCheckIn,
  checkOutUser,
  useAuth 
} from '@nightlife-os/core';
import { UserCheck, UserX, Search, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PlatformUser, CheckInRecord } from '@nightlife-os/shared-types';

export default function CheckInPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Formular-State
  const [searchInput, setSearchInput] = useState(''); // userId oder friendCode
  const [clubId, setClubId] = useState('club-demo-001'); // Beispiel-Club-ID
  const [searching, setSearching] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Benutzer-Info
  const [foundUser, setFoundUser] = useState<PlatformUser | null>(null);
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckInRecord | null>(null);

  // Redirect wenn nicht angemeldet
  if (!authLoading && !isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setError('Bitte gib eine User-ID oder einen Friend-Code ein');
      return;
    }

    setSearching(true);
    setError('');
    setSuccess('');
    setFoundUser(null);
    setCurrentCheckIn(null);
    
    try {
      let userToCheckIn: PlatformUser | null = null;

      // Versuche zuerst Friend-Code-Suche
      if (searchInput.length === 7) {
        userToCheckIn = await findUserByFriendCode(searchInput.trim());
      }

      // Wenn kein User gefunden, versuche direkt als User-ID
      // (In echter Anwendung würde man getUserProfile verwenden)
      if (!userToCheckIn) {
        setError('Kein Benutzer gefunden. Bitte Friend-Code verwenden.');
        return;
      }

      setFoundUser(userToCheckIn);

      // Prüfe aktuellen Check-In-Status
      const activeCheckIn = await getCurrentCheckIn(userToCheckIn.uid, clubId);
      setCurrentCheckIn(activeCheckIn);

    } catch (err: any) {
      setError(err.message || 'Fehler bei der Suche');
    } finally {
      setSearching(false);
    }
  };

  const handleCheckIn = async () => {
    if (!foundUser) return;

    setProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      const newCheckIn = await createCheckIn(foundUser.uid, clubId, 'manual');
      setCurrentCheckIn(newCheckIn);
      setSuccess(`${foundUser.displayName || 'Benutzer'} erfolgreich eingecheckt!`);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Check-In');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!foundUser) return;

    setProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      await checkOutUser(foundUser.uid, clubId);
      setCurrentCheckIn(null);
      setSuccess(`${foundUser.displayName || 'Benutzer'} erfolgreich ausgecheckt!`);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Check-Out');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setSearchInput('');
    setFoundUser(null);
    setCurrentCheckIn(null);
    setError('');
    setSuccess('');
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader size="lg" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            Check-In / Check-Out
          </h1>
          <p className="text-slate-300">
            Verwalte Gast-Check-Ins für deinen Club
          </p>
        </div>

        {/* Club-ID Auswahl (Platzhalter) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Club auswählen</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              label="Club-ID"
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              placeholder="club-demo-001"
            />
            <p className="text-sm text-slate-400 mt-2">
              In einer echten Anwendung würde hier eine Dropdown-Liste der verfügbaren Clubs angezeigt.
            </p>
          </CardContent>
        </Card>

        {/* Benutzer-Suche */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Search className="h-6 w-6 text-cyan-400" />
              <CardTitle>Benutzer suchen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Friend-Code (7 Zeichen)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                  disabled={searching || !!foundUser}
                  maxLength={7}
                />
              </div>
              {!foundUser && (
                <Button
                  onClick={handleSearch}
                  disabled={searching || !searchInput.trim()}
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              )}
              {foundUser && (
                <Button
                  variant="ghost"
                  onClick={handleReset}
                >
                  Neu suchen
                </Button>
              )}
            </div>

            {/* Status-Nachrichten */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="text-sm text-green-400">{success}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benutzer-Informationen */}
        {foundUser && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Benutzer gefunden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-medium text-slate-200">
                      {foundUser.displayName || 'Unbekannt'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {foundUser.email}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Friend-Code: {foundUser.friendCode}
                    </p>
                  </div>
                </div>

                {/* Check-In-Status */}
                <div className="pt-4 border-t border-slate-700">
                  {currentCheckIn ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <Clock className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Eingecheckt</p>
                        <p className="text-xs text-slate-400">
                          seit {new Date(currentCheckIn.checkedInAt).toLocaleTimeString('de-DE')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400">
                      <UserX className="h-5 w-5" />
                      <p className="font-medium">Nicht eingecheckt</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Check-In/Out Aktionen */}
              <div className="flex gap-3">
                {!currentCheckIn ? (
                  <Button
                    fullWidth
                    variant="default"
                    onClick={handleCheckIn}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Check-In wird durchgeführt...
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Check-In
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={handleCheckOut}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Check-Out wird durchgeführt...
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Check-Out
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platzhalter für Cloakroom */}
        {foundUser && currentCheckIn && (
          <Card>
            <CardHeader>
              <CardTitle>Garderobe (Platzhalter)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">
                Hier würde die Garderobe-Funktionalität integriert werden (Ticket erstellen, abrufen, etc.).
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-6">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push('/')}
          >
            Zurück zur Startseite
          </Button>
        </div>
      </div>
    </main>
  );
}
