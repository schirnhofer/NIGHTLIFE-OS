'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, Input } from '@nightlife-os/ui';
import { useAuth, useI18n, useChatMessages, useChatMessagesActions } from '@nightlife-os/core';
import { ArrowLeft, Send, Settings, Camera, Trash2 } from 'lucide-react';
import { Message } from '@nightlife-os/shared-types';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params?.chatId as string;
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  
  // Messages
  const { messages, loading } = useChatMessages('demo-club-1', chatId);
  const { sendMessage, deleteMessage, sending } = useChatMessagesActions();
  
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user?.uid) return;

    try {
      await sendMessage(
        'demo-club-1',
        chatId,
        user.uid,
        user.displayName || user.email || 'User',
        messageText
      );
      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm(t('chat.deleteMessage'))) return;

    try {
      await deleteMessage('demo-club-1', chatId, messageId);
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleSendImage = () => {
    // TODO: Implementiere Bild-Upload
    alert('Bild-Upload: Platzhalter - In Entwicklung');
  };

  // Prüfe, ob Chat eine Gruppe ist (chatId enthält kein '_' bei Gruppen)
  const isGroup = !chatId.includes('_');

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/crew')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-slate-200">
              Chat
            </h1>
          </div>
          
          {isGroup && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/crew/group/${chatId}/settings`)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-400">{t('common.loading')}</p>
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg: Message) => {
              const isOwnMessage = msg.sender === user?.uid;
              const isDeleted = msg.deleted;

              return (
                <div
                  key={msg.messageId}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs text-slate-400 mb-1">
                        {msg.senderName}
                      </p>
                    )}
                    
                    {isDeleted ? (
                      <p className="text-sm italic text-slate-400">
                        [{t('chat.imageDeleted')}]
                      </p>
                    ) : (
                      <>
                        {msg.text && <p className="text-sm">{msg.text}</p>}
                        {msg.image && (
                          <div className="mt-2">
                            <img
                              src={msg.image}
                              alt="Chat image"
                              className="rounded max-w-full"
                            />
                            {msg.ephemeral && (
                              <p className="text-xs text-slate-300 mt-1">
                                ⏱️ {msg.ephemeral}s
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      
                      {isOwnMessage && !isDeleted && (
                        <button
                          onClick={() => handleDeleteMessage(msg.messageId)}
                          className="text-xs opacity-70 hover:opacity-100 ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">{t('chat.noMessages')}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-slate-800 border-t border-slate-700 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSendImage}
          >
            <Camera className="h-5 w-5" />
          </Button>
          <Input
            placeholder={t('chat.typeMessage')}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button
            variant="default"
            onClick={handleSendMessage}
            disabled={sending || !messageText.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </main>
  );
}
