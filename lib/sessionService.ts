import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

interface UserSession {
  userId: string;
  email: string;
  token: string;
  hasPasskey: boolean;
  credentialId?: string; // Store the passkey credential ID
  lastActivity: number;
}

const SESSION_KEY = 'mingopenwebheadquarters_session';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

class SessionService {
  private session: UserSession | null = null;
  private appStateListener: any = null;
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;

  // Initialize session service
  async initialize() {
    await this.loadSession();
    this.setupAppStateListener();
    this.resetInactivityTimer();
  }

  // Load session from storage
  private async loadSession(): Promise<void> {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionData) {
        this.session = JSON.parse(sessionData);
        
        // Check if session has expired
        if (this.isSessionExpired()) {
          await this.clearSession();
        } else {
          this.resetInactivityTimer();
        }
      }
    } catch (error) {
      await this.clearSession();
    }
  }

  // Save session to storage
  private async saveSession(session: UserSession): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      this.session = session;
    } catch (error) {
      // no-op
    }
  }

  // Check if session is expired
  private isSessionExpired(): boolean {
    if (!this.session) return true;
    
    const now = Date.now();
    const timeSinceLastActivity = now - this.session.lastActivity;
    
    return timeSinceLastActivity > INACTIVITY_TIMEOUT;
  }

  // Setup app state listener to track when app becomes active/inactive
  private setupAppStateListener(): void {
    this.appStateListener = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App became active, check if session is still valid
        if (this.session && this.isSessionExpired()) {
          this.handleSessionExpired();
        } else {
          this.resetInactivityTimer();
        }
      } else if (nextAppState === 'inactive' || nextAppState === 'background') {
        // App became inactive, update last activity
        this.updateLastActivity();
      }
    });
  }

  // Reset inactivity timer
  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer as any);
    }

    if (this.session) {
      this.inactivityTimer = setTimeout(() => {
        this.handleSessionExpired();
      }, INACTIVITY_TIMEOUT);
    }
  }

  // Update last activity timestamp
  private updateLastActivity(): void {
    if (this.session) {
      this.session.lastActivity = Date.now();
      this.saveSession(this.session);
    }
  }

  // Handle session expiration
  private handleSessionExpired(): void {
    this.clearSession();
    // You can emit an event here to notify the app about session expiration
  }

  // Create new session after successful login
  async createSession(userData: {
    userId: string;
    email: string;
    token: string;
    hasPasskey: boolean;
    credentialId?: string;
  }): Promise<void> {
    const session: UserSession = {
      ...userData,
      lastActivity: Date.now(),
    };
    
    await this.saveSession(session);
    this.resetInactivityTimer();
  }

  // Get current session
  getSession(): UserSession | null {
    return this.session;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.session !== null && !this.isSessionExpired();
  }

  // Get user's authentication methods
  getAuthMethods(): { hasPasskey: boolean } {
    if (!this.session) {
      return { hasPasskey: false };
    }
    
    return {
      hasPasskey: this.session.hasPasskey,
    };
  }

  // Get auth token
  getToken(): string | null {
    return this.session?.token || null;
  }

  // Clear session (logout)
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      this.session = null;
      
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer as any);
        this.inactivityTimer = null;
      }
    } catch (error) {
      // no-op
    }
  }

  // Cleanup when app is unmounted
  cleanup(): void {
    if (this.appStateListener) {
      this.appStateListener.remove();
    }
    
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer as any);
    }
  }
}

export const sessionService = new SessionService();
