'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Input, Modal } from '@nightlife-os/ui';
import { useAuth, useI18n, useFriends } from '@nightlife-os/core';
import { ArrowLeft, Camera, ArrowRight, X } from 'lucide-react';
import { FRIEND_REQUEST_MESSAGES } from '@nightlife-os/shared-types';

export default function AddFriendPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const { sendFriendRequest } = useFriends(user?.uid);
  
  const [friendCode, setFriendCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [targetUser, setTargetUser] = useState<{ code: string } | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const handleScanQR = () => {
    // TODO: Implementiere QR-Scanner mit html5-qrcode
    alert('QR-Scanner: Platzhalter - Integration mit html5-qrcode in Entwicklung');
  };

  const handleSearchByCode = async () => {
    if (!friendCode || friendCode.length !== 7) {
      alert(t('errors.invalidCode'));
      return;
    }

    setLoading(true);
    try {
      // TODO: Suche User via Friend-Code in Firestore
      // Platzhalter: Simuliere gefundenen User
      const foundUser = { code: friendCode.toUpperCase() };
      
      if (!foundUser) {
        alert(t('errors.userNotFound'));
        return;
      }

      // Zeige Modal
      setTargetUser(foundUser);
      setShowModal(true);
    } catch (err) {
      console.error('Error searching user:', err);
      alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!targetUser) return;

    const message = customMessage || selectedMessage || undefined;

    setLoading(true);
    try {
      await sendFriendRequest(targetUser.code, message);
      alert(t('friend.requestSent'));
      setShowModal(false);
      router.push('/crew');
    } catch (err) {
      console.error('Error sending request:', err);
      alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/crew')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-cyan-400">
            {t('crew.addFriend')}
          </h1>
        </div>

        {/* QR-Scanner */}
        <Card className="mb-4">
          <CardContent className="py-6">
            <p className="text-sm text-slate-400 mb-4 text-center">
              {t('qr.scanCode')}
            </p>
            <Button
              variant="default"
              fullWidth
              size="lg"
              onClick={handleScanQR}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              <Camera className="h-5 w-5 mr-2" />
              {t('friend.scanQR')}
            </Button>
          </CardContent>
        </Card>

        {/* Code-Eingabe */}
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-slate-400 mb-4 text-center">
              {t('friend.enterCode')}
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="ABCDEFG"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                maxLength={7}
                className="flex-1 text-center text-2xl tracking-widest font-mono"
              />
              <Button
                variant="default"
                onClick={handleSearchByCode}
                disabled={loading || friendCode.length !== 7}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal: Anfrage senden */}
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={t('friend.requestTo')}
        >
          <div className="space-y-4">
            {/* Ziel-User */}
            {targetUser && (
              <div className="p-4 bg-slate-800 rounded-lg text-center">
                <p className="text-xs text-slate-400 mb-1">Friend-Code</p>
                <p className="text-2xl font-bold text-cyan-400 tracking-widest">
                  {targetUser.code}
                </p>
              </div>
            )}

            {/* Nachricht wählen */}
            <div>
              <p className="text-sm text-slate-400 mb-2">
                {t('friend.chooseMessage')}
              </p>
              <div className="space-y-2">
                {FRIEND_REQUEST_MESSAGES.map((msg) => (
                  <Button
                    key={msg}
                    variant={selectedMessage === msg ? 'default' : 'ghost'}
                    fullWidth
                    size="sm"
                    onClick={() => {
                      setSelectedMessage(msg);
                      setCustomMessage('');
                    }}
                  >
                    {msg}
                  </Button>
                ))}
              </div>
            </div>

            {/* Eigene Nachricht */}
            <div>
              <p className="text-sm text-slate-400 mb-2">
                {t('friend.customMessage')}
              </p>
              <Input
                placeholder="Eigene Nachricht..."
                value={customMessage}
                onChange={(e) => {
                  setCustomMessage(e.target.value);
                  setSelectedMessage(null);
                }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setShowModal(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="success"
                fullWidth
                onClick={handleSendRequest}
                disabled={loading}
              >
                {t('common.send')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
}
