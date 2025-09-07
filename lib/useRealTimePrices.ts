import { useCallback, useEffect, useRef, useState } from 'react';
import { priceService, TokenPrice } from './priceService';

export interface UseRealTimePricesOptions {
  symbols?: string[];
  autoStart?: boolean;
}

export interface UseRealTimePricesReturn {
  prices: Map<string, TokenPrice>;
  getPrice: (symbol: string) => TokenPrice | null;
  getFormattedPrice: (symbol: string) => string;
  getFormattedChange: (symbol: string) => { change: string; isPositive: boolean };
  calculateUSDValue: (symbol: string, amount: number) => number;
  calculatePortfolioValue: (balances: Array<{ symbol: string; amount: number }>) => {
    totalUSD: number;
    change24h: number;
    changePercent24h: number;
  };
  isConnected: boolean;
  lastUpdate: string | null;
}

export function useRealTimePrices(options: UseRealTimePricesOptions = {}): UseRealTimePricesReturn {
  const { symbols = [], autoStart = true } = options;
  
  const [prices, setPrices] = useState<Map<string, TokenPrice>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const initializedRef = useRef(false);

  // Update prices when they change
  const handlePriceUpdate = useCallback((price: TokenPrice) => {
    setPrices(prev => {
      const newPrices = new Map(prev);
      newPrices.set(price.symbol, price);
      return newPrices;
    });
    setLastUpdate(price.lastUpdated);
  }, []);

  // Setup price subscriptions
  useEffect(() => {
    if (!autoStart || initializedRef.current) return;

    // Initialize price service
    priceService.initialize();
    setIsConnected(true);
    initializedRef.current = true;

    // Subscribe to specific symbols if provided
    const unsubscribeFunctions: (() => void)[] = [];
    
    if (symbols.length > 0) {
      symbols.forEach(symbol => {
        const unsubscribe = priceService.subscribeToPrice(symbol, handlePriceUpdate);
        unsubscribeFunctions.push(unsubscribe);
      });
    } else {
      // Subscribe to all prices
      const allPrices = priceService.getAllPrices();
      allPrices.forEach((_, symbol) => {
        const unsubscribe = priceService.subscribeToPrice(symbol, handlePriceUpdate);
        unsubscribeFunctions.push(unsubscribe);
      });
    }

    // Set initial prices
    const initialPrices = priceService.getAllPrices();
    setPrices(new Map(initialPrices));

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
      priceService.stopPriceMonitoring();
      setIsConnected(false);
      initializedRef.current = false;
    };
  }, [symbols, autoStart, handlePriceUpdate]);

  const getPrice = useCallback((symbol: string): TokenPrice | null => {
    return priceService.getPrice(symbol);
  }, []);

  const getFormattedPrice = useCallback((symbol: string): string => {
    return priceService.getFormattedPrice(symbol);
  }, []);

  const getFormattedChange = useCallback((symbol: string): { change: string; isPositive: boolean } => {
    return priceService.getFormattedChange(symbol);
  }, []);

  const calculateUSDValue = useCallback((symbol: string, amount: number): number => {
    return priceService.calculateUSDValue(symbol, amount);
  }, []);

  const calculatePortfolioValue = useCallback((balances: Array<{ symbol: string; amount: number }>) => {
    return priceService.calculatePortfolioValue(balances);
  }, []);

  return {
    prices,
    getPrice,
    getFormattedPrice,
    getFormattedChange,
    calculateUSDValue,
    calculatePortfolioValue,
    isConnected,
    lastUpdate,
  };
}
