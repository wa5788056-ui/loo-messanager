import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../lib/theme';

type HeaderAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

export function ScreenHeader({ title, actions = [] }: { title: string; actions?: HeaderAction[] }) {
  const theme = useAppTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <View style={styles.actions}>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={action.onPress}
            style={({ pressed }) => [styles.button, { backgroundColor: pressed ? theme.surfaceAlt : 'transparent' }]}
          >
            <Ionicons name={action.icon} size={23} color={theme.text} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 58,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 27, lineHeight: 32, fontWeight: '800', letterSpacing: -0.7 },
  actions: { flexDirection: 'row', gap: 3 },
  button: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
