import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const ChatContext = createContext(null)

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)
  const clientRef = useRef(null)
  const subscriptionRef = useRef(null)

  const connect = () => {
    const socket = new SockJS(import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws')
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        console.log('WebSocket connected')
      },
      onDisconnect: () => {
        setConnected(false)
        console.log('WebSocket disconnected')
      }
    })
    
    stompClient.activate()
    clientRef.current = stompClient
  }

  const disconnect = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }
    if (clientRef.current) {
      clientRef.current.deactivate()
    }
  }

  const subscribeToChat = (appointmentId, callback) => {
    if (clientRef.current && connected) {
      subscriptionRef.current = clientRef.current.subscribe(
        `/topic/chat/${appointmentId}`,
        (message) => {
          const messageData = JSON.parse(message.body)
          callback(messageData)
        }
      )
    }
  }

  const sendMessage = (appointmentId, message) => {
    if (clientRef.current && connected) {
      clientRef.current.publish({
        destination: `/app/chat.sendMessage/${appointmentId}`,
        body: JSON.stringify(message)
      })
    }
  }

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [])

  return (
    <ChatContext.Provider value={{ messages, connected, subscribeToChat, sendMessage }}>
      {children}
    </ChatContext.Provider>
  )
}
