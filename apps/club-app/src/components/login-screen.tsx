'use client'

import { useState } from 'react'
import { useAuth } from '@nightlife/core'
import { useTranslation } from '@nightlife/ui'
import { Button, Input, Card } from '@nightlife/ui'

export const LoginScreen = () => {
  const { t } = useTranslation()
  const { signIn, signUp, resetPassword } = useAuth()
  
  const [inputEmail, setInputEmail] = useState('')
  const [pass, setPass] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)

    try {
      let finalEmail = inputEmail.trim()
      
      // Admin-Shortcut
      if (finalEmail.toLowerCase() === 'admin') {
        finalEmail = 'admin@club.internal'
        if (pass !== 'DFjk1289#3') {
          setError(t('errors.wrongPassword'))
          setBusy(false)
          return
        }
      }

      if (showReset) {
        await resetPassword(finalEmail)
        setSuccess(t('login.resetPasswordSuccess'))
        setTimeout(() => setShowReset(false), 5000)
      } else if (isRegister) {
        await signUp(finalEmail, pass)
      } else {
        await signIn(finalEmail, pass)
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      if (err.code === 'auth/user-not-found') {
        setError('Bitte erst registrieren!')
      } else if (err.code === 'auth/wrong-password') {
        setError(t('errors.wrongPassword'))
      } else {
        setError(err.message || t('errors.authFailed'))
      }
    }

    setBusy(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Title */}
      <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-transparent bg-clip-text text-center">
        {t('login.title')}
      </h1>

      {/* Form Card */}
      <Card className="w-full max-w-md" glass>
        <form onSubmit={handleAuth} className="space-y-4">
          {showReset && (
            <h2 className="text-xl font-bold text-center mb-4">
              {t('login.resetPasswordTitle')}
            </h2>
          )}

          <Input
            type="email"
            placeholder={t('login.email')}
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            required
            disabled={busy}
          />

          {!showReset && (
            <Input
              type="password"
              placeholder={t('login.password')}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              disabled={busy}
            />
          )}

          {error && (
            <div className="text-red-400 text-sm font-bold text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-400 text-sm font-bold text-center">
              {success}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={busy}
          >
            {showReset
              ? t('login.resetPasswordButton')
              : isRegister
              ? t('login.registerButton')
              : t('login.loginButton')}
          </Button>

          {!showReset && (
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {t('login.forgotPassword')}
              </button>
              <br />
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {isRegister
                  ? t('login.switchToLogin')
                  : t('login.switchToRegister')}
              </button>
            </div>
          )}

          {showReset && (
            <button
              type="button"
              onClick={() => setShowReset(false)}
              className="w-full text-sm text-slate-400 hover:text-white transition-colors"
            >
              {t('common.back')}
            </button>
          )}
        </form>
      </Card>
    </div>
  )
}
