'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, Input, Modal, VoiceRecorderButton, EphemeralImageBubble, VideoRecorderButton, PollBubble } from '@nightlife-os/ui';
import { useAuth, useI18n, useChatMessages, useChatMessagesActions, useUnreadMessages, useChats, usePlatformUserData } from '@nightlife-os/core';
import { ArrowLeft, Send, Settings, Camera, Trash2, Image as ImageIcon, Timer, BarChart3, Plus, X } from 'lucide-react';
import { Message, Chat } from '@nightlife-os/shared-types';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params?.chatId as string;
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  
  // Messages & Chat Data (Phase 7)
  const { messages, loading } = useChatMessages('demo-club-1', chatId);
  const { chats } = useChats('demo-club-1', user?.uid || null);
  const { userData } = usePlatformUserData(user?.uid || null);
  const { sendMessage, sendPoll, votePoll, deleteMessage, expireMedia, sending } = useChatMessagesActions();
  const { markChatAsSeen } = useUnreadMessages(user?.uid);
  
  // Phase 7: Finde aktuellen Chat und prüfe Broadcast-Mode
  const currentChat = chats?.find((c: Chat) => c.id === chatId);
  const isBroadcastChat = currentChat?.mode === 'broadcast';
  const isAdmin = userData?.roles?.includes('club_admin') || userData?.isPlatformAdmin;
  const canSend = !isBroadcastChat || (isBroadcastChat && isAdmin);
  
  const [messageText, setMessageText] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [ephemeralSeconds, setEphemeralSeconds] = useState<number | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll state
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollAllowMultiple, setPollAllowMultiple] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  // Mark chat as seen on open
  useEffect(() => {
    if (user?.uid && chatId) {
      markChatAsSeen(chatId);
    }
  }, [chatId, user?.uid, markChatAsSeen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer für ephemeral messages (client-side)
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    messages.forEach((msg: Message) => {
      if (msg?.ephemeral && msg?.expiresAt && msg?.mediaUrl) {
        const now = Date.now();
        const remainingTime = msg.expiresAt - now;

        if (remainingTime > 0) {
          const timer = setTimeout(() => {
            expireMedia('demo-club-1', chatId, msg.messageId)
              .catch((err) => console.error('Error expiring media:', err));
          }, remainingTime);
          timers.push(timer);
        }
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [messages, chatId, expireMedia]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user?.uid) return;

    try {
      await sendMessage(
        'demo-club-1',
        chatId,
        user.uid,
        user.displayName || user.email || 'User',
        { text: messageText }
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSendImage = async () => {
    if (!selectedImage || !user?.uid) return;

    try {
      await sendMessage(
        'demo-club-1',
        chatId,
        user.uid,
        user.displayName || user.email || 'User',
        {
          text: messageText || undefined,
          imageFile: selectedImage,
          ephemeralSeconds
        }
      );
      setMessageText('');
      setSelectedImage(null);
      setEphemeralSeconds(undefined);
      setShowImageUpload(false);
    } catch (err) {
      console.error('Error sending image:', err);
    }
  };

  const handleVoiceRecorded = async (file: File, durationSeconds: number) => {
    if (!user?.uid) return;

    try {
      await sendMessage(
        'demo-club-1',
        chatId,
        user.uid,
        user.displayName || user.email || 'User',
        {
          audioFile: file
        }
      );
    } catch (err) {
      console.error('Error sending voice:', err);
    }
  };

  const handleVideoRecorded = async (file: File, durationSeconds: number) => {
    if (!user?.uid) return;

    try {
      await sendMessage(
        'demo-club-1',
        chatId,
        user.uid,
        user.displayName || user.email || 'User',
        {
          videoFile: file
        }
      );
    } catch (err) {
      console.error('Error sending video:', err);
    }
  };

  const handleCreatePoll = async () => {
    if (!user?.uid) return;
    if (!pollQuestion.trim()) {
      alert(t('poll.question') + ' erforderlich');
      return;
    }

    const validOptions = pollOptions
      .map((opt) => opt?.trim())
      .filter((opt) => opt);

    if (validOptions.length < 2) {
      alert(t('poll.noOptions'));
      return;
    }

    try {
      await sendPoll(
        'demo-club-1',
        chatId,
        user.uid,
        user.displayName || user.email || 'User',
        pollQuestion,
        validOptions,
        pollAllowMultiple
      );

      // Reset
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollAllowMultiple(false);
      setShowPollModal(false);
    } catch (err) {
      console.error('Error creating poll:', err);
      alert('Fehler beim Erstellen der Umfrage');
    }
  };

  const handleVotePoll = async (messageId: string, optionIndex: number) => {
    if (!user?.uid) return;

    try {
      await votePoll('demo-club-1', chatId, messageId, user.uid, optionIndex);
    } catch (err) {
      console.error('Error voting on poll:', err);
    }
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
              const isOwnMessage = msg?.sender === user?.uid;
              const isDeleted = msg?.deleted;

              return (
                <div
                  key={msg?.messageId}
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
                        {msg?.senderName}
                      </p>
                    )}
                    
                    {isDeleted ? (
                      <p className="text-sm italic text-slate-400">
                        [{t('chat.imageDeleted')}]
                      </p>
                    ) : (
                      <>
                        {/* Text */}
                        {msg?.text && <p className="text-sm">{msg.text}</p>}
                        
                        {/* Image */}
                        {msg?.type === 'image' && msg?.mediaUrl && (
                          <div className="mt-2">
                            {msg?.ephemeral && msg?.expiresAt ? (
                              <EphemeralImageBubble
                                imageUrl={msg.mediaUrl}
                                ephemeralSeconds={msg.ephemeral}
                                onExpire={() => {
                                  expireMedia('demo-club-1', chatId, msg.messageId)
                                    .catch((err) => console.error('Error expiring:', err));
                                }}
                              />
                            ) : (
                              <img
                                src={msg.mediaUrl}
                                alt="Chat image"
                                className="rounded max-w-full"
                              />
                            )}
                          </div>
                        )}
                        
                        {/* Audio */}
                        {msg?.type === 'audio' && msg?.mediaUrl && (
                          <div className="mt-2">
                            <audio controls src={msg.mediaUrl} className="w-full" />
                            {msg?.ephemeral && (
                              <p className="text-xs text-slate-300 mt-1">
                                <Timer className="inline h-3 w-3 mr-1" />
                                {msg.ephemeral}s
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Video */}
                        {msg?.type === 'video' && msg?.mediaUrl && (
                          <div className="mt-2">
                            <video
                              controls
                              src={msg.mediaUrl}
                              className="w-full rounded max-w-xs"
                            />
                            {msg?.durationSeconds && (
                              <p className="text-xs text-slate-300 mt-1">
                                Dauer: {msg.durationSeconds}s
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Poll */}
                        {msg?.type === 'poll' && msg?.poll && (
                          <div className="mt-2">
                            <PollBubble
                              poll={msg.poll}
                              currentUserId={user?.uid}
                              onVote={(optionIndex) =>
                                handleVotePoll(msg.messageId, optionIndex)
                              }
                            />
                          </div>
                        )}
                        
                        {/* Backwards compatibility: image field */}
                        {msg?.image && !msg?.mediaUrl && (
                          <div className="mt-2">
                            <img
                              src={msg.image}
                              alt="Chat image"
                              className="rounded max-w-full"
                            />
                            {msg?.ephemeral && (
                              <p className="text-xs text-slate-300 mt-1">
                                <Timer className="inline h-3 w-3 mr-1" />
                                {msg.ephemeral}s
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs opacity-70">
                        {new Date(msg?.createdAt).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      
                      {isOwnMessage && !isDeleted && (
                        <button
                          onClick={() => handleDeleteMessage(msg?.messageId)}
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

      {/* Input - Phase 7: Bedingt für Broadcast-Chats */}
      <div className="bg-slate-800 border-t border-slate-700 p-4">
        {canSend ? (
          <div className="max-w-4xl mx-auto flex gap-2">
            {/* Image Upload Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImageUpload(true)}
            >
              <Camera className="h-5 w-5" />
            </Button>
            
            {/* Voice Recorder */}
            <VoiceRecorderButton
              maxDurationSeconds={30}
              onRecorded={handleVoiceRecorded}
              onError={(err) => {
                console.error('Voice recording error:', err);
                alert('Mikrofon-Zugriff fehlgeschlagen');
              }}
            />
            
            {/* Video Recorder */}
            <VideoRecorderButton
              maxDurationSeconds={30}
              onRecorded={handleVideoRecorded}
              onError={(err) => {
                console.error('Video recording error:', err);
                alert(t('video.cameraError'));
              }}
            />
            
            {/* Poll Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPollModal(true)}
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            
            {/* Text Input */}
            <Input
              placeholder={t('chat.typeMessage')}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            
            {/* Send Button */}
            <Button
              variant="default"
              onClick={handleSendMessage}
              disabled={sending || !messageText.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center py-2">
            <p className="text-slate-400 text-sm">
              🔒 {t('broadcast.readOnly')}
            </p>
          </div>
        )}
      </div>

      {/* Modal: Image Upload */}
      <Modal
        open={showImageUpload}
        onClose={() => {
          setShowImageUpload(false);
          setSelectedImage(null);
          setEphemeralSeconds(undefined);
        }}
        title={t('chat.sendImage')}
      >
        <div className="space-y-4">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          {!selectedImage ? (
            <Button
              variant="default"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5 mr-2" />
              Bild auswählen
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Preview"
                  className="w-full rounded-lg"
                />
              </div>
              <Button
                variant="ghost"
                fullWidth
                size="sm"
                onClick={() => {
                  setSelectedImage(null);
                  fileInputRef.current?.click();
                }}
              >
                Anderes Bild wählen
              </Button>
            </div>
          )}

          {/* Optional: Text */}
          <Input
            placeholder="Nachricht (optional)..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />

          {/* Ephemeral Options */}
          <div>
            <p className="text-sm text-slate-400 mb-2">
              {t('chat.ephemeralOptions')}
            </p>
            <div className="flex gap-2">
              <Button
                variant={ephemeralSeconds === undefined ? 'default' : 'ghost'}
                size="sm"
                fullWidth
                onClick={() => setEphemeralSeconds(undefined)}
              >
                Aus
              </Button>
              <Button
                variant={ephemeralSeconds === 5 ? 'default' : 'ghost'}
                size="sm"
                fullWidth
                onClick={() => setEphemeralSeconds(5)}
              >
                5s
              </Button>
              <Button
                variant={ephemeralSeconds === 10 ? 'default' : 'ghost'}
                size="sm"
                fullWidth
                onClick={() => setEphemeralSeconds(10)}
              >
                10s
              </Button>
              <Button
                variant={ephemeralSeconds === 30 ? 'default' : 'ghost'}
                size="sm"
                fullWidth
                onClick={() => setEphemeralSeconds(30)}
              >
                30s
              </Button>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setShowImageUpload(false);
                setSelectedImage(null);
                setEphemeralSeconds(undefined);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="success"
              fullWidth
              onClick={handleSendImage}
              disabled={!selectedImage || sending}
            >
              {t('common.send')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Poll erstellen */}
      <Modal
        open={showPollModal}
        onClose={() => {
          setShowPollModal(false);
          setPollQuestion('');
          setPollOptions(['', '']);
          setPollAllowMultiple(false);
        }}
        title={t('poll.createPoll')}
      >
        <div className="space-y-4">
          {/* Frage */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              {t('poll.question')}
            </label>
            <Input
              placeholder="Z.B. Welches Lied soll als nächstes kommen?"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
            />
          </div>

          {/* Optionen */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Optionen
            </label>
            <div className="space-y-2">
              {pollOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[index] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    className="flex-1"
                  />
                  {pollOptions.length > 2 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        const newOptions = pollOptions.filter(
                          (_, i) => i !== index
                        );
                        setPollOptions(newOptions);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setPollOptions([...pollOptions, ''])}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('poll.addOption')}
            </Button>
          </div>

          {/* Mehrfachauswahl */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowMultiple"
              checked={pollAllowMultiple}
              onChange={(e) => setPollAllowMultiple(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="allowMultiple" className="text-sm text-slate-300">
              {t('poll.allowMultiple')}
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setShowPollModal(false);
                setPollQuestion('');
                setPollOptions(['', '']);
                setPollAllowMultiple(false);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="success"
              fullWidth
              onClick={handleCreatePoll}
              disabled={!pollQuestion.trim() || sending}
            >
              {t('poll.send')}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
