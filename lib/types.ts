export type Contact = {
  id: string;
  name: string;
  initials: string;
  color: string;
  about: string;
  phone: string;
  online?: boolean;
  isGroup?: boolean;
  members?: string;
};

export type Conversation = {
  id: string;
  contactId: string;
  lastMessage: string;
  lastMessageAt: number;
  unread: number;
  pinned?: boolean;
  muted?: boolean;
  favorite?: boolean;
};

export type MessageStatus = 'sent' | 'delivered' | 'read';

export type Message = {
  id: string;
  conversationId: string;
  text: string;
  sentAt: number;
  outgoing: boolean;
  status?: MessageStatus;
};

export type CallItem = {
  id: string;
  contactId: string;
  direction: 'incoming' | 'outgoing';
  kind: 'audio' | 'video';
  at: number;
  missed?: boolean;
};

export type StatusItem = {
  id: string;
  contactId: string;
  postedAt: number;
  seen: boolean;
  caption: string;
  background: string;
  icon: keyof typeof import('@expo/vector-icons/Ionicons').default.glyphMap;
};

export type RootStackParamList = {
  Main: undefined;
  Chat: { conversationId: string };
  NewChat: undefined;
  NewCall: undefined;
  StatusViewer: { statusId: string };
  ContactInfo: { contactId: string };
};
