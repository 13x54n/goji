import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { sessionService } from '../lib/sessionService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize session service when app starts
    sessionService.initialize();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
      <Stack.Screen name="biometric-setup" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="quick-login" options={{ headerShown: false }} />
      <Stack.Screen name="password-setup" options={{ headerShown: false }} />
      <Stack.Screen 
        name="search" 
        options={{ 
          headerShown: false,
          animation: 'none',
          presentation: 'transparentModal'
        }} 
      />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
    </Stack>
  );
}
