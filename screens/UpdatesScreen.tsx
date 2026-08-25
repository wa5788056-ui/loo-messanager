import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { FloatingButton } from '../components/FloatingButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { CONTACTS, STATUSES, formatRelative, getContact } from '../lib/data';
import { useAppTheme } from '../lib/theme';
import { RootStackParamList } from '../lib/types';

const channels = [
  { id: 'design', name: 'Good Design Daily', initials: 'GD', color: '#6457A6', followers: '428K', icon: 'color-palette' as const },
  { id: 'planet', name: 'Planet Positive', initials: 'PP', color: '#2C8B64', followers: '162K', icon: 'leaf' as const },
  { id: 'bites', name: 'Tiny Bites', initials: 'TB', color: '#D47A42', followers: '91K', icon: 'restaurant' as const },
];

export function UpdatesScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [following, setFollowing] = useState<string[]>(['design']);
  const [refreshing, setRefreshing] = useState(false);
  const [created, setCreated] = useState(false);
  const statusContacts = useMemo(() => STATUSES.map((status) => ({ status, contact: getContact(status.contactId) })).filter((item) => item.contact), []);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 750);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScreenHeader
        title="Updates"
        actions={[
          { icon: 'search', label: 'Search updates', onPress: () => Alert.alert('Search updates', 'You are all caught up with the channels you follow.') },
          { icon: 'ellipsis-vertical', label: 'Update options', onPress: () => Alert.alert('Update options', 'Manage status privacy and followed channels.') },
        ]}
      />
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.green} colors={[theme.green]} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={(
          <View>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Status</Text>
              <Pressable onPress={() => Alert.alert('Status privacy', 'Your status is shared with your contacts.')}><Text style={[styles.link, { color: theme.greenDark }]}>Privacy</Text></Pressable>
            </View>
            <FlatList
              data={[{ status: null, contact: null }, ...statusContacts]}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => item.status?.id ?? `own-${index}`}
              contentContainerStyle={styles.stories}
              renderItem={({ item, index }) => {
                if (index === 0) {
                  return (
                    <Pressable
                      style={styles.story}
                      onPress={() => {
                        setCreated(true);
                        Alert.alert('Status shared', 'Your text status is now visible to your contacts.');
                      }}
                    >
                      <View>
                        <Avatar contact={{ ...CONTACTS[0], name: 'You', initials: 'YO', color: '#6F8D82' }} size={61} story={created ? 'unseen' : undefined} />
                        <View style={[styles.addBadge, { backgroundColor: theme.green, borderColor: theme.background }]}><Ionicons name={created ? 'checkmark' : 'add'} size={15} color="#FFFFFF" /></View>
                      </View>
                      <Text numberOfLines={1} style={[styles.storyName, { color: theme.text }]}>{created ? 'Your status' : 'Add status'}</Text>
                    </Pressable>
                  );
                }
                if (!item.contact || !item.status) return null;
                return (
                  <Pressable style={styles.story} onPress={() => navigation.navigate('StatusViewer', { statusId: item.status!.id })}>
                    <Avatar contact={item.contact} size={61} story={item.status.seen ? 'seen' : 'unseen'} />
                    <Text numberOfLines={1} style={[styles.storyName, { color: theme.text }]}>{item.contact.name.split(' ')[0]}</Text>
                    <Text style={[styles.storyTime, { color: theme.textSecondary }]}>{formatRelative(item.status.postedAt)}</Text>
                  </Pressable>
                );
              }}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.channelsHeading}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Channels</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Ideas and updates you’ll love</Text>
              </View>
              <Pressable onPress={() => Alert.alert('Explore channels', 'More recommendations are coming soon.')}><Text style={[styles.link, { color: theme.greenDark }]}>Explore</Text></Pressable>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const isFollowing = following.includes(item.id);
          return (
            <View style={[styles.channelCard, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadow }]}>
              <View style={[styles.channelAvatar, { backgroundColor: item.color }]}><Ionicons name={item.icon} size={23} color="#FFFFFF" /></View>
              <View style={styles.channelText}>
                <View style={styles.verifiedLine}>
                  <Text numberOfLines={1} style={[styles.channelName, { color: theme.text }]}>{item.name}</Text>
                  <Ionicons name="checkmark-circle" size={15} color={theme.green} />
                </View>
                <Text style={[styles.followers, { color: theme.textSecondary }]}>{item.followers} followers</Text>
              </View>
              <Pressable
                onPress={() => setFollowing((current) => isFollowing ? current.filter((id) => id !== item.id) : [...current, item.id])}
                style={[styles.followButton, { backgroundColor: isFollowing ? theme.surfaceAlt : theme.greenSoft }]}
              >
                <Text style={[styles.followText, { color: isFollowing ? theme.textSecondary : theme.greenDark }]}>{isFollowing ? 'Following' : 'Follow'}</Text>
              </Pressable>
            </View>
          );
        }}
        ListFooterComponent={<Text style={[styles.footer, { color: theme.textSecondary }]}>End-to-end private status replies</Text>}
      />
      <FloatingButton icon="pencil" label="Create status" onPress={() => { setCreated(true); Alert.alert('Status shared', 'Your text status is now visible for 24 hours.'); }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 104 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 9, paddingBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  link: { fontSize: 14, fontWeight: '700' },
  stories: { paddingHorizontal: 16, gap: 16, paddingBottom: 20 },
  story: { width: 72, alignItems: 'center' },
  storyName: { marginTop: 8, width: 72, textAlign: 'center', fontSize: 12.5, fontWeight: '600' },
  storyTime: { marginTop: 2, fontSize: 10.5 },
  addBadge: { position: 'absolute', right: 2, bottom: 0, width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 9, opacity: 0.55 },
  channelsHeading: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtitle: { fontSize: 13, marginTop: 3 },
  channelCard: { marginHorizontal: 18, marginBottom: 10, borderRadius: 18, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 1 },
  channelAvatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  channelText: { flex: 1, marginLeft: 12 },
  verifiedLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  channelName: { maxWidth: '84%', fontSize: 14.5, fontWeight: '700' },
  followers: { fontSize: 11.5, marginTop: 4 },
  followButton: { height: 34, borderRadius: 17, paddingHorizontal: 13, justifyContent: 'center' },
  followText: { fontSize: 12.5, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 11.5, marginTop: 12 },
});
