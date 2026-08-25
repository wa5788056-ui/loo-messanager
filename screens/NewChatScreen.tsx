import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { useMessaging } from '../lib/MessagingContext';
import { CONTACTS } from '../lib/data';
import { useAppTheme } from '../lib/theme';
import { RootStackParamList } from '../lib/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewChat'>;

export function NewChatScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { startConversation } = useMessaging();
  const [query, setQuery] = useState('');
  const contacts = useMemo(() => CONTACTS.filter((contact) => contact.name.toLowerCase().includes(query.toLowerCase())), [query]);

  const select = (contactId: string) => {
    const conversationId = startConversation(contactId);
    navigation.replace('Chat', { conversationId });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}><Ionicons name="close" size={27} color={theme.text} /></Pressable>
        <View style={styles.headerText}><Text style={[styles.title, { color: theme.text }]}>New chat</Text><Text style={[styles.count, { color: theme.textSecondary }]}>{CONTACTS.length} contacts</Text></View>
        <Pressable onPress={() => Alert.alert('Invite a friend', 'An invite message is ready to share.')} style={styles.iconButton}><Ionicons name="person-add-outline" size={23} color={theme.text} /></Pressable>
      </View>
      <View style={[styles.search, { backgroundColor: theme.surfaceAlt }]}>
        <Ionicons name="search" size={19} color={theme.textSecondary} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Search name or number"
          placeholderTextColor={theme.textSecondary}
          returnKeyType="search"
          style={[styles.input, { color: theme.text }]}
        />
        {query ? <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={theme.textSecondary} /></Pressable> : null}
      </View>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={query ? null : (
          <View>
            <Pressable style={styles.actionRow} onPress={() => Alert.alert('New group', 'Select several contacts to create your new group.') }>
              <View style={[styles.actionIcon, { backgroundColor: theme.green }]}><Ionicons name="people" size={22} color="#FFFFFF" /></View>
              <Text style={[styles.actionText, { color: theme.text }]}>New group</Text>
            </Pressable>
            <Pressable style={styles.actionRow} onPress={() => Alert.alert('New contact', 'Contact form opened. Your address book remains private.') }>
              <View style={[styles.actionIcon, { backgroundColor: theme.green }]}><Ionicons name="person-add" size={22} color="#FFFFFF" /></View>
              <Text style={[styles.actionText, { color: theme.text }]}>New contact</Text>
            </Pressable>
            <Text style={[styles.label, { color: theme.greenDark }]}>CONTACTS ON LOOP</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable onPress={() => select(item.id)} style={({ pressed }) => [styles.contactRow, { backgroundColor: pressed ? theme.surfaceAlt : theme.background }]}>
            <Avatar contact={item} size={50} showOnline />
            <View style={[styles.contactDetails, { borderBottomColor: theme.border }]}>
              <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
              <Text numberOfLines={1} style={[styles.about, { color: theme.textSecondary }]}>{item.isGroup ? item.members : item.about}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="search-outline" size={35} color={theme.textSecondary} /><Text style={[styles.emptyTitle, { color: theme.text }]}>No contact found</Text><Text style={[styles.emptyBody, { color: theme.textSecondary }]}>Try checking the spelling.</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { height: 62, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  iconButton: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, marginLeft: 4 },
  title: { fontSize: 20, fontWeight: '800' },
  count: { fontSize: 11.5, marginTop: 2 },
  search: { marginHorizontal: 18, marginBottom: 9, height: 45, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 9 },
  input: { flex: 1, fontSize: 15, paddingVertical: 8 },
  list: { paddingBottom: 30 },
  actionRow: { height: 65, paddingHorizontal: 19, flexDirection: 'row', alignItems: 'center', gap: 15 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 11.5, fontWeight: '800', letterSpacing: 0.7, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  contactRow: { minHeight: 70, paddingLeft: 19, flexDirection: 'row', alignItems: 'center', gap: 14 },
  contactDetails: { flex: 1, minHeight: 70, borderBottomWidth: StyleSheet.hairlineWidth, justifyContent: 'center', paddingRight: 18 },
  name: { fontSize: 16, fontWeight: '700' },
  about: { fontSize: 13.5, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 12 },
  emptyBody: { fontSize: 13.5, marginTop: 4 },
});
