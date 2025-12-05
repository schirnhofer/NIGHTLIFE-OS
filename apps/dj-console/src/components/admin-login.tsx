'use client'

import { useState } from 'react'
import { useAuth } from '@nightlife-os/core'
import { useTranslation } from '@nightlife/ui'
import { Button, Input, Card } from '@nightlife/ui'

export const AdminLogin = () => {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signIn('admin@club.internal', pass)
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.code === 'auth/user-not-found') {
        alert('Bitte erst in der Besucher-App als Admin registrieren!')
      } else {
        setError(t('errors.wrongPassword'))
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text text-center">
        {t('admin.title')}
      </h1>

      <Card className="w-full max-w-md" glass>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="password"
            placeholder={t('login.adminPassword')}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            className="text-center text-lg"
          />

          {error && (
            <div className="text-red-400 text-sm font-bold text-center">{error}</div>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth>
            {t('login.unlock')}
          </Button>
        </form>
      </Card>
    </div>
  )
}
