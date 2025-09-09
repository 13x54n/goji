import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useSession } from './SessionContext';
import { useWallet } from './WalletContext';

interface TransactionData {
  id: string;
  state: string;
  txHash: string;
  amount: string;
  destinationAddress: string;
  tokenId: string;
  walletId: string;
  fee: {
    type: string;
    config: {
      feeLevel: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  blockchain: string;
  walletAddress: string;
  accountType: string;
  tokenDetails?: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    standard: string;
    isNative: boolean;
    contractAddress?: string;
    imageUrl?: string;
    blockchain?: string;
  } | null;
}

interface TransactionContextType {
  transactions: TransactionData[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;
  refreshTransactions: () => Promise<void>;
  getTransactionById: (transactionId: string) => TransactionData | undefined;
  getTransactionsByWalletId: (walletId: string) => TransactionData[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const { session } = useSession();
  const { wallets } = useWallet();

  // Cache TTL: 2 minutes (transactions change more frequently)
  const CACHE_TTL = 2 * 60 * 1000;

  useEffect(() => {
    if (session) {
      console.log('TransactionContext: Session available:', session);
    } else {
      console.log('TransactionContext: No session available');
    }
  }, [session]);

  // Also fetch data when session or wallets change
  useEffect(() => {
    if (session?.userId && wallets.length > 0) {
      console.log('TransactionContext: Wallets available, fetching transaction data');
      const now = Date.now();
      if (transactions.length === 0 || (now - lastFetchTime) > CACHE_TTL) {
        fetchAllTransactions();
      }
    }
  }, [session?.userId, wallets.length]);

  const fetchAllTransactions = async (forceRefresh = false) => {
    if (!session?.userId) {
      console.log('No session userId available for transaction data fetch');
      return;
    }
    
    if (wallets.length === 0) {
      console.log('No wallets available for transaction data fetch');
      return;
    }

    const now = Date.now();
    
    // Don't fetch if we have recent data and it's not a force refresh
    if (!forceRefresh && transactions.length > 0 && (now - lastFetchTime) < CACHE_TTL) {
      console.log('Using cached transaction data');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching fresh transaction data for', wallets.length, 'wallets...');
      
      // Fetch transactions for each wallet
      const transactionPromises = wallets.map(async (wallet) => {
        try {
          const walletId = wallet.walletId || wallet.id;
          console.log('Fetching transactions for wallet:', walletId);
          
          const response = await fetch(API_ENDPOINTS.WALLET_TRANSACTIONS(walletId));
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Transaction API response for wallet', walletId, ':', data);
          
          if (data.success && data.transactions) {
            // Add wallet info to each transaction
            return data.transactions.map((tx: any) => ({
              ...tx,
              walletId: walletId,
              walletAddress: wallet.walletAddress,
              blockchain: wallet.blockchain,
              accountType: wallet.accountType
            }));
          }
          return [];
        } catch (error) {
          console.error(`Error fetching transactions for wallet ${wallet.walletId || wallet.id}:`, error);
          return [];
        }
      });
      
      const allTransactionArrays = await Promise.all(transactionPromises);
      const allTransactions = allTransactionArrays.flat();
      
      // Sort by creation date (newest first)
      allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setTransactions(allTransactions);
      setLastFetchTime(now);
      console.log('Transaction data updated:', allTransactions.length, 'transactions');
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTransactions = async () => {
    await fetchAllTransactions(true);
  };

  const getTransactionById = (transactionId: string): TransactionData | undefined => {
    return transactions.find(tx => tx.id === transactionId);
  };

  const getTransactionsByWalletId = (walletId: string): TransactionData[] => {
    return transactions.filter(tx => tx.walletId === walletId);
  };

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!session?.userId || wallets.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if ((now - lastFetchTime) > CACHE_TTL) {
        console.log('Auto-refreshing transaction data...');
        fetchAllTransactions();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [session?.userId, wallets.length, lastFetchTime]);

  const value: TransactionContextType = {
    transactions,
    isLoading,
    error,
    lastFetchTime,
    refreshTransactions,
    getTransactionById,
    getTransactionsByWalletId,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
