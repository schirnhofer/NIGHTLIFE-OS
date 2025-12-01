'use client'

import { useState } from 'react'
import { User } from 'firebase/auth'
import { Friend } from '@nightlife/core'
import { collection, addDoc } from 'firebase/firestore'
import { getDbInstance } from '@nightlife/core'
import { useTranslation } from '@nightlife/ui'
import { Button, Input, Card, Icon } from '@nightlife/ui'

interface ChatGroupCreateViewProps {
  user: User
  friends: Friend[]
  onBack: () => void
}

export const ChatGroupCreateView = ({ user, friends, onBack }: ChatGroupCreateViewProps) => {
  const { t } = useTranslation()
  const [groupName, setGroupName] = useState('')
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])

  const toggleFriendSelect = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter((id) => id !== friendId))
    } else {
      setSelectedFriends([...selectedFriends, friendId])
    }
  }

  const createGroup = async () => {
    if (!groupName.trim() || selectedFriends.length === 0) {
      alert('Name oder Freunde fehlen')
      return
    }

    const db = getDbInstance()
    await addDoc(collection(db, 'chats'), {
      type: 'group',
      name: groupName,
      participants: [user.uid, ...selectedFriends],
      createdBy: user.uid,
      createdAt: Date.now(),
    })

    onBack()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 className="text-2xl font-black">{t('chat.newGroup')}</h1>
      </div>

      {/* Group Name */}
      <Input
        placeholder={t('chat.groupName')}
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      {/* Select Friends */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-400">{t('chat.selectMembers')}</h2>
        {friends.map((friend) => {
          const isSelected = selectedFriends.includes(friend.uid)
          return (
            <Card
              key={friend.uid}
              onClick={() => toggleFriendSelect(friend.uid)}
              className={`cursor-pointer transition-all ${
                isSelected ? 'border-cyan-500 bg-cyan-900/20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center font-bold">
                    {friend.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="font-medium">{friend.email?.split('@')[0] || 'Unbekannt'}</div>
                </div>
                {isSelected && <Icon name="check" size={20} className="text-cyan-500" />}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Create Button */}
      <Button
        onClick={createGroup}
        variant="primary"
        size="lg"
        fullWidth
        disabled={!groupName.trim() || selectedFriends.length === 0}
      >
        {t('chat.createButton')}
      </Button>
    </div>
  )
}
