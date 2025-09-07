import { useCallback, useEffect, useRef, useState } from 'react';
import { circleWalletApiService, TokenBalance, TransactionInfo, WalletInfo } from './circleWalletApiService';

export interface UseCircleWalletOptions {
  walletId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseCircleWalletReturn {
  // Wallet data
  wallets: WalletInfo[];
  selectedWallet: WalletInfo | null;
  tokenBalances: TokenBalance[];
  transactions: TransactionInfo[];
  
  // Loading states
  isLoading: boolean;
  isTransactionLoading: boolean;
  
  // Error states
  error: string | null;
  transactionError: string | null;
  
  // Actions
  refreshWallets: () => Promise<void>;
  refreshTokenBalances: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  selectWallet: (walletId: string) => void;
  createTransaction: (params: {
    tokenId: string;
    amount: string;
    destinationAddress: string;
    note?: string;
  }) => Promise<TransactionInfo>;
  estimateFee: (params: {
    tokenId: string;
    amount: string;
    destinationAddress: string;
  }) => Promise<{ fee: string; feeLevel: string }>;
  validateAddress: (address: string, blockchain: string) => Promise<boolean>;
}

export function useCircleWallet(options: UseCircleWalletOptions = {}): UseCircleWalletReturn {
  const { walletId, autoRefresh = true, refreshInterval = 30000 } = options;
  
  // State
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Refs for stable references
  const walletIdRef = useRef(walletId);
  walletIdRef.current = walletId;

  // Load all wallets
  const refreshWallets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const walletList = await circleWalletApiService.getWallets();
      setWallets(walletList);
      
      // Auto-select first wallet if none selected
      if (walletList.length > 0 && !selectedWallet) {
        setSelectedWallet(walletList[0]);
        walletIdRef.current = walletList[0].id;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallets');
    } finally {
      setIsLoading(false);
    }
  }, [selectedWallet]);

  // Load token balances for selected wallet
  const refreshTokenBalances = useCallback(async () => {
    if (!walletIdRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const balances = await circleWalletApiService.getWalletTokenBalances(walletIdRef.current);
      setTokenBalances(balances);
      
      // Update selected wallet with new balances
      if (selectedWallet) {
        const updatedWallet = { ...selectedWallet, tokenBalances: balances };
        setSelectedWallet(updatedWallet);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token balances');
    } finally {
      setIsLoading(false);
    }
  }, [selectedWallet]);

  // Load transactions for selected wallet
  const refreshTransactions = useCallback(async () => {
    if (!walletIdRef.current) return;
    
    setIsTransactionLoading(true);
    setTransactionError(null);
    
    try {
      const walletTransactions = await circleWalletApiService.getWalletTransactions(walletIdRef.current);
      setTransactions(walletTransactions);
    } catch (err) {
      setTransactionError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsTransactionLoading(false);
    }
  }, []);

  // Select a wallet
  const selectWallet = useCallback((newWalletId: string) => {
    const wallet = wallets.find(w => w.id === newWalletId);
    if (wallet) {
      setSelectedWallet(wallet);
      walletIdRef.current = newWalletId;
      setTokenBalances(wallet.tokenBalances);
    }
  }, [wallets]);

  // Create transaction
  const createTransaction = useCallback(async (params: {
    tokenId: string;
    amount: string;
    destinationAddress: string;
    note?: string;
  }): Promise<TransactionInfo> => {
    if (!walletIdRef.current) {
      throw new Error('No wallet selected');
    }

    setIsTransactionLoading(true);
    setTransactionError(null);
    
    try {
      const transaction = await circleWalletApiService.createTransaction({
        walletId: walletIdRef.current,
        ...params
      });
      
      // Add to transactions list
      setTransactions(prev => [transaction, ...prev]);
      
      return transaction;
    } catch (err) {
      setTransactionError(err instanceof Error ? err.message : 'Failed to create transaction');
      throw err;
    } finally {
      setIsTransactionLoading(false);
    }
  }, []);

  // Estimate fee
  const estimateFee = useCallback(async (params: {
    tokenId: string;
    amount: string;
    destinationAddress: string;
  }): Promise<{ fee: string; feeLevel: string }> => {
    return await circleWalletApiService.estimateTransferFee({
      ...params,
      walletId: walletIdRef.current
    });
  }, []);

  // Validate address
  const validateAddress = useCallback(async (address: string, blockchain: string): Promise<boolean> => {
    return await circleWalletApiService.validateAddress(address, blockchain);
  }, []);

  // Initial load
  useEffect(() => {
    refreshWallets();
  }, [refreshWallets]);

  // Load token balances when wallet is selected
  useEffect(() => {
    if (selectedWallet) {
      refreshTokenBalances();
      refreshTransactions();
    }
  }, [selectedWallet, refreshTokenBalances, refreshTransactions]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !selectedWallet) return;

    const interval = setInterval(() => {
      refreshTokenBalances();
      refreshTransactions();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedWallet, refreshTokenBalances, refreshTransactions, refreshInterval]);

  return {
    // Wallet data
    wallets,
    selectedWallet,
    tokenBalances,
    transactions,
    
    // Loading states
    isLoading,
    isTransactionLoading,
    
    // Error states
    error,
    transactionError,
    
    // Actions
    refreshWallets,
    refreshTokenBalances,
    refreshTransactions,
    selectWallet,
    createTransaction,
    estimateFee,
    validateAddress,
  };
}
