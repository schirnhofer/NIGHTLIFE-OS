'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@nightlife-os/ui';
import { cn } from '@nightlife-os/ui/src/utils/cn';
import { 
  useAuth, 
  useI18n, 
  generateShortCodeSuggestions, 
  reserveShortCodeForUser 
} from '@nightlife-os/core';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Loader2, Code, RefreshCw } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, isAuthenticated, user } = useAuth();
  const { t } = useI18n();
  
  // Schritt-Verwaltung
  const [step, setStep] = useState<1 | 2>(1);
  
  // Schritt 1: Basisdaten
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Schritt 2: Shortcode-Auswahl
  const [shortCodeOptions, setShortCodeOptions] = useState<string[]>([]);
  const [selectedShortCode, setSelectedShortCode] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect wenn bereits angemeldet
  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  /**
   * Schritt 1: Basisdaten validieren und Shortcode-Vorschläge laden
   */
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validierung
      if (!email || !password) {
        throw new Error('E-Mail und Passwort sind erforderlich.');
      }
      if (password.length < 6) {
        throw new Error('Passwort muss mindestens 6 Zeichen lang sein.');
      }

      // Shortcode-Vorschläge generieren
      await loadShortCodeSuggestions();
      
      // Weiter zu Schritt 2
      setStep(2);
    } catch (err: any) {
      console.error('Step 1 error:', err);
      setError(err?.message || 'Fehler bei der Validierung.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lade Shortcode-Vorschläge
   */
  const loadShortCodeSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const suggestions = await generateShortCodeSuggestions();
      setShortCodeOptions(suggestions.options);
      setSelectedShortCode(null);
    } catch (err: any) {
      console.error('Error loading shortcode suggestions:', err);
      setError('Fehler beim Laden der Shortcode-Vorschläge. Bitte versuche es erneut.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Schritt 2: User erstellen und Shortcode reservieren
   */
  const handleStep2Submit = async () => {
    if (!selectedShortCode) {
      setError('Bitte wähle einen Shortcode aus.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Firebase Auth User erstellen
      await signUp(email, password, displayName || undefined);
      
      // Warte kurz, bis user verfügbar ist
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 2. Shortcode reservieren (mit user.uid aus dem aktuellen Auth-User)
      if (user?.uid) {
        try {
          await reserveShortCodeForUser(user.uid, selectedShortCode);
          
          // Erfolg! Weiterleitung zum Profil
          router.push('/auth/profile');
        } catch (reserveErr: any) {
          // Shortcode-Kollision: Neue Vorschläge laden
          if (reserveErr.message?.includes('SHORTCODE_TAKEN')) {
            setError('Dieser Shortcode wurde gerade vergeben. Bitte wähle einen neuen.');
            await loadShortCodeSuggestions();
          } else {
            throw reserveErr;
          }
        }
      } else {
        throw new Error('User-ID nicht verfügbar. Bitte versuche es erneut.');
      }
    } catch (err: any) {
      console.error('Step 2 error:', err);
      setError(err?.message || 'Fehler bei der Registrierung.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            Nightlife OS
          </h1>
          <p className="text-slate-300">
            {t('auth.signup')} - Schritt {step} von 2
          </p>
        </div>

        {/* Signup Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {step === 1 ? (
                <UserPlus className="h-6 w-6 text-cyan-400" />
              ) : (
                <Code className="h-6 w-6 text-cyan-400" />
              )}
              <CardTitle>
                {step === 1 ? t('auth.signup') : 'Wähle deinen Shortcode'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              // Schritt 1: Basisdaten
              <form onSubmit={handleStep1Submit} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('auth.displayName')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Max Mustermann"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="beispiel@email.de"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Mindestens 6 Zeichen
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                variant="default"
                fullWidth
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('common.loading')}
                  </>
                ) : (
                  'Weiter zu Shortcode-Auswahl'
                )}
              </Button>
            </form>
            ) : (
              // Schritt 2: Shortcode-Auswahl
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-300 mb-4">
                    Wähle einen Shortcode aus den 5 Vorschlägen. 
                    Dieser Code wird deine eindeutige ID für Check-Ins.
                  </p>
                  
                  {/* Shortcode-Optionen */}
                  <div className="space-y-2">
                    {shortCodeOptions.map((code) => (
                      <button
                        key={code}
                        onClick={() => setSelectedShortCode(code)}
                        className={cn(
                          'w-full p-4 rounded-lg border-2 text-left transition-all',
                          selectedShortCode === code
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-cyan-400">
                            {code}
                          </span>
                          {selectedShortCode === code && (
                            <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                              <span className="text-white text-sm">✓</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Neue Vorschläge Button */}
                  <Button
                    onClick={loadShortCodeSuggestions}
                    variant="ghost"
                    fullWidth
                    disabled={loading}
                    className="mt-3"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Neue Vorschläge laden
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(1)}
                    variant="ghost"
                    className="flex-1"
                  >
                    Zurück
                  </Button>
                  <Button
                    onClick={handleStep2Submit}
                    variant="default"
                    className="flex-1"
                    disabled={!selectedShortCode || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Erstelle Account...
                      </>
                    ) : (
                      'Registrierung abschließen'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Links (nur in Schritt 1) */}
            {step === 1 && (
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-slate-400">
                  {t('auth.hasAccount')}{' '}
                  <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300">
                    {t('auth.login')}
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
