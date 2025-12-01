'use client'

import { useState, useRef } from 'react'
import { User } from 'firebase/auth'
import { UserProfile } from '@nightlife/core'
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore'
import { getDbInstance } from '@nightlife/core'
import { useTranslation } from '@nightlife/ui'
import { Button, Input, Card, Icon, Modal } from '@nightlife/ui'

interface ChatAddFriendViewProps {
  user: User
  userData: UserProfile
  onBack: () => void
}

export const ChatAddFriendView = ({ user, userData, onBack }: ChatAddFriendViewProps) => {
  const { t } = useTranslation()
  const [addCode, setAddCode] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [targetUser, setTargetUser] = useState<any>(null)
  const [msg, setMsg] = useState('Hi! 👋')
  const scannerRef = useRef<any>(null)

  const startScanner = async () => {
    // QR-Scanner mit html5-qrcode
    if (typeof window !== 'undefined') {
      const { Html5Qrcode } = await import('html5-qrcode')
      setIsScanning(true)

      setTimeout(() => {
        if (document.getElementById('reader')) {
          const html5QrCode = new Html5Qrcode('reader')
          scannerRef.current = html5QrCode

          html5QrCode
            .start(
              { facingMode: 'environment' },
              { fps: 10, qrbox: { width: 250, height: 250 } },
              (decodedText: string) => {
                setAddCode(decodedText)
                stopScanner()
                initiateRequest(decodedText)
              },
              () => {}
            )
            .catch((err: any) => {
              console.error(err)
              setIsScanning(false)
              alert(t('errors.cameraError'))
            })
        }
      }, 100)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch (e) {}
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const initiateRequest = async (code: string) => {
    if (!code || code.length < 7) {
      alert(t('errors.codeTooShort'))
      return
    }

    const db = getDbInstance()
    const q = query(collection(db, 'users'), where('friendCode', '==', code.toUpperCase()))
    const snap = await getDocs(q)

    if (snap.empty) {
      alert(t('errors.codeNotFound'))
      return
    }

    const found = snap.docs[0]

    if (found.id === user.uid) {
      alert(t('errors.selfScan'))
      return
    }

    setTargetUser({ id: found.id, ...found.data() })
    setShowModal(true)
  }

  const sendReq = async () => {
    if (!targetUser) return

    const db = getDbInstance()
    await setDoc(doc(db, 'users', targetUser.id, 'requests', user.uid), {
      email: user.email || '',
      uid: user.uid,
      friendCode: userData.friendCode || '',
      message: msg,
      timestamp: Date.now(),
    })

    alert('Gesendet!')
    setShowModal(false)
    onBack()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 className="text-2xl font-black">{t('chat.addFriend')}</h1>
      </div>

      {/* Scanner */}
      {isScanning ? (
        <div className="space-y-4">
          <div id="reader" className="rounded-xl overflow-hidden" />
          <Button onClick={stopScanner} variant="danger" fullWidth>
            {t('chat.stopScan')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Button onClick={startScanner} variant="primary" size="lg" fullWidth>
            <Icon name="qr-code" size={24} />
            {t('chat.scanQR')}
          </Button>

          <div className="text-center text-sm text-slate-500">oder</div>

          <Input
            placeholder={t('chat.enterCode')}
            value={addCode}
            onChange={(e) => setAddCode(e.target.value.toUpperCase())}
            className="text-center text-2xl font-mono"
            maxLength={7}
          />

          <Button
            onClick={() => initiateRequest(addCode)}
            variant="secondary"
            fullWidth
            disabled={addCode.length < 7}
          >
            {t('common.send')}
          </Button>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('chat.requestTo')}>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-mono text-fuchsia-400">{targetUser?.friendCode}</div>
            <div className="text-sm text-slate-500">{targetUser?.email}</div>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-2">{t('chat.chooseMessage')}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Hi! 👋', 'Lass anstoßen! 🥂', 'Cooles Outfit! 🔥'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMsg(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    msg === m
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <Input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Eigene Nachricht..."
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button onClick={sendReq} variant="primary" className="flex-1">
              {t('common.send')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
