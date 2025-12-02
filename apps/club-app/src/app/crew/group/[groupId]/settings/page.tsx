'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Loader } from '@nightlife-os/ui';
import { useAuth, useI18n, useChats } from '@nightlife-os/core';
import { ArrowLeft, UserMinus, LogOut, Trash2 } from 'lucide-react';
import { Chat } from '@nightlife-os/shared-types';
import { getDocument } from '@nightlife-os/core';

export default function GroupSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params?.groupId as string;
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const { removeFromGroup, leaveGroup, deleteGroup } = useChats('demo-club-1', user?.uid);
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  // Lade Chat-Daten
  useEffect(() => {
    const loadChat = async () => {
      try {
        const chatData = await getDocument<Chat>(`clubs/demo-club-1/chats/${groupId}`);
        setChat(chatData);
      } catch (err) {
        console.error('Error loading chat:', err);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      loadChat();
    }
  }, [groupId]);

  const isCreator = chat?.createdBy === user?.uid;

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Mitglied wirklich entfernen?')) return;

    setActionLoading(true);
    try {
      await removeFromGroup('demo-club-1', groupId, memberId);
      // Reload chat
      const chatData = await getDocument<Chat>(`clubs/demo-club-1/chats/${groupId}`);
      setChat(chatData);
    } catch (err) {
      console.error('Error removing member:', err);
      alert(t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm(t('group.leave') + '?')) return;
    if (!user?.uid) return;

    setActionLoading(true);
    try {
      await leaveGroup('demo-club-1', groupId, user.uid);
      router.push('/crew');
    } catch (err) {
      console.error('Error leaving group:', err);
      alert(t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm(t('group.delete') + '?')) return;
    if (!user?.uid) return;

    setActionLoading(true);
    try {
      await deleteGroup('demo-club-1', groupId, user.uid);
      router.push('/crew');
    } catch (err) {
      console.error('Error deleting group:', err);
      alert(t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center gap-3">
                <Loader size="md" />
                <p className="text-slate-300">{t('common.loading')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!chat || chat.type !== 'group') {
    return (
      <main className="min-h-screen bg-slate-900 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-slate-400">{t('errors.notFound')}</p>
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => router.push('/crew')}
              >
                {t('common.back')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/crew/chat/${groupId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-cyan-400">
            {t('group.settings')}
          </h1>
        </div>

        {/* Gruppen-Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{chat.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">
              {chat.participants?.length || 0} {t('group.members')}
            </p>
            {isCreator && (
              <p className="text-xs text-cyan-400 mt-1">
                {t('group.creator')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Mitglieder */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('group.members')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {chat.participants?.map((participantId) => {
                const isCurrentUser = participantId === user?.uid;
                const isChatCreator = participantId === chat.createdBy;

                return (
                  <div
                    key={participantId}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {isCurrentUser ? 'Du' : participantId}
                      </p>
                      {isChatCreator && (
                        <p className="text-xs text-cyan-400">
                          {t('group.creator')}
                        </p>
                      )}
                    </div>
                    
                    {isCreator && !isCurrentUser && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveMember(participantId)}
                        disabled={actionLoading}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Aktionen */}
        <div className="space-y-3">
          {!isCreator && (
            <Button
              variant="danger"
              fullWidth
              onClick={handleLeaveGroup}
              disabled={actionLoading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('group.leave')}
            </Button>
          )}
          
          {isCreator && (
            <Button
              variant="danger"
              fullWidth
              onClick={handleDeleteGroup}
              disabled={actionLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('group.delete')}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
