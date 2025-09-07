import { Server as SocketIOServer } from 'socket.io';
import User from '../models/User';
import Wallet from '../models/Wallet';
import { TransactionService } from './transactionService';

export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  timestamp: string;
}

export interface WalletUpdate {
  walletId: string;
  blockchain: string;
  address: string;
  balance: any[];
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

export class WalletMonitoringService {
  private io: SocketIOServer;
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private activeConnections: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private priceInterval: NodeJS.Timeout | null = null;
  private currentPrices: Map<string, PriceUpdate> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
    this.startPriceMonitoring();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle user authentication and wallet subscription
      socket.on('subscribe-wallets', async (data: { userId: string }) => {
        try {
          const { userId } = data;
          
          // Track active connections
          if (!this.activeConnections.has(userId)) {
            this.activeConnections.set(userId, new Set());
          }
          this.activeConnections.get(userId)?.add(socket.id);

          // Join user-specific room
          socket.join(`user-${userId}`);

          // Get user's wallets and start monitoring
          const user = await User.findById(userId).populate('wallets');
          if (user && user.wallets) {
            for (const wallet of user.wallets) {
              const walletData = wallet as any;
              await this.startWalletMonitoring(walletData.id, walletData.blockchain);
            }
          }

          socket.emit('subscription-confirmed', { 
            message: 'Successfully subscribed to wallet updates',
            userId 
          });
        } catch (error) {
          console.error('Error subscribing to wallets:', error);
          socket.emit('subscription-error', { 
            error: 'Failed to subscribe to wallet updates' 
          });
        }
      });

      // Handle wallet balance refresh
      socket.on('refresh-wallet-balance', async (data: { walletId: string }) => {
        try {
          const { walletId } = data;
          const wallet = await Wallet.findById(walletId);
          
          if (wallet) {
            const balance = await TransactionService.getWalletBalance(walletId);
            const update: WalletUpdate = {
              walletId: walletId,
              blockchain: wallet.blockchain,
              address: wallet.address,
              balance,
              lastUpdated: new Date().toISOString()
            };

            socket.emit('wallet-balance-updated', update);
          }
        } catch (error) {
          console.error('Error refreshing wallet balance:', error);
          socket.emit('wallet-error', { 
            error: 'Failed to refresh wallet balance' 
          });
        }
      });

