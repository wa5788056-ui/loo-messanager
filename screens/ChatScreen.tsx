import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { useMessaging } from '../lib/MessagingContext';
import { getContact } from '../lib/data';
import { useAppTheme } from '../lib/theme';
import { Message, RootStackParamList } from '../lib/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const attachmentOptions = [
  { label: 'Camera', icon: 'camera' as const, color: '#D95A79', message: '📷 Photo shared' },
  { label: 'Gallery', icon: 'images' as const, color: '#8665D7', message: '🖼️ Photo shared' },
  { label: 'Document', icon: 'document-text' as const, color: '#5B83D6', message: '📄 Project notes.pdf' },
  { label: 'Location', icon: 'location' as const, color: '#49A76B', message: '📍 Current location shared' },
  { label: 'Contact', icon: 'person' as const, color: '#4A9BB0', message: '👤 Contact shared' },
  { label: 'Poll', icon: 'stats-chart' as const, color: '#E19A43', message: '📊 Poll: What works best?' },
];

function MessageBubble({ message }: { message: Message }) {
  const theme = useAppTheme();
  const time = new Date(message.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return (
    <Animated.View entering={FadeInUp.duration(260)} style={[styles.messageLine, message.outgoing ? styles.outgoingLine : styles.incomingLine]}>
      <View style={[
        styles.bubble,
        { backgroundColor: message.outgoing ? theme.bubbleOut : theme.bubbleIn, shadowColor: theme.shadow },
        message.outgoing ? styles.outgoingBubble : styles.incomingBubble,
      ]}>
        <Text style={[styles.messageText, { color: theme.text }]}>{message.text}</Text>
        <View style={styles.messageMeta}>
          <Text style={[styles.messageTime, { color: theme.textSecondary }]}>{time}</Text>
          {message.outgoing ? <Ionicons name={message.status === 'sent' ? 'checkmark' : 'checkmark-done'} size={15} color={message.status === 'read' ? '#28A7CB' : theme.textSecondary} /> : null}
        </View>
      </View>
    </Animated.View>
  );
}

export function ChatScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const { conversations, messages, sendMessage, markRead, typingConversationId, placeCall } = useMessaging();
  const conversation = conversations.find((item) => item.id === route.params.conversationId);
  const contact = conversation ? getContact(conversation.contactId) : undefined;
  const [text, setText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const chatMessages = useMemo(() => messages.filter((item) => item.conversationId === route.params.conversationId).sort((a, b) => a.sentAt - b.sentAt), [messages, route.params.conversationId]);
  const isTyping = typingConversationId === route.params.conversationId;

  useEffect(() => {
    markRead(route.params.conversationId);
  }, [markRead, route.params.conversationId]);

  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(timer);
  }, [chatMessages.length, isTyping]);

  if (!conversation || !contact) {
    return (
      <SafeAreaView style={[styles.missing, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={42} color={theme.textSecondary} />
        <Text style={[styles.missingText, { color: theme.text }]}>Conversation unavailable</Text>
        <Pressable onPress={() => navigation.goBack()}><Text style={{ color: theme.greenDark, fontWeight: '700' }}>Go back</Text></Pressable>
      </SafeAreaView>
    );
  }

  const startCall = (kind: 'audio' | 'video') => {
    placeCall(contact.id, kind);
    Alert.alert(`${kind === 'video' ? 'Video' : 'Voice'} call`, `Calling ${contact.name}…`, [{ text: 'End call', style: 'destructive' }]);
  };

  const submit = (customText?: string) => {
    const value = customText ?? text;
    if (!value.trim()) return;
    sendMessage(conversation.id, value);
    setText('');
    setShowAttachments(false);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}><Ionicons name="chevron-back" size={28} color={theme.text} /></Pressable>
          <Pressable style={styles.profile} onPress={() => navigation.navigate('ContactInfo', { contactId: contact.id })}>
            <Avatar contact={contact} size={39} showOnline />
            <View style={styles.profileText}>
              <Text numberOfLines={1} style={[styles.contactName, { color: theme.text }]}>{contact.name}</Text>
              <Text numberOfLines={1} style={[styles.presence, { color: contact.online ? theme.greenDark : theme.textSecondary }]}>{contact.online ? 'online' : contact.isGroup ? contact.members : 'last seen recently'}</Text>
            </View>
          </Pressable>
          <Pressable accessibilityLabel="Video call" onPress={() => startCall('video')} style={styles.headerButton}><Ionicons name="videocam-outline" size={24} color={theme.text} /></Pressable>
          <Pressable accessibilityLabel="Voice call" onPress={() => startCall('audio')} style={styles.headerButton}><Ionicons name="call-outline" size={22} color={theme.text} /></Pressable>
          <Pressable accessibilityLabel="More" onPress={() => Alert.alert(contact.name, 'Search, view media, or clear this conversation.')} style={styles.headerButtonSmall}><Ionicons name="ellipsis-vertical" size={21} color={theme.text} /></Pressable>
        </View>

        <View style={[styles.chatArea, { backgroundColor: theme.isDark ? '#0C1712' : '#EEF4EF' }]}>
          <View pointerEvents="none" style={styles.pattern}>
            {Array.from({ length: 15 }).map((_, index) => <Ionicons key={index} name={index % 3 === 0 ? 'chatbubble-outline' : index % 3 === 1 ? 'happy-outline' : 'leaf-outline'} size={20} color={theme.isDark ? '#173026' : '#D8E5DC'} style={{ transform: [{ rotate: `${(index % 5) * 18}deg` }] }} />)}
          </View>
          <FlatList
            ref={listRef}
            data={chatMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={[styles.messages, chatMessages.length === 0 && styles.emptyMessages]}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListHeaderComponent={chatMessages.length > 0 ? (
              <View style={[styles.dayPill, { backgroundColor: theme.surface }]}><Text style={[styles.dayText, { color: theme.textSecondary }]}>TODAY</Text></View>
            ) : null}
            ListEmptyComponent={(
              <View style={[styles.encryptionCard, { backgroundColor: theme.greenSoft }]}>
                <Ionicons name="lock-closed" size={15} color={theme.greenDark} />
                <Text style={[styles.encryptionText, { color: theme.greenDark }]}>Messages are end-to-end encrypted. Say hello to {contact.name.split(' ')[0]}.</Text>
              </View>
            )}
            ListFooterComponent={isTyping ? (
              <Animated.View entering={FadeInDown} style={[styles.typingBubble, { backgroundColor: theme.bubbleIn }]}>
                <View style={[styles.dot, { backgroundColor: theme.textSecondary }]} /><View style={[styles.dot, { backgroundColor: theme.textSecondary }]} /><View style={[styles.dot, { backgroundColor: theme.textSecondary }]} />
              </Animated.View>
            ) : null}
          />
        </View>

        {showAttachments ? (
          <Animated.View entering={FadeInDown.duration(200)} style={[styles.attachPanel, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            {attachmentOptions.map((item) => (
              <Pressable key={item.label} style={styles.attachItem} onPress={() => submit(item.message)}>
                <View style={[styles.attachIcon, { backgroundColor: item.color }]}><Ionicons name={item.icon} size={22} color="#FFFFFF" /></View>
                <Text style={[styles.attachLabel, { color: theme.textSecondary }]}>{item.label}</Text>
              </Pressable>
            ))}
          </Animated.View>
        ) : null}

        <View style={[styles.composerRow, { backgroundColor: theme.background }]}>
          <View style={[styles.composer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Pressable accessibilityLabel="Emoji" onPress={() => setText((current) => `${current}😊`)} style={styles.composerButton}><Ionicons name="happy-outline" size={24} color={theme.textSecondary} /></Pressable>
            <TextInput
              value={text}
              onChangeText={setText}
              onFocus={() => setShowAttachments(false)}
              placeholder="Message"
              placeholderTextColor={theme.textSecondary}
              multiline
              returnKeyType="default"
              style={[styles.composerInput, { color: theme.text }]}
            />
            <Pressable accessibilityLabel="Attach" onPress={() => setShowAttachments((value) => !value)} style={styles.composerButton}><Ionicons name={showAttachments ? 'close' : 'attach'} size={24} color={theme.textSecondary} /></Pressable>
            {!text ? <Pressable accessibilityLabel="Camera" onPress={() => submit('📷 Photo shared')} style={styles.composerButton}><Ionicons name="camera-outline" size={23} color={theme.textSecondary} /></Pressable> : null}
          </View>
          <Pressable accessibilityLabel={text ? 'Send message' : 'Send voice message'} onPress={() => submit(text ? undefined : '🎤 Voice message · 0:04')} style={[styles.sendButton, { backgroundColor: theme.green }]}>
            <Ionicons name={text ? 'send' : 'mic'} size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  missingText: { fontSize: 18, fontWeight: '700' },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingRight: 6 },
  back: { width: 42, height: 50, alignItems: 'center', justifyContent: 'center' },
  profile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
  profileText: { flex: 1, minWidth: 0 },
  contactName: { fontSize: 15.5, fontWeight: '700' },
  presence: { fontSize: 11, marginTop: 2 },
  headerButton: { width: 42, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerButtonSmall: { width: 31, height: 48, alignItems: 'center', justifyContent: 'center' },
  chatArea: { flex: 1, overflow: 'hidden' },
  pattern: { position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', alignContent: 'space-around', opacity: 0.65 },
  messages: { paddingHorizontal: 11, paddingTop: 10, paddingBottom: 12 },
  emptyMessages: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  dayPill: { alignSelf: 'center', paddingHorizontal: 12, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  dayText: { fontSize: 10.5, fontWeight: '700' },
  messageLine: { width: '100%', marginBottom: 4 },
  outgoingLine: { alignItems: 'flex-end' },
  incomingLine: { alignItems: 'flex-start' },
  bubble: { maxWidth: '82%', minWidth: 78, paddingHorizontal: 10, paddingTop: 7, paddingBottom: 5, shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 1, elevation: 1 },
  incomingBubble: { borderRadius: 14, borderTopLeftRadius: 4 },
  outgoingBubble: { borderRadius: 14, borderTopRightRadius: 4 },
  messageText: { fontSize: 15.5, lineHeight: 20.5 },
  messageMeta: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 12, marginTop: 2 },
  messageTime: { fontSize: 9.5 },
  encryptionCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, maxWidth: 280, padding: 12, borderRadius: 12 },
  encryptionText: { flex: 1, textAlign: 'center', fontSize: 11.5, lineHeight: 16 },
  typingBubble: { flexDirection: 'row', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 14, height: 33, borderRadius: 14, borderTopLeftRadius: 4, alignItems: 'center', marginTop: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, opacity: 0.7 },
  attachPanel: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 19, paddingTop: 15, paddingBottom: 10, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  attachItem: { width: '31%', alignItems: 'center', marginBottom: 12 },
  attachIcon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  attachLabel: { fontSize: 11.5 },
  composerRow: { minHeight: 62, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 8, paddingVertical: 7, gap: 7 },
  composer: { flex: 1, minHeight: 47, maxHeight: 120, borderRadius: 23.5, borderWidth: 1, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 3 },
  composerButton: { width: 38, height: 45, alignItems: 'center', justifyContent: 'center' },
  composerInput: { flex: 1, minHeight: 45, maxHeight: 110, paddingTop: 11, paddingBottom: 10, fontSize: 15.5 },
  sendButton: { width: 47, height: 47, borderRadius: 23.5, alignItems: 'center', justifyContent: 'center' },
});
