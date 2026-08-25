import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { useMessaging } from '../lib/MessagingContext';
import { getContact } from '../lib/data';
import { useAppTheme } from '../lib/theme';
import { RootStackParamList } from '../lib/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactInfo'>;

export function ContactInfoScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const { conversations, toggleMute, togglePin, placeCall } = useMessaging();
  const contact = getContact(route.params.contactId);
  const conversation = conversations.find((item) => item.contactId === route.params.contactId);

  if (!contact) return null;

  const options = [
    { id: 'mute', icon: conversation?.muted ? 'notifications' : 'notifications-off-outline', title: conversation?.muted ? 'Unmute notifications' : 'Mute notifications', detail: conversation?.muted ? 'Notifications are currently muted' : 'Receive message notifications', action: () => conversation && toggleMute(conversation.id) },
    { id: 'pin', icon: conversation?.pinned ? 'pin-outline' : 'pin', title: conversation?.pinned ? 'Unpin chat' : 'Pin chat', detail: 'Keep important chats easy to reach', action: () => conversation && togglePin(conversation.id) },
    { id: 'star', icon: 'star-outline', title: 'Starred messages', detail: 'No starred messages yet', action: () => Alert.alert('Starred messages', 'Long-press any message to star it.') },
    { id: 'encryption', icon: 'lock-closed-outline', title: 'Encryption', detail: 'Messages and calls are secured', action: () => Alert.alert('End-to-end encryption', 'Messages and calls stay between you and this contact.') },
    { id: 'disappear', icon: 'timer-outline', title: 'Disappearing messages', detail: 'Off', action: () => Alert.alert('Disappearing messages', 'Choose a timer for new messages.', [{ text: '24 hours' }, { text: '7 days' }, { text: 'Cancel', style: 'cancel' }]) },
  ] as const;

  const call = (kind: 'audio' | 'video') => {
    placeCall(contact.id, kind);
    Alert.alert(`${kind === 'video' ? 'Video' : 'Voice'} call`, `Calling ${contact.name}…`, [{ text: 'End call', style: 'destructive' }]);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="chevron-back" size={28} color={theme.text} /></Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Contact info</Text>
        <Pressable onPress={() => Alert.alert('Edit contact', 'Contact details are ready to edit.')} style={styles.headerButton}><Ionicons name="create-outline" size={23} color={theme.text} /></Pressable>
      </View>
      <FlatList
        data={options}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={(
          <View>
            <View style={styles.identity}>
              <Avatar contact={contact} size={94} showOnline />
              <Text style={[styles.name, { color: theme.text }]}>{contact.name}</Text>
              <Text style={[styles.phone, { color: theme.textSecondary }]}>{contact.isGroup ? contact.members : contact.phone}</Text>
              <Text style={[styles.about, { color: theme.textSecondary }]}>{contact.about}</Text>
              <View style={styles.quickActions}>
                {[
                  { label: 'Message', icon: 'chatbubble-outline' as const, action: () => navigation.goBack() },
                  { label: 'Audio', icon: 'call-outline' as const, action: () => call('audio') },
                  { label: 'Video', icon: 'videocam-outline' as const, action: () => call('video') },
                  { label: 'Search', icon: 'search' as const, action: () => Alert.alert('Search chat', 'Enter a word from the conversation to find it.') },
                ].map((item) => (
                  <Pressable key={item.label} onPress={item.action} style={[styles.quick, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Ionicons name={item.icon} size={22} color={theme.greenDark} />
                    <Text style={[styles.quickLabel, { color: theme.greenDark }]}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.mediaHeader}><Text style={[styles.mediaTitle, { color: theme.text }]}>Media, links and docs</Text><Pressable onPress={() => Alert.alert('Shared media', 'No more shared media to show.')} style={styles.mediaAll}><Text style={[styles.mediaCount, { color: theme.textSecondary }]}>12</Text><Ionicons name="chevron-forward" size={17} color={theme.textSecondary} /></Pressable></View>
              <View style={styles.mediaGrid}>
                {[['image-outline', '#7B9B8D'], ['document-text-outline', '#6E7FA8'], ['link-outline', '#A77E69']].map(([icon, color], index) => (
                  <Pressable key={index} onPress={() => Alert.alert('Shared item', index === 1 ? 'Design brief.pdf' : 'Shared conversation item')} style={[styles.mediaTile, { backgroundColor: color }]}><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={25} color="#FFFFFF" /></Pressable>
                ))}
              </View>
            </View>
            <Text style={[styles.optionsLabel, { color: theme.textSecondary }]}>CHAT SETTINGS</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable onPress={item.action} style={({ pressed }) => [styles.option, { backgroundColor: pressed ? theme.surfaceAlt : theme.surface, borderBottomColor: theme.border }]}>
            <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color={theme.textSecondary} />
            <View style={styles.optionText}><Text style={[styles.optionTitle, { color: theme.text }]}>{item.title}</Text><Text style={[styles.optionDetail, { color: theme.textSecondary }]}>{item.detail}</Text></View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </Pressable>
        )}
        ListFooterComponent={(
          <View style={[styles.dangerSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Pressable style={styles.dangerRow} onPress={() => Alert.alert(`Block ${contact.name}?`, 'They will no longer be able to call or message you.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Block', style: 'destructive' }])}><Ionicons name="ban-outline" size={22} color={theme.danger} /><Text style={[styles.dangerText, { color: theme.danger }]}>Block {contact.name.split(' ')[0]}</Text></Pressable>
            <Pressable style={styles.dangerRow} onPress={() => Alert.alert('Report contact?', 'The most recent messages will be sent for review.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Report', style: 'destructive' }])}><Ionicons name="thumbs-down-outline" size={22} color={theme.danger} /><Text style={[styles.dangerText, { color: theme.danger }]}>Report contact</Text></Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6 },
  headerButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { paddingBottom: 30 },
  identity: { alignItems: 'center', paddingTop: 13, paddingHorizontal: 14 },
  name: { fontSize: 24, fontWeight: '800', marginTop: 13 },
  phone: { fontSize: 14, marginTop: 4 },
  about: { fontSize: 13, marginTop: 4 },
  quickActions: { width: '100%', flexDirection: 'row', gap: 7, marginTop: 21, marginBottom: 18 },
  quick: { flex: 1, minHeight: 62, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  quickLabel: { fontSize: 10.5, fontWeight: '700' },
  section: { marginTop: 4, padding: 16, borderTopWidth: 1, borderBottomWidth: 1 },
  mediaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  mediaTitle: { fontSize: 14.5, fontWeight: '700' },
  mediaAll: { flexDirection: 'row', alignItems: 'center' },
  mediaCount: { fontSize: 13 },
  mediaGrid: { flexDirection: 'row', gap: 8 },
  mediaTile: { flex: 1, aspectRatio: 1.45, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  optionsLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.7, marginTop: 20, marginLeft: 18, marginBottom: 7 },
  option: { minHeight: 65, borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 14.5, fontWeight: '600' },
  optionDetail: { fontSize: 11.5, marginTop: 3 },
  dangerSection: { marginTop: 17, borderTopWidth: 1, borderBottomWidth: 1 },
  dangerRow: { minHeight: 59, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  dangerText: { fontSize: 15, fontWeight: '600' },
});
