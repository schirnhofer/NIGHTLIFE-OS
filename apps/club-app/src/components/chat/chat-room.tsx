'use client'

import { useState, useEffect, useRef } from 'react'
import { User } from 'firebase/auth'
import { ChatMessage } from '@nightlife/core'
import { collection, query, orderBy, limit, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore'
import { getDbInstance } from '@nightlife/core'
import { useTranslation } from '@nightlife/ui'
import { Button, Input, Icon } from '@nightlife/ui'
import { compressImage } from '@/lib/image-compression'
import { EphemeralImage } from './ephemeral-image'

interface ChatRoomProps {
  user: User
  chatTarget: any
  onBack: () => void
  onSettings?: () => void
}

export const ChatRoom = ({ user, chatTarget, onBack, onSettings }: ChatRoomProps) => {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [txt, setTxt] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const chatId = chatTarget.type === 'group'
    ? chatTarget.id
    : [user.uid, chatTarget.uid].sort().join('_')

  const title = chatTarget.name || chatTarget.email?.split('@')[0] || 'Chat'

  useEffect(() => {
    const db = getDbInstance()
    const messagesRef = collection(db, 'chats', chatId, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[]
      setMessages(msgs)

      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })

    return () => unsubscribe()
  }, [chatId])

  const sendMessage = async (text: string | null = null, img: string | null = null, timer: number | null = null) => {
    if (!text && !img) return

    const db = getDbInstance()
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: text || '',
      image: img || null,
      ephemeral: timer || null,
      sender: user.uid,
      createdAt: Date.now(),
    })

    setTxt('')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const time = prompt('Timer? (5 für 5s, Leer lassen für immer)')

    try {
      const base64 = await compressImage(file)
      sendMessage(null, base64, time ? parseInt(time) : null)
    } catch (err) {
      alert(String(err))
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const deleteMessage = async (msgId: string) => {
    if (!confirm('Löschen?')) return
    const db = getDbInstance()
    await deleteDoc(doc(db, 'chats', chatId, 'messages', msgId))
  }

  const expireImage = async (msgId: string) => {
    const db = getDbInstance()
    await updateDoc(doc(db, 'chats', chatId, 'messages', msgId), {
      image: null,
      text: t('chat.imageDeleted'),
      ephemeral: null,
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <Icon name="arrow-left" size={24} />
          </button>
          <h1 className="text-xl font-black">{title}</h1>
        </div>
        {onSettings && (
          <button onClick={onSettings} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <Icon name="settings" size={20} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((m) => {
          const isMe = m.sender === user.uid
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {m.image && (
                  <EphemeralImage
                    src={m.image}
                    timer={m.ephemeral || null}
                    isMe={isMe}
                    onExpire={() => expireImage(m.id!)}
                  />
                )}

                {m.text && (
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-cyan-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                )}

                {isMe && (
                  <button
                    onClick={() => deleteMessage(m.id!)}
                    className="text-[10px] text-red-500 mt-1 opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1"
                  >
                    <Icon name="trash-2" size={10} />
                    {t('common.delete')}
                  </button>
                )}
              </div>
            </div>
          )
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
        >
          <Icon name="camera" size={20} />
        </button>
        <Input
          placeholder={t('chat.typeMessage')}
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(txt)}
          className="flex-1"
        />
        <button
          onClick={() => sendMessage(txt)}
          disabled={!txt.trim()}
          className="p-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          <Icon name="send" size={20} />
        </button>
      </div>
    </div>
  )
}
