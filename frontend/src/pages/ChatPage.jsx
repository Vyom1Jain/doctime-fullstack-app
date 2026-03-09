import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, ArrowLeft, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import ChatBubble from '../components/ChatBubble';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export default function ChatPage() {
  const { t } = useTranslation();
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, connected, subscribeToChat, sendMessage } = useChat();

  const [appointment, setAppointment] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingAppt, setLoadingAppt] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Fetch appointment + chat history
  useEffect(() => {
    if (!appointmentId) return;
    setLoadingAppt(true);
    axios.get(`/api/appointments/${appointmentId}`)
      .then(({ data }) => setAppointment(data))
      .catch(() => setError(t('errors.loadFailed', 'Failed to load appointment details.')))
      .finally(() => setLoadingAppt(false));

    setLoadingHistory(true);
    axios.get(`/api/chat/${appointmentId}`)
      .then(({ data }) => setChatMessages(data || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [appointmentId, t]);

  // Subscribe to live chat
  useEffect(() => {
    if (!appointmentId) return;
    const unsubscribe = subscribeToChat(appointmentId, (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [appointmentId, subscribeToChat]);

  const handleSend = useCallback(async () => {
    const content = inputText.trim();
    if (!content || !connected) return;
    setSending(true);
    try {
      sendMessage(appointmentId, { content, senderId: user.id, senderName: user.name });
      setInputText('');
      inputRef.current?.focus();
    } catch {
      setError(t('chat.sendFailed', 'Failed to send message.'));
    } finally {
      setSending(false);
    }
  }, [inputText, connected, sendMessage, appointmentId, user, t]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherPerson = user?.role === 'PATIENT'
    ? appointment?.doctorName
    : appointment?.patientName;

  const allMessages = chatMessages;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 pb-16 md:pb-0 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              {loadingAppt ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              ) : (
                <>
                  <p className="font-semibold text-gray-900 truncate">
                    {otherPerson || t('chat.unknownUser', 'Unknown')}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {appointment?.specialty || (user?.role === 'PATIENT' ? t('chat.doctor', 'Doctor') : t('chat.patient', 'Patient'))}
                  </p>
                </>
              )}
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
              connected ? 'bg-secondary/10 text-secondary' : 'bg-red-100 text-red-600'
            }`}>
              {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {connected ? t('chat.connected', 'Connected') : t('chat.disconnected', 'Disconnected')}
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-2">{error}</div>
            )}

            {(loadingHistory || !connected) && allMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-500">
                  {loadingHistory ? t('chat.loadingHistory', 'Loading messages...') : t('chat.connecting', 'Connecting...')}
                </p>
              </div>
            )}

            {!loadingHistory && allMessages.length === 0 && connected && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">{t('chat.noMessages', 'No messages yet')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('chat.startConversation', 'Start the conversation!')}</p>
              </div>
            )}

            {allMessages.map((msg, idx) => (
              <ChatBubble key={msg.id || idx} message={msg} currentUserId={user?.id} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={connected ? t('chat.typePlaceholder', 'Type a message...') : t('chat.disconnectedPlaceholder', 'Reconnecting...')}
              disabled={!connected || sending}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400 max-h-32"
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || !connected || sending}
              className="p-2.5 rounded-xl bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-all flex-shrink-0"
              aria-label={t('chat.send', 'Send')}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
