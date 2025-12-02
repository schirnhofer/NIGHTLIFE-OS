'use client';

/**
 * Broadcast Chat Page
 * Phase 7: Club-Admin Broadcast Channel
 * 
 * Nur Club-Admins können hier senden
 * Besucher können nur Nachrichten lesen & reagieren
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useChats, useChatMessagesActions, usePlatformUserData } from '@nightlife-os/core';
import { Chat } from '@nightlife-os/shared-types';
import { Button, Card, Input, Loader, PollBubble } from '@nightlife-os/ui';
import { Send, BarChart, ArrowLeft } from 'lucide-react';

const DEMO_CLUB_ID = 'demo-club-123'; // TODO: Replace with actual club selection

export default function BroadcastPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { userData } = usePlatformUserData(user?.uid || null);
  const { chats, loading: chatsLoading } = useChats(DEMO_CLUB_ID, user?.uid || null);
  const { sendMessage, sending } = useChatMessagesActions();

  const [messageText, setMessageText] = useState('');
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Redirect wenn nicht eingeloggt
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Finde Broadcast-Chat für diesen Club
  const broadcastChat = chats?.find(
    (chat: Chat) => chat.mode === 'broadcast' && chat.broadcastScope === 'club'
  );

  // Prüfe ob User Admin ist
  const isAdmin = userData?.roles?.includes('club_admin') || userData?.isPlatformAdmin;

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !broadcastChat) return;

    try {
      await sendMessage(
        DEMO_CLUB_ID,
        broadcastChat.id,
        user.uid,
        user.displayName || 'Unbekannt',
        { text: messageText }
      );
      setMessageText('');
    } catch (error: any) {
      console.error('Error sending broadcast message:', error);
      alert(error?.message || 'Fehler beim Senden');
    }
  };

  // Loading
  if (!user || chatsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Kein Broadcast-Chat gefunden
  if (!broadcastChat) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
        <Card className="max-w-md mx-auto mt-20">
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Kein Broadcast-Chat</h2>
            <p className="text-slate-400 mb-6">
              Für diesen Club existiert noch kein Broadcast-Channel.
            </p>
            <Button onClick={() => router.push('/crew')} variant="default">
              Zurück zu Chats
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/crew')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {broadcastChat.name || 'Club News'}
            </h1>
            <p className="text-sm text-slate-400">
              {isAdmin ? 'Admin Broadcast' : 'Nur Lesen'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="max-w-4xl mx-auto p-4">
        {/* TODO: Render Messages from broadcastChat */}
        <Card className="p-6">
          <p className="text-slate-400 text-center">
            Nachrichten werden hier angezeigt...
          </p>
        </Card>
      </div>

      {/* Input Area (nur für Admins) */}
      {isAdmin ? (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700/50 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Broadcast-Nachricht..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={() => setShowPollModal(true)}
              variant="ghost"
              size="sm"
            >
              <BarChart className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sending}
              variant="default"
              size="sm"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700/50 p-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-slate-400 text-sm">
              🔒 Nur Admins können hier schreiben
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
