import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { sessionEventService } from '../services/sessionEventService';
import { sessionService } from '../sessionService';

interface SessionContextType {
  session: any;
  isLoggedIn: boolean;
  refreshSession: () => void;
  forceRefresh: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const lastSessionRef = useRef<string | null>(null);

  const refreshSession = () => {
    const currentSession = sessionService.getSession();
    const loggedIn = sessionService.isLoggedIn();
    
    // Only update state if session actually changed
    const sessionString = JSON.stringify(currentSession);
    if (sessionString !== lastSessionRef.current) {
      console.log('SessionContext: Session changed, updating state');
      setSession(currentSession);
      setIsLoggedIn(loggedIn);
      lastSessionRef.current = sessionString;
    }
  };

  const forceRefresh = () => {
    console.log('SessionContext: Force refresh requested');
    const currentSession = sessionService.getSession();
    const loggedIn = sessionService.isLoggedIn();
    setSession(currentSession);
    setIsLoggedIn(loggedIn);
    lastSessionRef.current = JSON.stringify(currentSession);
  };

  useEffect(() => {
    // Initial session load
    refreshSession();

    // Set up app state listener for when app becomes active
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Only check session when app becomes active
        refreshSession();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Subscribe to session change events
    const unsubscribeSessionEvents = sessionEventService.subscribe(() => {
      console.log('SessionContext: Received session change event');
      forceRefresh();
    });

    // Minimal polling - only check every 5 minutes when app is active
    const sessionCheckInterval = setInterval(() => {
      if (AppState.currentState === 'active') {
        refreshSession();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      appStateSubscription?.remove();
      unsubscribeSessionEvents();
      clearInterval(sessionCheckInterval);
    };
  }, []);

  const value: SessionContextType = {
    session,
    isLoggedIn,
    refreshSession,
    forceRefresh,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
