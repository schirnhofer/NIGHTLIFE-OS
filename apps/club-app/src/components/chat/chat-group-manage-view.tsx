'use client'

import { User } from 'firebase/auth'
import { Chat, Friend } from '@nightlife/core'
import { doc, updateDoc, deleteDoc, arrayRemove, arrayUnion } from 'firebase/firestore'
import { getDbInstance } from '@nightlife/core'
import { useTranslation } from '@nightlife/ui'
import { Button, Card, Icon } from '@nightlife/ui'

interface ChatGroupManageViewProps {
  user: User
  group: Chat
  friends: Friend[]
  onBack: () => void
}

export const ChatGroupManageView = ({ user, group, friends, onBack }: ChatGroupManageViewProps) => {
  const { t } = useTranslation()
  const isCreator = group.createdBy === user.uid

  const removeFromGroup = async (userId: string) => {
    if (!confirm('Entfernen?')) return
    const db = getDbInstance()
    await updateDoc(doc(db, 'chats', group.id!), {
      participants: arrayRemove(userId),
    })
  }

  const deleteGroup = async () => {
    if (!confirm('Gruppe löschen?')) return
    const db = getDbInstance()
    await deleteDoc(doc(db, 'chats', group.id!))
    onBack()
  }

  const leaveGroup = async () => {
    if (!confirm('Verlassen?')) return
    const db = getDbInstance()
    await updateDoc(doc(db, 'chats', group.id!), {
      participants: arrayRemove(user.uid),
    })
    onBack()
  }

  const addToGroup = async (friendId: string) => {
    const db = getDbInstance()
    await updateDoc(doc(db, 'chats', group.id!), {
      participants: arrayUnion(friendId),
    })
    alert('Hinzugefügt!')
  }

  const friendsNotInGroup = friends.filter(
    (f) => !group.participants?.includes(f.uid)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 className="text-2xl font-black">{group.name}</h1>
      </div>

      {/* Members */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-400">{t('chat.members')}</h2>
        {group.participants?.map((participantId) => {
          const isMe = participantId === user.uid
          return (
            <Card key={participantId}>
              <div className="flex items-center justify-between">
                <div className="font-medium">{isMe ? t('chat.you') : participantId.slice(0, 8)}</div>
                {isCreator && !isMe && (
                  <button
                    onClick={() => removeFromGroup(participantId)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Icon name="x" size={20} className="text-red-500" />
                  </button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Add Friends */}
      {isCreator && friendsNotInGroup.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400">Freunde hinzufügen</h2>
          {friendsNotInGroup.map((friend) => (
            <Card key={friend.uid}>
              <div className="flex items-center justify-between">
                <div className="font-medium">{friend.email?.split('@')[0] || 'Unbekannt'}</div>
                <button
                  onClick={() => addToGroup(friend.uid)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Icon name="user-plus" size={20} className="text-green-500" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {isCreator ? (
          <Button onClick={deleteGroup} variant="danger" fullWidth>
            {t('chat.deleteGroup')}
          </Button>
        ) : (
          <Button onClick={leaveGroup} variant="danger" fullWidth>
            {t('chat.leaveGroup')}
          </Button>
        )}
      </div>
    </div>
  )
}
