import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useMessaging } from '../lib/MessagingContext';
import { useAppTheme } from '../lib/theme';
import { CallsScreen } from './CallsScreen';
import { ChatsScreen } from './ChatsScreen';
import { UpdatesScreen } from './UpdatesScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused, badge }: { name: keyof typeof Ionicons.glyphMap; focused: boolean; badge?: number }) {
  const theme = useAppTheme();
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.iconPill, focused && { backgroundColor: theme.greenSoft }]}>
        <Ionicons name={name} size={22} color={focused ? theme.greenDark : theme.textSecondary} />
      </View>
      {badge ? <View style={[styles.badge, { backgroundColor: theme.green }]} /> : null}
    </View>
  );
}

export function MainTabs() {
  const theme = useAppTheme();
  const { conversations } = useMessaging();
  const unread = conversations.reduce((sum, item) => sum + item.unread, 0);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.greenDark,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: styles.label,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'web' ? 70 : 76,
          paddingTop: 7,
          paddingBottom: Platform.OS === 'web' ? 8 : 11,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} focused={focused} badge={unread} /> }} />
      <Tab.Screen name="Updates" component={UpdatesScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'aperture' : 'aperture-outline'} focused={focused} /> }} />
      <Tab.Screen name="Calls" component={CallsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'call' : 'call-outline'} focused={focused} /> }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 58, height: 29, alignItems: 'center', justifyContent: 'center' },
  iconPill: { width: 52, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 1, right: 8, width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: '#FFFFFF' },
  label: { fontSize: 11.5, fontWeight: '700', marginTop: 1 },
});
