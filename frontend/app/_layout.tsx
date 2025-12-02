// app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      
      <Stack
        screenOptions={{
          headerShown: false,     // 全局关 header
        }}
      >
        {/* 全局单页页面 */}
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="nickname" />
        <Stack.Screen name="promptLibrary" />
        <Stack.Screen name="write" />

        {/* ⭐ tabs 作为整个系统的子路由 */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }}  // 🔥 关键：不要替 tabs 添加 header
        />

        <Stack.Screen 
          name="modal" 
          options={{ presentation: 'modal' }} 
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
