import { io, Socket } from 'socket.io-client';
import { sessionService } from './sessionService';

export interface WalletUpdate {
  walletId: string;
  blockchain: string;
  address: string;
  balance: Array<{
    tokenId: string;
    amount: string;
    tokenAddress?: string;
    tokenName?: string;
    tokenSymbol?: string;
    tokenStandard?: string;
    blockchain?: string;
  }>;
  lastUpdated: string;
}

export interface TransactionUpdate {
  transactionId: string;
  walletId: string;
  state: string;
  txHash?: string;
  amount: string;
  destinationAddress: string;
  tokenId: string;
  note?: string;
  updatedAt: string;
}

export interface RecentTransactions {
  walletId: string;
  transactions: TransactionUpdate[];
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  timestamp: string;
}

export interface TokenChange {
  walletId: string;
  blockchain: string;
  newTokens: Array<{
    tokenId: string;
    amount: string;
    tokenAddress?: string;
    tokenName?: string;
    tokenSymbol?: string;
    tokenStandard?: string;
    blockchain?: string;
  }>;
  removedTokens: Array<{
    tokenId: string;
    amount: string;
    tokenAddress?: string;
    tokenName?: string;
    tokenSymbol?: string;
    tokenStandard?: string;
    blockchain?: string;
  }>;
  timestamp: string;
}

export interface WebSocketEvents {
  'subscription-confirmed': (data: { message: string; userId: string }) => void;
  'subscription-error': (data: { error: string }) => void;
  'wallet-updated': (data: WalletUpdate) => void;
  'wallet-balance-updated': (data: WalletUpdate) => void;
  'transaction-updated': (data: TransactionUpdate) => void;
  'transaction-status-updated': (data: TransactionUpdate) => void;
  'recent-transactions': (data: RecentTransactions) => void;
  'tokens-changed': (data: TokenChange) => void;
  'price-updated': (data: PriceUpdate) => void;
  'wallet-error': (data: { error: string }) => void;
  'transaction-error': (data: { error: string }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const session = sessionService.getSession();
      if (!session?.email) {
        console.log('No session found, skipping WebSocket connection');
        return;
      }

      const serverUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
      console.log('Connecting to WebSocket server:', serverUrl);

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();
      this.subscribeToWallets(session.email);

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', { connected: false, reason });
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.emit('connection-error', { error: error.message });
      this.handleReconnect();
    });

    // Wallet events
    this.socket.on('wallet-updated', (data: WalletUpdate) => {
      console.log('Wallet updated:', data);
      this.emit('wallet-updated', data);
    });

    this.socket.on('wallet-balance-updated', (data: WalletUpdate) => {
      console.log('Wallet balance updated:', data);
      this.emit('wallet-balance-updated', data);
    });

    // Transaction events
    this.socket.on('transaction-updated', (data: TransactionUpdate) => {
      console.log('Transaction updated:', data);
      this.emit('transaction-updated', data);
    });

    this.socket.on('transaction-status-updated', (data: TransactionUpdate) => {
      console.log('Transaction status updated:', data);
      this.emit('transaction-status-updated', data);
    });

    this.socket.on('recent-transactions', (data: RecentTransactions) => {
      console.log('Recent transactions:', data);
      this.emit('recent-transactions', data);
    });

    // Price events
    this.socket.on('price-updated', (data: PriceUpdate) => {
      console.log('Price updated:', data);
      this.emit('price-updated', data);
    });

    // Error events
    this.socket.on('wallet-error', (data: { error: string }) => {
      console.error('Wallet error:', data.error);
      this.emit('wallet-error', data);
    });

    this.socket.on('transaction-error', (data: { error: string }) => {
      console.error('Transaction error:', data.error);
      this.emit('transaction-error', data);
    });

    // Subscription events
    this.socket.on('subscription-confirmed', (data: { message: string; userId: string }) => {
      console.log('Subscription confirmed:', data);
      this.emit('subscription-confirmed', data);
    });

    this.socket.on('subscription-error', (data: { error: string }) => {
      console.error('Subscription error:', data.error);
      this.emit('subscription-error', data);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  public subscribeToWallets(userId: string) {
    if (!this.socket || !this.isConnected) {
      console.log('Socket not connected, cannot subscribe to wallets');
      return;
    }

    console.log('Subscribing to wallets for user:', userId);
    this.socket.emit('subscribe-wallets', { userId });
  }

  public refreshWalletBalance(walletId: string) {
    if (!this.socket || !this.isConnected) {
      console.log('Socket not connected, cannot refresh wallet balance');
      return;
    }

    console.log('Refreshing wallet balance for:', walletId);
    this.socket.emit('refresh-wallet-balance', { walletId });
  }

  public checkTransactionStatus(transactionId: string) {
    if (!this.socket || !this.isConnected) {
      console.log('Socket not connected, cannot check transaction status');
      return;
    }

    console.log('Checking transaction status for:', transactionId);
    this.socket.emit('check-transaction-status', { transactionId });
  }

  public on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  public off<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.eventListeners.clear();
  }

  public reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
