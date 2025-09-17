import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface AppNavigatorProps {
  children: React.ReactNode;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ children }) => {
  const { user, isLoading, isFirstTime } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // If it's the first time, show welcome screen
  if (isFirstTime) {
    return <>{children}</>;
  }

  // If user is not authenticated, show welcome screen
  if (!user) {
    return <>{children}</>;
  }

  // If user is authenticated and has completed onboarding, show main app
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
