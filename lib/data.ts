import { CallItem, Contact, Conversation, Message, StatusItem } from './types';

const now = Date.now();
const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;

export const CONTACTS: Contact[] = [
  { id: 'maya', name: 'Maya Chen', initials: 'MC', color: '#D96C75', about: 'Creating a little magic ✨', phone: '+1 415 555 0142', online: true },
  { id: 'noah', name: 'Noah Williams', initials: 'NW', color: '#5D7FD3', about: 'Available', phone: '+1 212 555 0187' },
  { id: 'aisha', name: 'Aisha Rahman', initials: 'AR', color: '#A66EC7', about: 'At the movies', phone: '+44 7700 900128', online: true },
  { id: 'weekend', name: 'Weekend Crew', initials: 'WC', color: '#E59A3B', about: 'The group for our next adventure', phone: '', isGroup: true, members: 'Maya, Noah, Aisha, Leo, you' },
  { id: 'leo', name: 'Leo Martins', initials: 'LM', color: '#3D9F94', about: 'Coffee first ☕', phone: '+351 912 345 672' },
  { id: 'sophie', name: 'Sophie Taylor', initials: 'ST', color: '#CC668E', about: 'Busy building things', phone: '+61 412 345 678' },
  { id: 'family', name: 'Family', initials: 'FA', color: '#729B59', about: 'Home is where the heart is', phone: '', isGroup: true, members: 'Mom, Dad, Mia, you' },
  { id: 'omar', name: 'Omar Haddad', initials: 'OH', color: '#4D89B5', about: 'Hey there! I am using Loop.', phone: '+971 50 123 4567' },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  { id: 'c-maya', contactId: 'maya', lastMessage: 'Perfect, see you at 7! 🙌', lastMessageAt: now - 8 * minute, unread: 2, pinned: true, favorite: true },
  { id: 'c-weekend', contactId: 'weekend', lastMessage: 'Noah: I’ll bring the snacks', lastMessageAt: now - 27 * minute, unread: 4, pinned: true },
  { id: 'c-noah', contactId: 'noah', lastMessage: 'Voice message · 0:18', lastMessageAt: now - 2.1 * hour, unread: 0 },
  { id: 'c-aisha', contactId: 'aisha', lastMessage: 'That photo is incredible!', lastMessageAt: now - 4.5 * hour, unread: 0, favorite: true },
  { id: 'c-family', contactId: 'family', lastMessage: 'Mom: Dinner on Sunday?', lastMessageAt: now - day, unread: 0, muted: true },
  { id: 'c-leo', contactId: 'leo', lastMessage: 'Thanks! Talk soon.', lastMessageAt: now - 2 * day, unread: 0 },
];

export const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', conversationId: 'c-maya', text: 'Hey! Are we still on for dinner tonight?', sentAt: now - 46 * minute, outgoing: true, status: 'read' },
  { id: 'm2', conversationId: 'c-maya', text: 'Absolutely! I found a cozy place near the park.', sentAt: now - 42 * minute, outgoing: false },
  { id: 'm3', conversationId: 'c-maya', text: 'That sounds great. Should I book us a table?', sentAt: now - 31 * minute, outgoing: true, status: 'read' },
  { id: 'm4', conversationId: 'c-maya', text: 'Already done 😊', sentAt: now - 11 * minute, outgoing: false },
  { id: 'm5', conversationId: 'c-maya', text: 'Perfect, see you at 7! 🙌', sentAt: now - 8 * minute, outgoing: false },
  { id: 'w1', conversationId: 'c-weekend', text: 'Beach day this Saturday?', sentAt: now - 3 * hour, outgoing: true, status: 'read' },
  { id: 'w2', conversationId: 'c-weekend', text: 'I’m in! The weather looks perfect.', sentAt: now - 2.5 * hour, outgoing: false },
  { id: 'w3', conversationId: 'c-weekend', text: 'I’ll bring the snacks', sentAt: now - 27 * minute, outgoing: false },
  { id: 'n1', conversationId: 'c-noah', text: 'Can you send me the address?', sentAt: now - 3 * hour, outgoing: false },
  { id: 'n2', conversationId: 'c-noah', text: 'Sure — sending it now.', sentAt: now - 2.5 * hour, outgoing: true, status: 'delivered' },
  { id: 'n3', conversationId: 'c-noah', text: '🎤 Voice message · 0:18', sentAt: now - 2.1 * hour, outgoing: false },
];

export const INITIAL_CALLS: CallItem[] = [
  { id: 'call1', contactId: 'maya', direction: 'outgoing', kind: 'video', at: now - 1.3 * hour },
  { id: 'call2', contactId: 'noah', direction: 'incoming', kind: 'audio', at: now - 5 * hour, missed: true },
  { id: 'call3', contactId: 'aisha', direction: 'incoming', kind: 'video', at: now - day },
  { id: 'call4', contactId: 'leo', direction: 'outgoing', kind: 'audio', at: now - 3 * day },
  { id: 'call5', contactId: 'sophie', direction: 'incoming', kind: 'audio', at: now - 5 * day, missed: true },
];

export const STATUSES: StatusItem[] = [
  { id: 'status1', contactId: 'aisha', postedAt: now - 12 * minute, seen: false, caption: 'Golden hour, best hour.', background: '#A95F66', icon: 'sunny-outline' },
  { id: 'status2', contactId: 'maya', postedAt: now - 44 * minute, seen: false, caption: 'Tiny moments from today 🌿', background: '#377866', icon: 'leaf-outline' },
  { id: 'status3', contactId: 'leo', postedAt: now - 2 * hour, seen: false, caption: 'Found the perfect flat white.', background: '#8A654C', icon: 'cafe-outline' },
  { id: 'status4', contactId: 'sophie', postedAt: now - 5 * hour, seen: true, caption: 'Work in progress.', background: '#53668F', icon: 'color-palette-outline' },
];

export function getContact(id: string) {
  return CONTACTS.find((contact) => contact.id === id);
}

export function formatListTime(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  const yesterday = new Date(today.getTime() - day);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'short' });
}

export function formatCallTime(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();
  const label = date.toDateString() === today.toDateString()
    ? 'Today'
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${label}, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

export function formatRelative(timestamp: number) {
  const diff = Math.max(1, Math.floor((Date.now() - timestamp) / minute));
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
}
