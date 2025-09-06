import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { sessionService } from '../lib/sessionService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize session service when app starts
    sessionService.initialize();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#000000' },
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#FFFFFF',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="verify" options={{ headerShown: false }} />
        <Stack.Screen name="biometric-setup" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen 
          name="search" 
          options={{ 
            headerShown: false,
            animation: 'none',
            presentation: 'transparentModal'
          }} 
        />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="receive-crypto" options={{ headerShown: false }} />
        <Stack.Screen name="receive-qr" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="send" options={{ headerShown: false }} />
        <Stack.Screen name="send-contact" options={{ headerShown: false }} />
        <Stack.Screen name="send-token" options={{ headerShown: false }} />
        <Stack.Screen name="send-review" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
