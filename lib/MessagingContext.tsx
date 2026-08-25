import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CONTACTS, INITIAL_CALLS, INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from './data';
import { CallItem, Conversation, Message } from './types';

const STORAGE_KEY = '@loop/messaging-state-v1';

type StoredState = {
  conversations: Conversation[];
  messages: Message[];
  calls: CallItem[];
};

type MessagingContextValue = StoredState & {
  hydrated: boolean;
  typingConversationId: string | null;
  sendMessage: (conversationId: string, text: string) => void;
  markRead: (conversationId: string) => void;
  togglePin: (conversationId: string) => void;
  toggleMute: (conversationId: string) => void;
  startConversation: (contactId: string) => string;
  placeCall: (contactId: string, kind: 'audio' | 'video') => void;
};

const MessagingContext = createContext<MessagingContextValue | null>(null);

const replies: Record<string, string[]> = {
  maya: ['Amazing — can’t wait! 😊', 'Sounds perfect to me.', 'I’ll message you when I’m on my way.'],
  noah: ['Got it, thank you!', 'Let me check and get back to you.', 'Perfect 👍'],
  aisha: ['Yes! I love that idea.', 'Haha, absolutely 😄', 'Sending you the details now.'],
  default: ['Thanks for the message!', 'Sounds good to me 👍', 'Perfect, talk soon!'],
};

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [calls, setCalls] = useState(INITIAL_CALLS);
  const [hydrated, setHydrated] = useState(false);
  const [typingConversationId, setTypingConversationId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && active) {
          const parsed: StoredState = JSON.parse(saved);
          setConversations(parsed.conversations);
          setMessages(parsed.messages);
          setCalls(parsed.calls);
        }
      } catch {
        // The app remains usable with its bundled conversation history.
      } finally {
        setTimeout(() => active && setHydrated(true), 350);
      }
    }
    hydrate();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, messages, calls })).catch(() => undefined);
  }, [calls, conversations, hydrated, messages]);

  const markRead = useCallback((conversationId: string) => {
    setConversations((current) => current.map((item) => item.id === conversationId ? { ...item, unread: 0 } : item));
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const timestamp = Date.now();
    const outgoing: Message = {
      id: `message-${timestamp}`,
      conversationId,
      text: clean,
      sentAt: timestamp,
      outgoing: true,
      status: 'sent',
    };
    setMessages((current) => [...current, outgoing]);
    setConversations((current) => current.map((item) => item.id === conversationId
      ? { ...item, lastMessage: clean, lastMessageAt: timestamp, unread: 0 }
      : item));

    setTimeout(() => {
      setMessages((current) => current.map((item) => item.id === outgoing.id ? { ...item, status: 'read' } : item));
      setTypingConversationId(conversationId);
    }, 500);

    setTimeout(() => {
      const conversation = conversations.find((item) => item.id === conversationId);
      const pool = replies[conversation?.contactId ?? 'default'] ?? replies.default;
      const replyText = pool[Math.floor(Math.random() * pool.length)];
      const replyTime = Date.now();
      const incoming: Message = {
        id: `reply-${replyTime}`,
        conversationId,
        text: replyText,
        sentAt: replyTime,
        outgoing: false,
      };
      setMessages((current) => [...current, incoming]);
      setConversations((current) => current.map((item) => item.id === conversationId
        ? { ...item, lastMessage: replyText, lastMessageAt: replyTime }
        : item));
      setTypingConversationId(null);
    }, 1900);
  }, [conversations]);

  const togglePin = useCallback((conversationId: string) => {
    setConversations((current) => current.map((item) => item.id === conversationId ? { ...item, pinned: !item.pinned } : item));
  }, []);

  const toggleMute = useCallback((conversationId: string) => {
    setConversations((current) => current.map((item) => item.id === conversationId ? { ...item, muted: !item.muted } : item));
  }, []);

  const startConversation = useCallback((contactId: string) => {
    const existing = conversations.find((item) => item.contactId === contactId);
    if (existing) return existing.id;
    const contact = CONTACTS.find((item) => item.id === contactId);
    const newConversation: Conversation = {
      id: `c-${contactId}`,
      contactId,
      lastMessage: contact?.about ?? 'Start a conversation',
      lastMessageAt: Date.now(),
      unread: 0,
    };
    setConversations((current) => [newConversation, ...current]);
    return newConversation.id;
  }, [conversations]);

  const placeCall = useCallback((contactId: string, kind: 'audio' | 'video') => {
    const item: CallItem = {
      id: `call-${Date.now()}`,
      contactId,
      kind,
      direction: 'outgoing',
      at: Date.now(),
    };
    setCalls((current) => [item, ...current]);
  }, []);

  const value = useMemo(() => ({
    conversations,
    messages,
    calls,
    hydrated,
    typingConversationId,
    sendMessage,
    markRead,
    togglePin,
    toggleMute,
    startConversation,
    placeCall,
  }), [calls, conversations, hydrated, markRead, messages, placeCall, sendMessage, startConversation, toggleMute, togglePin, typingConversationId]);

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}

export function useMessaging() {
  const value = useContext(MessagingContext);
  if (!value) throw new Error('useMessaging must be used inside MessagingProvider');
  return value;
}
