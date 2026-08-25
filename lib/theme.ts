import { useColorScheme } from 'react-native';

const light = {
  isDark: false,
  background: '#F5F8F6',
  surface: '#FFFFFF',
  surfaceAlt: '#EDF3EF',
  text: '#102018',
  textSecondary: '#68766F',
  border: '#E4EAE6',
  green: '#18A874',
  greenDark: '#087A56',
  greenSoft: '#DDF7EC',
  bubbleIn: '#FFFFFF',
  bubbleOut: '#D9FDD3',
  danger: '#E05260',
  shadow: '#102018',
  statusBar: 'dark' as const,
};

const dark = {
  isDark: true,
  background: '#09130F',
  surface: '#111D18',
  surfaceAlt: '#1A2923',
  text: '#F0F6F3',
  textSecondary: '#9EADA6',
  border: '#24352E',
  green: '#28C68A',
  greenDark: '#13A16F',
  greenSoft: '#123B2D',
  bubbleIn: '#18251F',
  bubbleOut: '#145C45',
  danger: '#FF6B78',
  shadow: '#000000',
  statusBar: 'light' as const,
};

export type AppTheme = Omit<typeof light, 'statusBar'> & { statusBar: 'light' | 'dark' };

export function useAppTheme(): AppTheme {
  return useColorScheme() === 'dark' ? dark : light;
}

export { light, dark };
