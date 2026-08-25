import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { useMessaging } from '../lib/MessagingContext';
import { STATUSES, formatRelative, getContact } from '../lib/data';
import { RootStackParamList } from '../lib/types';

type Props = NativeStackScreenProps<RootStackParamList, 'StatusViewer'>;

export function StatusViewerScreen({ route, navigation }: Props) {
  const status = STATUSES.find((item) => item.id === route.params.statusId);
  const contact = status ? getContact(status.contactId) : undefined;
  const { startConversation, sendMessage } = useMessaging();
  const [reply, setReply] = useState('');
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 8000 });
    const timer = setTimeout(() => navigation.goBack(), 8500);
    return () => clearTimeout(timer);
  }, [navigation, progress]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  if (!status || !contact) return null;

  const submit = () => {
    if (!reply.trim()) return;
    const conversationId = startConversation(contact.id);
    sendMessage(conversationId, `Replied to status: ${reply}`);
    setReply('');
    Alert.alert('Reply sent', `Your private reply was sent to ${contact.name}.`, [{ text: 'Done', onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: status.background }]}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.progressTrack}><Animated.View style={[styles.progressFill, progressStyle]} /></View>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}><Ionicons name="chevron-back" size={28} color="#FFFFFF" /></Pressable>
          <Avatar contact={contact} size={39} />
          <View style={styles.identity}><Text style={styles.name}>{contact.name}</Text><Text style={styles.time}>{formatRelative(status.postedAt)} ago</Text></View>
          <Pressable onPress={() => Alert.alert('Status options', 'Mute this contact’s updates or report this status.')} style={styles.more}><Ionicons name="ellipsis-vertical" size={23} color="#FFFFFF" /></Pressable>
        </View>
        <View style={styles.visual}>
          <View style={styles.glow} />
          <Ionicons name={status.icon} size={102} color="#FFFFFF" />
          <Text style={styles.caption}>{status.caption}</Text>
          <Text style={styles.private}>Shared with contacts</Text>
        </View>
        <View style={styles.replyRow}>
          <View style={styles.inputWrap}>
            <Ionicons name="chatbubble-outline" size={19} color="#FFFFFF" />
            <TextInput value={reply} onChangeText={setReply} onSubmitEditing={submit} placeholder={`Reply to ${contact.name.split(' ')[0]}…`} placeholderTextColor="rgba(255,255,255,0.75)" returnKeyType="send" style={styles.input} />
          </View>
          {reply ? <Pressable onPress={submit} style={styles.send}><Ionicons name="send" size={21} color="#FFFFFF" /></Pressable> : null}
          <Pressable onPress={() => { const id = startConversation(contact.id); sendMessage(id, '❤️'); Alert.alert('Reaction sent', `You reacted to ${contact.name}’s status.`); }} style={styles.heart}><Ionicons name="heart-outline" size={25} color="#FFFFFF" /></Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  progressTrack: { height: 3, marginHorizontal: 10, marginTop: 5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  progressFill: { height: 3, backgroundColor: '#FFFFFF', borderRadius: 2 },
  header: { height: 62, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, gap: 10 },
  back: { width: 40, height: 50, alignItems: 'center', justifyContent: 'center' },
  identity: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  time: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  more: { width: 42, height: 48, alignItems: 'center', justifyContent: 'center' },
  visual: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 35, overflow: 'hidden' },
  glow: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255,255,255,0.09)' },
  caption: { color: '#FFFFFF', textAlign: 'center', fontSize: 25, lineHeight: 32, fontWeight: '800', marginTop: 34, letterSpacing: -0.4 },
  private: { color: 'rgba(255,255,255,0.7)', fontSize: 11.5, marginTop: 13 },
  replyRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  inputWrap: { flex: 1, height: 46, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(255,255,255,0.62)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 14.5 },
  heart: { width: 42, height: 46, alignItems: 'center', justifyContent: 'center' },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
});
