import { websocketService } from './websocketService';

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  lastUpdated: string;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  timestamp: string;
}

class PriceService {
  private prices: Map<string, TokenPrice> = new Map();
  private updateCallbacks: Map<string, (price: TokenPrice) => void> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners() {
    // Listen for price updates from backend
    websocketService.on('price-updated', (update: PriceUpdate) => {
      this.updatePrice(update);
    });
  }

  private updatePrice(update: PriceUpdate) {
    const tokenPrice: TokenPrice = {
      symbol: update.symbol,
      price: update.price,
      change24h: update.change24h,
      changePercent24h: update.changePercent24h,
      lastUpdated: update.timestamp
    };

    this.prices.set(update.symbol, tokenPrice);
    
    // Notify subscribers
    const callback = this.updateCallbacks.get(update.symbol);
    if (callback) {
      callback(tokenPrice);
    }
  }

  /**
   * Get current price for a token
   */
  getPrice(symbol: string): TokenPrice | null {
    return this.prices.get(symbol.toUpperCase()) || null;
  }

  /**
   * Get all current prices
   */
  getAllPrices(): Map<string, TokenPrice> {
    return new Map(this.prices);
  }

  /**
   * Subscribe to price updates for a specific token
   */
  subscribeToPrice(symbol: string, callback: (price: TokenPrice) => void): () => void {
    const upperSymbol = symbol.toUpperCase();
    this.updateCallbacks.set(upperSymbol, callback);

    // Return unsubscribe function
    return () => {
      this.updateCallbacks.delete(upperSymbol);
    };
  }

  /**
   * Calculate USD value for a token amount
   */
  calculateUSDValue(symbol: string, amount: number): number {
    const price = this.getPrice(symbol);
    if (!price) {
      // Fallback to mock prices for demo
      const mockPrices: { [key: string]: number } = {
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
      return amount * (mockPrices[symbol.toUpperCase()] || 1);
    }
    return amount * price.price;
  }

  /**
   * Get formatted price string
   */
  getFormattedPrice(symbol: string): string {
    const price = this.getPrice(symbol);
    if (!price) {
      return '$0.00';
    }
    return `$${price.price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    })}`;
  }

  /**
   * Get formatted change string
   */
  getFormattedChange(symbol: string): { change: string; isPositive: boolean } {
    const price = this.getPrice(symbol);
    if (!price) {
      return { change: '+0.00%', isPositive: true };
    }
    
    const isPositive = price.changePercent24h >= 0;
    const change = `${isPositive ? '+' : ''}${price.changePercent24h.toFixed(2)}%`;
    
    return { change, isPositive };
  }

  /**
   * Start price monitoring (now uses WebSocket updates from backend)
   */
  startPriceMonitoring() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Prices are now updated via WebSocket from backend
    // No need for local simulation
    console.log('Price monitoring started - using WebSocket updates from backend');
  }

  /**
   * Stop price monitoring
   */
  stopPriceMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
  }

  private getBasePrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
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
    return basePrices[symbol] || 1;
  }

  /**
   * Initialize with default prices
   */
  initialize() {
    // Only initialize if not already initialized
    if (this.prices.size > 0) {
      return;
    }
    
    const symbols = ['ETH', 'BTC', 'SOL', 'USDC', 'MATIC', 'AVAX'];
    
    symbols.forEach(symbol => {
      const basePrice = this.getBasePrice(symbol);
      const price: TokenPrice = {
        symbol,
        price: basePrice,
        change24h: 0,
        changePercent24h: 0,
        lastUpdated: new Date().toISOString()
      };
      this.prices.set(symbol, price);
    });
    
    // Start monitoring
    this.startPriceMonitoring();
  }

  /**
   * Get total portfolio value
   */
  calculatePortfolioValue(balances: Array<{ symbol: string; amount: number }>): {
    totalUSD: number;
    change24h: number;
    changePercent24h: number;
  } {
    let totalUSD = 0;
    let totalChange24h = 0;
    
    balances.forEach(balance => {
      const price = this.getPrice(balance.symbol);
      if (price) {
        const value = balance.amount * price.price;
        const change = balance.amount * price.change24h;
        totalUSD += value;
        totalChange24h += change;
      }
    });
    
    const changePercent24h = totalUSD > 0 ? (totalChange24h / totalUSD) * 100 : 0;
    
    return {
      totalUSD,
      change24h: totalChange24h,
      changePercent24h
    };
  }
}

// Export singleton instance
export const priceService = new PriceService();
