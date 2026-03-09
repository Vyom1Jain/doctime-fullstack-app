import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { useTranslation } from 'react-i18next'

const ChatPage = () => {
  const { appointmentId } = useParams()
  const { user } = useAuth()
  const { subscribeToChat, sendMessage, connected } = useChat()
  const { t } = useTranslation()

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await axios.get(`/api/chat/${appointmentId}/messages`)
        setMessages(res.data)
      } catch (e) {
        console.error(e)
      }
    }
    loadHistory()
  }, [appointmentId])

  useEffect(() => {
    if (!connected) return
    subscribeToChat(appointmentId, (msg) => {
      setMessages((prev) => [...prev, msg])
    })
  }, [appointmentId, connected, subscribeToChat])

  const handleSend = () => {
    if (!text.trim()) return
    const msg = {
      appointmentId: Number(appointmentId),
      senderId: user.userId,
      senderName: user.name,
      type: 'TEXT',
      content: text.trim()
    }
    sendMessage(appointmentId, msg)
    setMessages((prev) => [...prev, { ...msg, sentAt: new Date().toISOString() }])
    setText('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="px-4 py-3 border-b bg-white">
        <p className="text-xs text-slate-500">{t('chat.encrypted')}</p>
      </header>
      <main className="flex-1 px-4 py-3 space-y-2 overflow-y-auto">
        {messages.map((m) => {
          const isMine = m.senderId === user.userId
          return (
            <div
              key={m.id || m.sentAt}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  isMine
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white text-slate-900 rounded-bl-sm shadow-sm'
                }`}
              >
                <p>{m.content}</p>
                <p className="text-[10px] opacity-70 mt-1 text-right">
                  {m.sentAt && new Date(m.sentAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )
        })}
      </main>
      <footer className="p-3 border-t bg-white flex items-center gap-2">
        <input
          className="input-field text-sm flex-1"
          placeholder={t('chat.type')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-lg"
        >
          ➤
        </button>
      </footer>
    </div>
  )
}

export default ChatPage
