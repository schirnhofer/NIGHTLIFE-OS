'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Input } from '@nightlife-os/ui';
import { useAuth, useI18n, useFriends, useChats } from '@nightlife-os/core';
import { ArrowLeft, Check } from 'lucide-react';

export default function CreateGroupPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const { friends } = useFriends(user?.uid);
  const { createGroupChat } = useChats('demo-club-1', user?.uid);
  
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const toggleFriend = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedFriends.length === 0) {
      alert('Bitte Gruppenname und mindestens einen Freund auswählen');
      return;
    }

    if (!user?.uid) return;

    setLoading(true);
    try {
      const chatId = await createGroupChat('demo-club-1', groupName, selectedFriends, user.uid);
      router.push(`/crew/chat/${chatId}`);
    } catch (err) {
      console.error('Error creating group:', err);
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
            {t('group.create')}
          </h1>
        </div>

        {/* Gruppenname */}
        <Card className="mb-4">
          <CardContent className="py-6">
            <p className="text-sm text-slate-400 mb-3">
              {t('group.name')}
            </p>
            <Input
              placeholder="Meine Crew..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="text-lg"
            />
          </CardContent>
        </Card>

        {/* Freunde auswählen */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <p className="text-sm text-slate-400 mb-3">
              {t('group.selectFriends')}
            </p>
            
            {friends && friends.length > 0 ? (
              <div className="space-y-2">
                {friends.map(friend => {
                  const isSelected = selectedFriends.includes(friend.friendId);
                  return (
                    <button
                      key={friend.friendId}
                      onClick={() => toggleFriend(friend.friendId)}
                      className={`w-full p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-cyan-600/20 border-cyan-500'
                          : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-cyan-600 border-cyan-500'
                            : 'border-slate-600'
                        }`}>
                          {isSelected && <Check className="h-4 w-4 text-white" />}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-slate-200">
                            {friend.displayName || friend.email}
                          </p>
                          <p className="text-xs text-slate-400">
                            {friend.friendCode}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">
                {t('crew.noFriends')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Erstellen-Button */}
        <Button
          variant="default"
          fullWidth
          size="lg"
          onClick={handleCreateGroup}
          disabled={loading || !groupName || selectedFriends.length === 0}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
        >
          {t('common.create')}
        </Button>
      </div>
    </main>
  );
}