      // Handle transaction status check
      socket.on('check-transaction-status', async (data: { transactionId: string }) => {
        try {
          const { transactionId } = data;
          const transaction = await TransactionService.getTransaction(transactionId);
          
          if (transaction) {
            const update: TransactionUpdate = {
              transactionId: transaction.id,
              walletId: transaction.walletId,
              state: transaction.state,
              txHash: transaction.txHash,
              amount: transaction.amount,
              destinationAddress: transaction.destinationAddress,
              tokenId: transaction.tokenId,
              note: transaction.note,
              updatedAt: transaction.updatedAt
            };

            socket.emit('transaction-status-updated', update);
          }
        } catch (error) {
          console.error('Error checking transaction status:', error);
          socket.emit('transaction-error', { 
            error: 'Failed to check transaction status' 
          });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        // Remove from active connections
        for (const [userId, socketIds] of this.activeConnections.entries()) {
          socketIds.delete(socket.id);
          if (socketIds.size === 0) {
            this.activeConnections.delete(userId);
            // Stop monitoring if no active connections for this user
            this.stopUserWalletMonitoring(userId);
          }
        }
      });
    });
  }

  private async startWalletMonitoring(walletId: string, blockchain: string) {
    // Don't start monitoring if already active
    if (this.monitoringIntervals.has(walletId)) {
      return;
    }

    console.log(`Starting wallet monitoring for ${walletId} on ${blockchain}`);

    // Monitor wallet every 30 seconds
    const interval = setInterval(async () => {
      try {
        await this.checkWalletUpdates(walletId, blockchain);
      } catch (error) {
        console.error(`Error monitoring wallet ${walletId}:`, error);
      }
    }, 30000);

    this.monitoringIntervals.set(walletId, interval);

    // Initial check
    await this.checkWalletUpdates(walletId, blockchain);
  }

  private async checkWalletUpdates(walletId: string, blockchain: string) {
    try {
      // Get current balance
      const balance = await TransactionService.getWalletBalance(walletId);
      
      // Get recent transactions
      const transactions = await TransactionService.listTransactions([walletId], 10);

      // Get wallet details
      const wallet = await Wallet.findById(walletId);
      if (!wallet) return;

      // Find users who have this wallet
      const users = await User.find({ wallets: walletId });
      
      for (const user of users) {
        const update: WalletUpdate = {
          walletId,
          blockchain: wallet.blockchain,
          address: wallet.address,
          balance,
          lastUpdated: new Date().toISOString()
        };

        // Send update to user's room
        this.io.to(`user-${user._id}`).emit('wallet-updated', update);

        // Send recent transactions
        if (transactions.length > 0) {
          this.io.to(`user-${user._id}`).emit('recent-transactions', {
            walletId,
            transactions
          });
        }
      }
    } catch (error) {
      console.error(`Error checking wallet updates for ${walletId}:`, error);
    }
  }

  private stopUserWalletMonitoring(userId: string) {
    // This is a simplified approach - in production, you'd want more sophisticated
    // logic to determine when to stop monitoring based on active connections
    console.log(`Stopping wallet monitoring for user ${userId}`);
  }

  public async stopWalletMonitoring(walletId: string) {
    const interval = this.monitoringIntervals.get(walletId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(walletId);
      console.log(`Stopped wallet monitoring for ${walletId}`);
    }
  }

  public async broadcastTransactionUpdate(transactionId: string, userId: string) {
    try {
      const transaction = await TransactionService.getTransaction(transactionId);
      if (transaction) {
        const update: TransactionUpdate = {
          transactionId: transaction.id,
          walletId: transaction.walletId,
          state: transaction.state,
          txHash: transaction.txHash,
          amount: transaction.amount,
          destinationAddress: transaction.destinationAddress,
          tokenId: transaction.tokenId,
          note: transaction.note,
          updatedAt: transaction.updatedAt
        };

        this.io.to(`user-${userId}`).emit('transaction-updated', update);
      }
    } catch (error) {
      console.error('Error broadcasting transaction update:', error);
    }
  }

  public async broadcastWalletBalanceUpdate(walletId: string, userId: string) {
    try {
      const balance = await TransactionService.getWalletBalance(walletId);
      const wallet = await Wallet.findById(walletId);
      
      if (wallet) {
        const update: WalletUpdate = {
          walletId,
          blockchain: wallet.blockchain,
          address: wallet.address,
          balance,
          lastUpdated: new Date().toISOString()
        };

        this.io.to(`user-${userId}`).emit('wallet-balance-updated', update);
      }
    } catch (error) {
      console.error('Error broadcasting wallet balance update:', error);
    }
  }

  public getActiveConnections(): Map<string, Set<string>> {
    return this.activeConnections;
  }

  public getMonitoringWallets(): string[] {
    return Array.from(this.monitoringIntervals.keys());
  }

  private startPriceMonitoring() {
    // Initialize with base prices
    const basePrices = {
      'ETH': 3000,
      'BTC': 45000,
      'SOL': 100,
      'USDC': 1,
      'USDT': 1,
      'MATIC': 0.8,
      'AVAX': 25,
      'ARB': 1.2,
      'OP': 2.5,
      'BASE': 1.0
    };

    Object.entries(basePrices).forEach(([symbol, price]) => {
      this.currentPrices.set(symbol, {
        symbol,
        price,
        change24h: 0,
        changePercent24h: 0,
        timestamp: new Date().toISOString()
      });
    });

    // Monitor prices every 5 seconds
    this.priceInterval = setInterval(() => {
      this.updatePrices();
    }, 5000);
  }

  private updatePrices() {
    const symbols = ['ETH', 'BTC', 'SOL', 'USDC', 'MATIC', 'AVAX', 'ARB', 'OP'];
    
    symbols.forEach(symbol => {
      const currentPrice = this.currentPrices.get(symbol);
      if (!currentPrice) return;

      // Simulate price movement (±1% change)
      const change = (Math.random() - 0.5) * 0.02;
      const newPrice = currentPrice.price * (1 + change);
      const change24h = newPrice - currentPrice.price;
      const changePercent24h = (change24h / currentPrice.price) * 100;

      const priceUpdate: PriceUpdate = {
        symbol,
        price: newPrice,
        change24h,
        changePercent24h,
        timestamp: new Date().toISOString()
      };

      this.currentPrices.set(symbol, priceUpdate);

      // Broadcast price update to all connected clients
      this.io.emit('price-updated', priceUpdate);
    });
  }

  public getCurrentPrices(): Map<string, PriceUpdate> {
    return new Map(this.currentPrices);
  }

  public stopPriceMonitoring() {
    if (this.priceInterval) {
      clearInterval(this.priceInterval);
      this.priceInterval = null;
    }
  }
}
