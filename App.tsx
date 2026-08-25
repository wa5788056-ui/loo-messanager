import 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MessagingProvider } from './lib/MessagingContext';
import { useAppTheme } from './lib/theme';
import { RootStackParamList } from './lib/types';
import { ChatScreen } from './screens/ChatScreen';
import { ContactInfoScreen } from './screens/ContactInfoScreen';
import { MainTabs } from './screens/MainTabs';
import { NewCallScreen } from './screens/NewCallScreen';
import { NewChatScreen } from './screens/NewChatScreen';
import { StatusViewerScreen } from './screens/StatusViewerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const theme = useAppTheme();
  const navigationTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.green,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.green,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={theme.statusBar} />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="NewChat" component={NewChatScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="NewCall" component={NewCallScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ContactInfo" component={ContactInfoScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="StatusViewer" component={StatusViewerScreen} options={{ presentation: 'fullScreenModal', animation: 'fade', contentStyle: { backgroundColor: '#111111' } }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font });
  if (!fontsLoaded) return <View />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MessagingProvider>
          <AppNavigator />
        </MessagingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
