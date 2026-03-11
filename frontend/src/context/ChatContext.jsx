import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Client } from "@stomp/stompjs";
import * as SockJSModule from "sockjs-client";
import { useAuth } from "./AuthContext";

const SockJS = SockJSModule.default || SockJSModule;

const ChatContext = createContext(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);

  const connect = useCallback(() => {
    if (clientRef.current) return;
    try {
      const token = localStorage.getItem("token");
      const wsUrl = import.meta.env.VITE_WS_URL || "/ws";
      const stompClient = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        reconnectDelay: 5000,
        onConnect: () => {
          setConnected(true);
          console.log("WebSocket connected");
        },
        onDisconnect: () => {
          setConnected(false);
          console.log("WebSocket disconnected");
        },
      });
      stompClient.activate();
      clientRef.current = stompClient;
    } catch (e) {
      console.warn("WebSocket connection failed:", e);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setConnected(false);
  }, []);

  const subscribeToChat = useCallback(
    (appointmentId, callback) => {
      if (clientRef.current && connected) {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }
        subscriptionRef.current = clientRef.current.subscribe(
          `/topic/chat/${appointmentId}`,
          (message) => {
            const messageData = JSON.parse(message.body);
            callback(messageData);
          },
        );
        return () => {
          if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
          }
        };
      }
      return () => {};
    },
    [connected],
  );

  const sendMessage = useCallback(
    (appointmentId, message) => {
      if (clientRef.current && connected) {
        clientRef.current.publish({
          destination: `/app/chat.sendMessage/${appointmentId}`,
          body: JSON.stringify(message),
        });
      }
    },
    [connected],
  );

  useEffect(() => {
    if (user) {
      connect();
    }
    return () => disconnect();
  }, [user, connect, disconnect]);

  return (
    <ChatContext.Provider value={{ connected, subscribeToChat, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
