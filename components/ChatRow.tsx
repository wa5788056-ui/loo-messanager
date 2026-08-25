import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatListTime } from '../lib/data';
import { useAppTheme } from '../lib/theme';
import { Contact, Conversation } from '../lib/types';
import { Avatar } from './Avatar';

export function ChatRow({ conversation, contact, onPress, onLongPress }: {
  conversation: Conversation;
  contact: Contact;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.container, { backgroundColor: pressed ? theme.surfaceAlt : theme.background }]}
    >
      <Avatar contact={contact} size={54} showOnline />
      <View style={[styles.content, { borderBottomColor: theme.border }]}>
        <View style={styles.topLine}>
          <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>{contact.name}</Text>
          <Text style={[styles.time, { color: conversation.unread ? theme.greenDark : theme.textSecondary }]}>
            {formatListTime(conversation.lastMessageAt)}
          </Text>
        </View>
        <View style={styles.bottomLine}>
          <View style={styles.previewWrap}>
            {conversation.lastMessage.includes('Voice message') ? (
              <Ionicons name="mic" size={16} color={theme.green} style={styles.previewIcon} />
            ) : null}
            <Text numberOfLines={1} style={[styles.preview, { color: theme.textSecondary }]}>{conversation.lastMessage}</Text>
          </View>
          <View style={styles.meta}>
            {conversation.muted ? <Ionicons name="volume-mute" size={15} color={theme.textSecondary} /> : null}
            {conversation.pinned ? <Ionicons name="pin" size={14} color={theme.textSecondary} /> : null}
            {conversation.unread > 0 ? (
              <View style={[styles.badge, { backgroundColor: theme.green }]}>
                <Text style={styles.badgeText}>{conversation.unread}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingLeft: 18, minHeight: 76, alignItems: 'center', gap: 14 },
  content: { flex: 1, minHeight: 76, justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingRight: 18 },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { flex: 1, fontSize: 16.5, fontWeight: '700' },
  time: { fontSize: 11.5, fontWeight: '500' },
  bottomLine: { flexDirection: 'row', alignItems: 'center', marginTop: 5, minHeight: 20 },
  previewWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  previewIcon: { marginRight: 3 },
  preview: { flex: 1, fontSize: 14.5, lineHeight: 19 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 8 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
});
