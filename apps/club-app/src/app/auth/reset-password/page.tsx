'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@nightlife-os/ui';
import { resetPassword } from '@nightlife-os/core';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Zurücksetzen des Passworts');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <CardTitle>E-Mail gesendet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-center">
                Wir haben dir eine E-Mail zum Zurücksetzen deines Passworts gesendet.
                Bitte überprüfe deinen Posteingang.
              </p>
              <Button
                fullWidth
                onClick={() => router.push('/auth/login')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zum Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            Passwort zurücksetzen
          </h1>
          <p className="text-slate-300">
            Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen
          </p>
        </div>

        {/* Reset Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Passwort-Reset</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <Input
                type="email"
                label="E-Mail-Adresse"
                placeholder="deine@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                required
                disabled={loading}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Mail className="h-4 w-4 mr-2 animate-pulse" />
                    Sende E-Mail...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Passwort zurücksetzen
                  </>
                )}
              </Button>

              {/* Back to Login */}
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => router.push('/auth/login')}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zum Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
