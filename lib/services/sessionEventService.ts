// Simple event emitter for session changes
class SessionEventService {
  private listeners: Set<() => void> = new Set();

  // Subscribe to session changes
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Emit session change event
  emit(): void {
    console.log('SessionEventService: Emitting session change event');
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('SessionEventService: Error in listener:', error);
      }
    });
  }

  // Clear all listeners
  clear(): void {
    this.listeners.clear();
  }
}

export const sessionEventService = new SessionEventService();
