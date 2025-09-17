import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  isNewUser: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  isFirstTime: boolean;
  setFirstTimeCompleted: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    initializeAuth();
    checkFirstTime();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check AsyncStorage for persisted user
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser && !user) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFirstTime = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      setIsFirstTime(hasCompletedOnboarding !== 'true');
    } catch (error) {
      console.error('Error checking first time:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes, create a mock user
      // In production, you would use real Google OAuth
      const mockUser: User = {
        id: 'google_' + Date.now(),
        name: 'Demo User',
        email: 'demo@example.com',
        profilePicture: undefined,
        isNewUser: true,
      };
      
      setUser(mockUser);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes, create a mock user
      // In production, you would use real Apple Sign-In
      const mockUser: User = {
        id: 'apple_' + Date.now(),
        name: 'Apple User',
        email: 'apple@example.com',
        isNewUser: true,
      };
      
      setUser(mockUser);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Apple Sign-In error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('hasCompletedOnboarding');
      setUser(null);
      setIsFirstTime(true);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setFirstTimeCompleted = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setIsFirstTime(false);
    } catch (error) {
      console.error('Error setting first time completed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signInWithGoogle,
    signInWithApple,
    signOut,
    isFirstTime,
    setFirstTimeCompleted,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
