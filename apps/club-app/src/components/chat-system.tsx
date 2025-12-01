'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { UserProfile, Friend, Chat } from '@nightlife/core'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { getDbInstance } from '@nightlife/core'
import { ChatListView } from './chat/chat-list-view'
import { ChatAddFriendView } from './chat/chat-add-friend-view'
import { ChatGroupCreateView } from './chat/chat-group-create-view'
import { ChatGroupManageView } from './chat/chat-group-manage-view'
import { ChatRoom } from './chat/chat-room'

type ChatView = 'list' | 'add' | 'chat' | 'group_create' | 'group_manage'

interface ChatSystemProps {
  user: User
  userData: UserProfile
  initialChat: Friend | null
  clearInitial: () => void
}

export const ChatSystem = ({ user, userData, initialChat, clearInitial }: ChatSystemProps) => {
  const [view, setView] = useState<ChatView>('list')
  const [friends, setFriends] = useState<Friend[]>([])
  const [groups, setGroups] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<any>(null)
  const [managedGroup, setManagedGroup] = useState<Chat | null>(null)

  // Freunde laden
  useEffect(() => {
    const db = getDbInstance()
    const friendsRef = collection(db, 'users', user.uid, 'friends')
    
    const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
      const friendsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Friend[]
      setFriends(friendsList)
    })

    return () => unsubscribe()
  }, [user.uid])

  // Gruppen laden
  useEffect(() => {
    const db = getDbInstance()
    const chatsRef = collection(db, 'chats')
    const q = query(chatsRef, where('participants', 'array-contains', user.uid))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chat[]
      const groupsList = allChats.filter(c => c.type === 'group')
      setGroups(groupsList)
    })

    return () => unsubscribe()
  }, [user.uid])

  // Initial Chat öffnen
  useEffect(() => {
    if (initialChat) {
      setActiveChat(initialChat)
      setView('chat')
      clearInitial()
    }
  }, [initialChat, clearInitial])

  const openChat = (chat: any) => {
    setActiveChat(chat)
    setView('chat')
  }

  const openGroupManage = (group: Chat) => {
    setManagedGroup(group)
    setView('group_manage')
  }

  return (
    <div>
      {view === 'list' && (
        <ChatListView
          user={user}
          friends={friends}
          groups={groups}
          onOpenChat={openChat}
          onOpenGroupManage={openGroupManage}
          onAddFriend={() => setView('add')}
          onCreateGroup={() => setView('group_create')}
        />
      )}

      {view === 'add' && (
        <ChatAddFriendView
          user={user}
          userData={userData}
          onBack={() => setView('list')}
        />
      )}

      {view === 'group_create' && (
        <ChatGroupCreateView
          user={user}
          friends={friends}
          onBack={() => setView('list')}
        />
      )}

      {view === 'group_manage' && managedGroup && (
        <ChatGroupManageView
          user={user}
          group={managedGroup}
          friends={friends}
          onBack={() => setView('list')}
        />
      )}

      {view === 'chat' && activeChat && (
        <ChatRoom
          user={user}
          chatTarget={activeChat}
          onBack={() => setView('list')}
          onSettings={activeChat.type === 'group' ? () => openGroupManage(activeChat) : undefined}
        />
      )}
    </div>
  )
}
