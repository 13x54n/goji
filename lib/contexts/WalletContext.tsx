import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useSession } from './SessionContext';

interface WalletData {
  walletId: string;
  walletAddress: string;
  blockchain: string;
  accountType: string;
  tokenBalances: Array<{
    token: {
      id: string;
      name: string;
      symbol: string;
    };
    amount: string;
  }>;
}

interface WalletContextType {
  wallets: WalletData[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;
  refreshWalletData: () => Promise<void>;
  getWalletById: (walletId: string) => WalletData | undefined;
  getTokenByWalletAndTokenId: (walletId: string, tokenId: string) => any | undefined;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const { session } = useSession();

  // Cache TTL: 5 minutes
  const CACHE_TTL = 5 * 60 * 1000;

  useEffect(() => {
    if (session) {
      console.log('WalletContext: Session available:', session);
    } else {
      console.log('WalletContext: No session available');
    }
  }, [session]);

  // Also fetch data when session changes
  useEffect(() => {
    if (session?.userId) {
      console.log('WalletContext: Session available, checking if data needs fetching');
      const now = Date.now();
      if (wallets.length === 0 || (now - lastFetchTime) > CACHE_TTL) {
        console.log('WalletContext: Fetching wallet data');
        fetchWalletData();
      } else {
        console.log('WalletContext: Using cached data');
      }
    }
  }, [session?.userId]);

  const fetchWalletData = async (forceRefresh = false) => {
    if (!session?.userId) {
      console.log('No session userId available for wallet data fetch');
      return;
    }

    const now = Date.now();
    
    // Don't fetch if we have recent data and it's not a force refresh
    if (!forceRefresh && wallets.length > 0 && (now - lastFetchTime) < CACHE_TTL) {
      console.log('Using cached wallet data');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching fresh wallet data for user:', session.userId);
      const response = await fetch(API_ENDPOINTS.WALLET_BALANCE(session.userId));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Wallet API response:', data);
      
      if (data.success && data.walletData) {
        setWallets(data.walletData);
        setLastFetchTime(now);
        console.log('Wallet data updated:', data.walletData.length, 'wallets');
      } else {
        console.error('API returned error:', data);
        setError(data.error || 'Failed to fetch wallet data');
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWalletData = async () => {
    await fetchWalletData(true);
  };

  const getWalletById = (walletId: string): WalletData | undefined => {
    return wallets.find(wallet => 
      wallet.walletId === walletId || wallet.id === walletId
    );
  };

  const getTokenByWalletAndTokenId = (walletId: string, tokenId: string) => {
    const wallet = getWalletById(walletId);
    if (!wallet) return undefined;
    
    return wallet.tokenBalances.find(tokenBalance => 
      tokenBalance.token.id === tokenId
    );
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!session?.userId) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if ((now - lastFetchTime) > CACHE_TTL) {
        console.log('Auto-refreshing wallet data...');
        fetchWalletData();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [session?.userId, lastFetchTime]);

  const value: WalletContextType = {
    wallets,
    isLoading,
    error,
    lastFetchTime,
    refreshWalletData,
    getWalletById,
    getTokenByWalletAndTokenId,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
