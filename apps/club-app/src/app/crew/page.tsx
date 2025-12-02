'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Loader } from '@nightlife-os/ui';
import { useAuth, useI18n, useFriends, useChats } from '@nightlife-os/core';
import { ArrowLeft, UserPlus, Users as UsersIcon, MessageCircle, UserMinus } from 'lucide-react';

export default function CrewPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  
  // Friends
  const { friends, loading: friendsLoading, removeFriend } = useFriends(user?.uid);
  
  // Chats (Demo-Club)
  const { chats, loading: chatsLoading, createPrivateChat } = useChats('demo-club-1', user?.uid);
  
  const [removingFriendId, setRemovingFriendId] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Freund wirklich entfernen?')) return;
    
    setRemovingFriendId(friendId);
    try {
      await removeFriend(friendId);
    } catch (err) {
      console.error('Error removing friend:', err);
    } finally {
      setRemovingFriendId(null);
    }
  };

  const handleOpenChat = async (friendId: string, friendName: string) => {
    try {
      const chatId = await createPrivateChat('demo-club-1', friendId, friendName);
      router.push(`/crew/chat/${chatId}`);
    } catch (err) {
      console.error('Error opening chat:', err);
    }
  };

  // Gruppiere Chats
  const groupChats = chats?.filter(c => c.type === 'group') || [];

  return (
    <main className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-cyan-400">
              {t('crew.title')}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push('/crew/add-friend')}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              {t('crew.addFriend')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/crew/create-group')}
            >
              <UsersIcon className="h-4 w-4 mr-1" />
              {t('crew.createGroup')}
            </Button>
          </div>
        </div>

        {/* Crews (Gruppen) */}
        {chatsLoading ? (
          <Card className="mb-6">
            <CardContent className="py-8">
              <div className="flex items-center justify-center gap-3">
                <Loader size="md" />
                <p className="text-slate-300">{t('common.loading')}</p>
              </div>
            </CardContent>
          </Card>
        ) : groupChats.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-300 mb-3">
              {t('crew.crews')}
            </h2>
            <div className="space-y-2">
              {groupChats.map(chat => {
                // Phase 7: Markiere Broadcast-Chats
                const isBroadcast = chat.mode === 'broadcast';
                const broadcastLabel = chat.broadcastScope === 'global' 
                  ? t('broadcast.nightlifeNews') 
                  : t('broadcast.clubNews');
                
                return (
                  <Card 
                    key={chat.chatId} 
                    hover
                    className="cursor-pointer"
                    onClick={() => router.push(`/crew/chat/${chat.chatId}`)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${isBroadcast ? 'bg-orange-600' : 'bg-cyan-600'} rounded-full flex items-center justify-center`}>
                          <UsersIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-200">{chat.name}</p>
                            {isBroadcast && (
                              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded">
                                {broadcastLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {chat.participants?.length || 0} Mitglieder
                          </p>
                        </div>
                        <MessageCircle className="h-5 w-5 text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Freunde */}
        <div>
          <h2 className="text-lg font-semibold text-slate-300 mb-3">
            {t('crew.friends')}
          </h2>
          
          {friendsLoading ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center gap-3">
                  <Loader size="md" />
                  <p className="text-slate-300">{t('common.loading')}</p>
                </div>
              </CardContent>
            </Card>
          ) : friends && friends.length > 0 ? (
            <div className="space-y-2">
              {friends.map(friend => (
                <Card key={friend.friendId}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-cyan-400">
                          {(friend.displayName || friend.email)?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-200">
                          {friend.displayName || friend.email}
                        </p>
                        <p className="text-xs text-slate-400">
                          {friend.friendCode}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenChat(friend.friendId, friend.displayName || friend.email)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveFriend(friend.friendId)}
                          disabled={removingFriendId === friend.friendId}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-slate-400">{t('crew.noFriends')}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push('/crew/add-friend')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('crew.addFriend')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
