import { useEffect, useState } from 'react';
import { priceService, TokenPrice } from '../services/priceService';

export interface UseTokenPriceResult {
  price: TokenPrice | null;
  isLoading: boolean;
  error: string | null;
  refreshPrice: () => void;
}

/**
 * Hook to get real-time price data for a token symbol
 */
export const useTokenPrice = (symbol: string): UseTokenPriceResult => {
  const [price, setPrice] = useState<TokenPrice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setPrice(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Get initial price if available
    const initialPrice = priceService.getPrice(symbol);
    if (initialPrice) {
      setPrice(initialPrice);
      setIsLoading(initialPrice.isLoading);
      setError(initialPrice.error);
    } else {
      setIsLoading(true);
      setError(null);
    }

    // Subscribe to price updates
    const unsubscribe = priceService.subscribeToPrice(symbol, (newPrice) => {
      setPrice(newPrice);
      setIsLoading(newPrice.isLoading);
      setError(newPrice.error);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [symbol]);

  const refreshPrice = () => {
    if (symbol) {
      setIsLoading(true);
      setError(null);
      // The price service will handle the refresh
      priceService.subscribeToPrice(symbol, (newPrice) => {
        setPrice(newPrice);
        setIsLoading(newPrice.isLoading);
        setError(newPrice.error);
      });
    }
  };

  return {
    price,
    isLoading,
    error,
    refreshPrice
  };
};
