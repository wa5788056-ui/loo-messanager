import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Contact } from '../lib/types';
import { useAppTheme } from '../lib/theme';

type Props = {
  contact: Contact;
  size?: number;
  showOnline?: boolean;
  story?: 'unseen' | 'seen';
};

export function Avatar({ contact, size = 52, showOnline = false, story }: Props) {
  const theme = useAppTheme();
  const ring = story ? 3 : 0;
  const gap = story ? 3 : 0;
  return (
    <View style={[
      styles.ring,
      story && { borderColor: story === 'unseen' ? theme.green : theme.textSecondary, borderWidth: ring, padding: gap },
      { borderRadius: (size + ring * 2 + gap * 2) / 2 },
    ]}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: contact.color }]}>
        {contact.isGroup ? (
          <Ionicons name="people" size={size * 0.42} color="#FFFFFF" />
        ) : (
          <Text style={[styles.initials, { fontSize: size * 0.31 }]}>{contact.initials}</Text>
        )}
      </View>
      {showOnline && contact.online ? (
        <View style={[styles.online, { backgroundColor: theme.green, borderColor: theme.surface }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { alignSelf: 'center' },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.2 },
  online: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    right: 0,
    bottom: 1,
    borderWidth: 2.5,
  },
});
