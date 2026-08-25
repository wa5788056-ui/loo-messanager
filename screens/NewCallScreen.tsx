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

type Props = NativeStackScreenProps<RootStackParamList, 'NewCall'>;

export function NewCallScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { placeCall } = useMessaging();
  const [query, setQuery] = useState('');
  const contacts = useMemo(() => CONTACTS.filter((contact) => !contact.isGroup && (contact.name.toLowerCase().includes(query.toLowerCase()) || contact.phone.includes(query))), [query]);
  const call = (contactId: string, name: string, kind: 'audio' | 'video') => {
    placeCall(contactId, kind);
    Alert.alert(`${kind === 'video' ? 'Video' : 'Voice'} call`, `Calling ${name}…`, [{ text: 'End call', style: 'destructive', onPress: () => navigation.goBack() }]);
  };
  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}><Ionicons name="close" size={27} color={theme.text} /></Pressable>
        <View><Text style={[styles.title, { color: theme.text }]}>New call</Text><Text style={[styles.subtitle, { color: theme.textSecondary }]}>Choose a contact</Text></View>
      </View>
      <View style={[styles.search, { backgroundColor: theme.surfaceAlt }]}>
        <Ionicons name="search" size={19} color={theme.textSecondary} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search contacts" placeholderTextColor={theme.textSecondary} keyboardType="default" returnKeyType="search" style={[styles.input, { color: theme.text }]} />
      </View>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={!query ? (
          <Pressable style={styles.linkRow} onPress={() => Alert.alert('Call link created', 'Anyone with your private link can join the call.')}>
            <View style={[styles.linkIcon, { backgroundColor: theme.green }]}><Ionicons name="link" size={24} color="#FFFFFF" /></View>
            <View><Text style={[styles.linkTitle, { color: theme.text }]}>Create call link</Text><Text style={[styles.linkSubtitle, { color: theme.textSecondary }]}>Share a link for your call</Text></View>
          </Pressable>
        ) : null}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Avatar contact={item} size={50} />
            <View style={styles.person}><Text style={[styles.name, { color: theme.text }]}>{item.name}</Text><Text style={[styles.phone, { color: theme.textSecondary }]}>{item.phone}</Text></View>
            <Pressable accessibilityLabel={`Voice call ${item.name}`} onPress={() => call(item.id, item.name, 'audio')} style={styles.callButton}><Ionicons name="call-outline" size={22} color={theme.greenDark} /></Pressable>
            <Pressable accessibilityLabel={`Video call ${item.name}`} onPress={() => call(item.id, item.name, 'video')} style={styles.callButton}><Ionicons name="videocam-outline" size={23} color={theme.greenDark} /></Pressable>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyText, { color: theme.textSecondary }]}>No contacts match “{query}”</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { height: 62, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  back: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 11.5, marginTop: 2 },
  search: { marginHorizontal: 18, height: 45, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 9, marginBottom: 8 },
  input: { flex: 1, fontSize: 15 },
  list: { paddingBottom: 25 },
  linkRow: { height: 72, paddingHorizontal: 19, flexDirection: 'row', alignItems: 'center', gap: 14 },
  linkIcon: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  linkTitle: { fontSize: 15.5, fontWeight: '700' },
  linkSubtitle: { fontSize: 12.5, marginTop: 3 },
  row: { minHeight: 71, paddingHorizontal: 19, flexDirection: 'row', alignItems: 'center', gap: 12 },
  person: { flex: 1 },
  name: { fontSize: 15.5, fontWeight: '700' },
  phone: { fontSize: 12.5, marginTop: 4 },
  callButton: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  empty: { paddingTop: 90, alignItems: 'center' },
  emptyText: { fontSize: 14.5 },
});
