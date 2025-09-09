import { PriceUpdate, websocketService } from '../websocketService';

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  timestamp: string;
  isLoading: boolean;
  error: string | null;
}

class PriceService {
  private priceCache = new Map<string, TokenPrice>();
  private listeners = new Map<string, Set<(price: TokenPrice) => void>>();
  private isConnected = false;

  constructor() {
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners() {
    // Listen for price updates from websocket
    websocketService.on('price-updated', (data: PriceUpdate) => {
      const tokenPrice: TokenPrice = {
        symbol: data.symbol,
        price: data.price,
        change24h: data.change24h,
        changePercent24h: data.changePercent24h,
        timestamp: data.timestamp,
        isLoading: false,
        error: null
      };

      this.priceCache.set(data.symbol, tokenPrice);
      this.notifyListeners(data.symbol, tokenPrice);
    });

    // Listen for websocket connection status
    websocketService.on('connect', () => {
      this.isConnected = true;
      console.log('Price service connected to websocket');
    });

    websocketService.on('disconnect', () => {
      this.isConnected = false;
      console.log('Price service disconnected from websocket');
    });
  }

  /**
   * Get current price for a token symbol
   */
  getPrice(symbol: string): TokenPrice | null {
    return this.priceCache.get(symbol) || null;
  }

  /**
   * Subscribe to price updates for a token symbol
   */
  subscribeToPrice(symbol: string, callback: (price: TokenPrice) => void): () => void {
    if (!this.listeners.has(symbol)) {
      this.listeners.set(symbol, new Set());
    }
    
    this.listeners.get(symbol)!.add(callback);

    // Return current price if available
    const currentPrice = this.getPrice(symbol);
    if (currentPrice) {
      callback(currentPrice);
    } else {
      // Request price update if not cached
      this.requestPriceUpdate(symbol);
    }

    // Return unsubscribe function
    return () => {
      const symbolListeners = this.listeners.get(symbol);
      if (symbolListeners) {
        symbolListeners.delete(callback);
        if (symbolListeners.size === 0) {
          this.listeners.delete(symbol);
        }
      }
    };
  }

  /**
   * Request price update for a specific symbol
   */
  private requestPriceUpdate(symbol: string) {
    if (this.isConnected) {
      // Set loading state
      const loadingPrice: TokenPrice = {
        symbol,
        price: 0,
        change24h: 0,
        changePercent24h: 0,
        timestamp: new Date().toISOString(),
        isLoading: true,
        error: null
      };
      
      this.priceCache.set(symbol, loadingPrice);
      this.notifyListeners(symbol, loadingPrice);

      // Request price from backend via websocket
      websocketService.emit('request-price', { symbol });
    }
  }

  /**
   * Notify all listeners for a symbol
   */
  private notifyListeners(symbol: string, price: TokenPrice) {
    const symbolListeners = this.listeners.get(symbol);
    if (symbolListeners) {
      symbolListeners.forEach(callback => callback(price));
    }
  }

  /**
   * Get all cached prices
   */
  getAllPrices(): Map<string, TokenPrice> {
    return new Map(this.priceCache);
  }

  /**
   * Clear price cache
   */
  clearCache() {
    this.priceCache.clear();
  }
}

// Export singleton instance
export const priceService = new PriceService();
