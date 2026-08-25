import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { FloatingButton } from '../components/FloatingButton';
import { ListSkeleton } from '../components/ListSkeleton';
import { ScreenHeader } from '../components/ScreenHeader';
import { useMessaging } from '../lib/MessagingContext';
import { formatCallTime, getContact } from '../lib/data';
import { useAppTheme } from '../lib/theme';
import { RootStackParamList } from '../lib/types';

export function CallsScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { calls, hydrated, placeCall } = useMessaging();
  const [refreshing, setRefreshing] = useState(false);
  const data = useMemo(() => [...calls].sort((a, b) => b.at - a.at), [calls]);

  const startCall = (contactId: string, kind: 'audio' | 'video') => {
    const contact = getContact(contactId);
    placeCall(contactId, kind);
    Alert.alert(`${kind === 'video' ? 'Video' : 'Voice'} call`, `Calling ${contact?.name ?? 'contact'}…`, [{ text: 'End call', style: 'destructive' }]);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Calls" actions={[
        { icon: 'search', label: 'Search calls', onPress: () => Alert.alert('Search calls', 'Use the new call button to find any contact.') },
        { icon: 'ellipsis-vertical', label: 'Call options', onPress: () => Alert.alert('Call settings', 'Low data mode is currently off.') },
      ]} />
      <Pressable
        onPress={() => Alert.alert('Create call link', 'Your private Loop call link is ready to share.', [{ text: 'Copy link' }, { text: 'Done' }])}
        style={({ pressed }) => [styles.callLink, { backgroundColor: pressed ? theme.surfaceAlt : theme.background }]}
      >
        <View style={[styles.linkIcon, { backgroundColor: theme.green }]}><Ionicons name="link" size={25} color="#FFFFFF" /></View>
        <View style={styles.linkText}>
          <Text style={[styles.linkTitle, { color: theme.text }]}>Create call link</Text>
          <Text style={[styles.linkSubtitle, { color: theme.textSecondary }]}>Share a link for your Loop call</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      </Pressable>
      <Text style={[styles.recent, { color: theme.text }]}>Recent</Text>
      {!hydrated ? <ListSkeleton /> : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }} tintColor={theme.green} colors={[theme.green]} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const contact = getContact(item.contactId);
            if (!contact) return null;
            return (
              <Pressable
                onPress={() => startCall(item.contactId, item.kind)}
                style={({ pressed }) => [styles.row, { backgroundColor: pressed ? theme.surfaceAlt : theme.background }]}
              >
                <Avatar contact={contact} size={52} />
                <View style={styles.details}>
                  <Text style={[styles.name, { color: item.missed ? theme.danger : theme.text }]}>{contact.name}</Text>
                  <View style={styles.callMeta}>
                    <Ionicons
                      name={item.direction === 'outgoing' ? 'arrow-up' : 'arrow-down'}
                      size={14}
                      color={item.missed ? theme.danger : theme.green}
                      style={{ transform: [{ rotate: '35deg' }] }}
                    />
                    <Text style={[styles.time, { color: theme.textSecondary }]}>{formatCallTime(item.at)}</Text>
                  </View>
                </View>
                <Pressable accessibilityLabel={`Start ${item.kind} call`} onPress={() => startCall(item.contactId, item.kind)} style={styles.callButton}>
                  <Ionicons name={item.kind === 'video' ? 'videocam-outline' : 'call-outline'} size={23} color={theme.greenDark} />
                </Pressable>
              </Pressable>
            );
          }}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="call-outline" size={38} color={theme.textSecondary} /><Text style={[styles.emptyText, { color: theme.textSecondary }]}>No recent calls</Text></View>}
        />
      )}
      <FloatingButton icon="call" label="New call" onPress={() => navigation.navigate('NewCall')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  callLink: { flexDirection: 'row', alignItems: 'center', minHeight: 75, paddingHorizontal: 19, gap: 14 },
  linkIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  linkText: { flex: 1 },
  linkTitle: { fontSize: 16, fontWeight: '700' },
  linkSubtitle: { fontSize: 13, marginTop: 4 },
  recent: { fontSize: 16, fontWeight: '800', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  list: { paddingBottom: 100 },
  row: { minHeight: 74, paddingHorizontal: 19, flexDirection: 'row', alignItems: 'center', gap: 14 },
  details: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  callMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 4 },
  time: { fontSize: 12.5 },
  callButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 70, gap: 10 },
  emptyText: { fontSize: 15 },
});
