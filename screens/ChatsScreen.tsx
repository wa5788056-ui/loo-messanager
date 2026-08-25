import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatRow } from '../components/ChatRow';
import { FloatingButton } from '../components/FloatingButton';
import { ListSkeleton } from '../components/ListSkeleton';
import { ScreenHeader } from '../components/ScreenHeader';
import { useMessaging } from '../lib/MessagingContext';
import { getContact } from '../lib/data';
import { useAppTheme } from '../lib/theme';
import { RootStackParamList } from '../lib/types';

type Filter = 'All' | 'Unread' | 'Favorites' | 'Groups';

export function ChatsScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { conversations, hydrated, togglePin } = useMessaging();
  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const data = useMemo(() => conversations
    .filter((conversation) => {
      const contact = getContact(conversation.contactId);
      const matchesSearch = !query.trim() || contact?.name.toLowerCase().includes(query.toLowerCase()) || conversation.lastMessage.toLowerCase().includes(query.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === 'Unread') return conversation.unread > 0;
      if (filter === 'Favorites') return conversation.favorite;
      if (filter === 'Groups') return contact?.isGroup;
      return true;
    })
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.lastMessageAt - a.lastMessageAt), [conversations, filter, query]);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScreenHeader
        title="Loop"
        actions={[
          { icon: 'camera-outline', label: 'Open camera', onPress: () => Alert.alert('Camera', 'Camera is ready for a new photo or video.') },
          { icon: searching ? 'close' : 'search', label: 'Search chats', onPress: () => { setSearching((value) => !value); setQuery(''); } },
          { icon: 'ellipsis-vertical', label: 'More options', onPress: () => Alert.alert('Chat options', 'Create a group, manage starred messages, or open settings.', [{ text: 'Done' }]) },
        ]}
      />
      {searching ? (
        <View style={[styles.searchBox, { backgroundColor: theme.surfaceAlt }]}>
          <Ionicons name="search" size={19} color={theme.textSecondary} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search people and messages"
            placeholderTextColor={theme.textSecondary}
            returnKeyType="search"
            style={[styles.searchInput, { color: theme.text }]}
          />
          {query ? <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={19} color={theme.textSecondary} /></Pressable> : null}
        </View>
      ) : null}
      <View style={styles.filters}>
        {(['All', 'Unread', 'Favorites', 'Groups'] as Filter[]).map((item) => {
          const active = filter === item;
          return (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[styles.chip, { backgroundColor: active ? theme.greenSoft : theme.surface, borderColor: active ? theme.greenSoft : theme.border }]}
            >
              <Text style={[styles.chipText, { color: active ? theme.greenDark : theme.textSecondary }]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
      {!hydrated ? <ListSkeleton /> : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.green} colors={[theme.green]} />}
          contentContainerStyle={[styles.listContent, data.length === 0 && styles.emptyContent]}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={data.length > 0 && filter === 'All' && !query ? (
            <Pressable
              style={({ pressed }) => [styles.archived, { backgroundColor: pressed ? theme.surfaceAlt : theme.background }]}
              onPress={() => Alert.alert('Archived chats', 'You have no archived conversations yet.')}
            >
              <Ionicons name="archive-outline" size={21} color={theme.greenDark} />
              <Text style={[styles.archivedText, { color: theme.text }]}>Archived</Text>
            </Pressable>
          ) : null}
          renderItem={({ item }) => {
            const contact = getContact(item.contactId);
            if (!contact) return null;
            return (
              <ChatRow
                conversation={item}
                contact={contact}
                onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
                onLongPress={() => Alert.alert(contact.name, item.pinned ? 'Remove this chat from pinned?' : 'Pin this chat to the top?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: item.pinned ? 'Unpin' : 'Pin', onPress: () => togglePin(item.id) },
                ])}
              />
            );
          }}
          ListEmptyComponent={(
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.greenSoft }]}><Ionicons name="chatbubbles-outline" size={34} color={theme.greenDark} /></View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No chats found</Text>
              <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>Try another filter or start a fresh conversation.</Text>
              <Pressable onPress={() => { setFilter('All'); setQuery(''); }}><Text style={[styles.reset, { color: theme.greenDark }]}>Show all chats</Text></Pressable>
            </View>
          )}
        />
      )}
      <FloatingButton icon="chatbubble-ellipses" label="New chat" onPress={() => navigation.navigate('NewChat')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchBox: { height: 46, marginHorizontal: 18, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, fontSize: 15.5, paddingVertical: 8 },
  filters: { flexDirection: 'row', paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10, gap: 8 },
  chip: { height: 34, borderRadius: 17, borderWidth: 1, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 13.5, fontWeight: '600' },
  listContent: { paddingBottom: 96 },
  archived: { height: 51, flexDirection: 'row', alignItems: 'center', gap: 25, paddingHorizontal: 35 },
  archivedText: { fontSize: 15, fontWeight: '700' },
  emptyContent: { flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 42, paddingBottom: 80 },
  emptyIcon: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 20, fontWeight: '800' },
  emptyBody: { marginTop: 7, textAlign: 'center', fontSize: 14.5, lineHeight: 21 },
  reset: { fontWeight: '700', marginTop: 18 },
});
