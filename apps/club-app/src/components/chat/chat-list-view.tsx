'use client'

import { User } from 'firebase/auth'
import { Friend, Chat } from '@nightlife/core'
import { doc, deleteDoc } from 'firebase/firestore'
import { getDbInstance } from '@nightlife/core'
import { useTranslation } from '@nightlife/ui'
import { Button, Card, Icon } from '@nightlife/ui'

interface ChatListViewProps {
  user: User
  friends: Friend[]
  groups: Chat[]
  onOpenChat: (chat: any) => void
  onOpenGroupManage: (group: Chat) => void
  onAddFriend: () => void
  onCreateGroup: () => void
}

export const ChatListView = ({
  user,
  friends,
  groups,
  onOpenChat,
  onOpenGroupManage,
  onAddFriend,
  onCreateGroup,
}: ChatListViewProps) => {
  const { t } = useTranslation()

  const removeFriend = async (friendId: string) => {
    if (!confirm('Wirklich löschen und entfreunden?')) return

    const db = getDbInstance()
    await deleteDoc(doc(db, 'users', user.uid, 'friends', friendId))
    await deleteDoc(doc(db, 'users', friendId, 'friends', user.uid))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">{t('chat.title')}</h1>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onAddFriend} variant="primary" className="flex-1">
          <Icon name="user-plus" size={20} />
          {t('chat.addFriend')}
        </Button>
        <Button onClick={onCreateGroup} variant="secondary" className="flex-1">
          <Icon name="users" size={20} />
          {t('chat.createGroup')}
        </Button>
      </div>

      {/* Crews (Gruppen) */}
      {groups.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-400">{t('chat.crews')}</h2>
          {groups.map((group) => (
            <Card
              key={group.id}
              onClick={() => onOpenChat({ ...group, type: 'group' })}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Icon name="users" size={20} />
                </div>
                <div>
                  <div className="font-bold">{group.name || 'Crew'}</div>
                  <div className="text-xs text-slate-500">
                    {group.participants?.length || 0} Mitglieder
                  </div>
                </div>
              </div>
              <Icon name="chevron-right" size={20} className="text-slate-500" />
            </Card>
          ))}
        </div>
      )}

      {/* Freunde */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-400">{t('chat.friends')}</h2>
        {friends.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-8">
            {t('chat.noFriends')}
          </p>
        ) : (
          friends.map((friend) => (
            <Card
              key={friend.uid}
              className="flex items-center justify-between"
            >
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => onOpenChat({ ...friend, type: 'private' })}
              >
                <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center font-bold">
                  {friend.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="font-medium">
                  {friend.email?.split('@')[0] || 'Unbekannt'}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onOpenChat({ ...friend, type: 'private' })}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Icon name="message-circle" size={20} className="text-cyan-500" />
                </button>
                <button
                  onClick={() => removeFriend(friend.uid)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Icon name="trash-2" size={20} className="text-red-500" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
