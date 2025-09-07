import { useCallback, useEffect, useRef, useState } from 'react';
import { TransactionResponse, transactionService, WalletBalance } from './transactionService';
import { TransactionUpdate, WalletUpdate, websocketService } from './websocketService';

export interface UseRealTimeWalletOptions {
  walletId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseRealTimeWalletReturn {
  // Wallet data
  walletBalance: WalletBalance[];
  walletUpdate: WalletUpdate | null;
  isLoading: boolean;
  error: string | null;

  // Transaction data
  transactions: TransactionResponse[];
  transactionUpdate: TransactionUpdate | null;
  isTransactionLoading: boolean;
  transactionError: string | null;

  // Connection status
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';

  // Actions
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  checkTransactionStatus: (transactionId: string) => void;
  createTransaction: (request: any) => Promise<TransactionResponse>;
  cancelTransaction: (transactionId: string) => Promise<boolean>;
  accelerateTransaction: (transactionId: string) => Promise<boolean>;
}

export function useRealTimeWallet(options: UseRealTimeWalletOptions = {}): UseRealTimeWalletReturn {
  const {
    walletId,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
  } = options;

  // Wallet state
  const [walletBalance, setWalletBalance] = useState<WalletBalance[]>([]);
  const [walletUpdate, setWalletUpdate] = useState<WalletUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transaction state
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [transactionUpdate, setTransactionUpdate] = useState<TransactionUpdate | null>(null);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');

  // WebSocket event handlers - use refs to avoid dependency issues
  const walletIdRef = useRef(walletId);
  walletIdRef.current = walletId;

  const handleWalletUpdate = useCallback((update: WalletUpdate) => {
    console.log('Wallet update received:', update);
    setWalletUpdate(update);
    
    // Update balance if it's for the current wallet
    if (!walletIdRef.current || update.walletId === walletIdRef.current) {
      setWalletBalance(update.balance);
    }
  }, []);

  const handleWalletBalanceUpdate = useCallback((update: WalletUpdate) => {
    console.log('Wallet balance update received:', update);
    setWalletUpdate(update);
    
    // Update balance if it's for the current wallet
    if (!walletIdRef.current || update.walletId === walletIdRef.current) {
      setWalletBalance(update.balance);
    }
  }, []);

  const handleTransactionUpdate = useCallback((update: TransactionUpdate) => {
    console.log('Transaction update received:', update);
    setTransactionUpdate(update);
    
    // Update transactions list if it's for the current wallet
    if (!walletIdRef.current || update.walletId === walletIdRef.current) {
      setTransactions(prev => {
        const existingIndex = prev.findIndex(tx => tx.id === update.transactionId);
        if (existingIndex >= 0) {
          // Update existing transaction
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            state: update.state,
            txHash: update.txHash,
            updatedAt: update.updatedAt,
          };
          return updated;
        } else {
          // Add new transaction
          return [{
            id: update.transactionId,
            state: update.state,
            txHash: update.txHash,
            amount: update.amount,
            destinationAddress: update.destinationAddress,
            tokenId: update.tokenId,
            walletId: update.walletId,
            note: update.note,
            fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
            createdAt: update.updatedAt,
            updatedAt: update.updatedAt,
          }, ...prev];
        }
      });
    }
  }, []);

  const handleRecentTransactions = useCallback((data: { walletId: string; transactions: TransactionUpdate[] }) => {
    console.log('Recent transactions received:', data);
    
    // Update transactions if it's for the current wallet
    if (!walletIdRef.current || data.walletId === walletIdRef.current) {
      const formattedTransactions: TransactionResponse[] = data.transactions.map(tx => ({
        id: tx.transactionId,
        state: tx.state,
        txHash: tx.txHash,
        amount: tx.amount,
        destinationAddress: tx.destinationAddress,
        tokenId: tx.tokenId,
        walletId: tx.walletId,
        note: tx.note,
        fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
        createdAt: tx.updatedAt,
        updatedAt: tx.updatedAt,
      }));
      
      setTransactions(formattedTransactions);
    }
  }, []);

  const handleConnectionStatus = useCallback((data: { connected: boolean }) => {
    setIsConnected(data.connected);
    setConnectionStatus(data.connected ? 'connected' : 'disconnected');
  }, []);

  const handleConnectionError = useCallback((data: { error: string }) => {
    setConnectionStatus('error');
    setError(data.error);
  }, []);

  const handleWalletError = useCallback((data: { error: string }) => {
    setError(data.error);
  }, []);

  const handleTransactionError = useCallback((data: { error: string }) => {
    setTransactionError(data.error);
  }, []);

  // Actions
  const refreshBalance = useCallback(async () => {
    if (!walletIdRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const balance = await transactionService.getWalletBalance(walletIdRef.current);
      setWalletBalance(balance);
      
      // Also trigger WebSocket refresh
      websocketService.refreshWalletBalance(walletIdRef.current);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh balance');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    if (!walletIdRef.current) return;
    
    setIsTransactionLoading(true);
    setTransactionError(null);
    
    try {
      const walletTransactions = await transactionService.getWalletTransactions(walletIdRef.current);
      setTransactions(walletTransactions);
    } catch (err) {
      setTransactionError(err instanceof Error ? err.message : 'Failed to refresh transactions');
    } finally {
      setIsTransactionLoading(false);
    }
  }, []);

  const checkTransactionStatus = useCallback((transactionId: string) => {
    websocketService.checkTransactionStatus(transactionId);
  }, []);

  const createTransaction = useCallback(async (request: any): Promise<TransactionResponse> => {
    setIsTransactionLoading(true);
    setTransactionError(null);
    
    try {
      const transaction = await transactionService.createTransaction(request);
      
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

  const cancelTransaction = useCallback(async (transactionId: string): Promise<boolean> => {
    try {
      const success = await transactionService.cancelTransaction(transactionId);
      
      if (success) {
        // Update transaction in list
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === transactionId 
              ? { ...tx, state: 'CANCELLED', updatedAt: new Date().toISOString() }
              : tx
          )
        );
      }
      
      return success;
    } catch (err) {
      setTransactionError(err instanceof Error ? err.message : 'Failed to cancel transaction');
      throw err;
    }
  }, []);

  const accelerateTransaction = useCallback(async (transactionId: string): Promise<boolean> => {
    try {
      const success = await transactionService.accelerateTransaction(transactionId);
      
      if (success) {
        // Update transaction in list
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === transactionId 
              ? { ...tx, state: 'QUEUED', updatedAt: new Date().toISOString() }
              : tx
          )
        );
      }
      
      return success;
    } catch (err) {
      setTransactionError(err instanceof Error ? err.message : 'Failed to accelerate transaction');
      throw err;
    }
  }, []);

  // Setup WebSocket listeners
  useEffect(() => {
    websocketService.on('wallet-updated', handleWalletUpdate);
    websocketService.on('wallet-balance-updated', handleWalletBalanceUpdate);
    websocketService.on('transaction-updated', handleTransactionUpdate);
    websocketService.on('transaction-status-updated', handleTransactionUpdate);
    websocketService.on('recent-transactions', handleRecentTransactions);
    websocketService.on('connected', handleConnectionStatus);
    websocketService.on('disconnected', handleConnectionStatus);
    websocketService.on('connection-error', handleConnectionError);
    websocketService.on('wallet-error', handleWalletError);
    websocketService.on('transaction-error', handleTransactionError);

    return () => {
      websocketService.off('wallet-updated', handleWalletUpdate);
      websocketService.off('wallet-balance-updated', handleWalletBalanceUpdate);
      websocketService.off('transaction-updated', handleTransactionUpdate);
      websocketService.off('transaction-status-updated', handleTransactionUpdate);
      websocketService.off('recent-transactions', handleRecentTransactions);
      websocketService.off('connected', handleConnectionStatus);
      websocketService.off('disconnected', handleConnectionStatus);
      websocketService.off('connection-error', handleConnectionError);
      websocketService.off('wallet-error', handleWalletError);
      websocketService.off('transaction-error', handleTransactionError);
    };
  }, [
    handleWalletUpdate,
    handleWalletBalanceUpdate,
    handleTransactionUpdate,
    handleRecentTransactions,
    handleConnectionStatus,
    handleConnectionError,
    handleWalletError,
    handleTransactionError,
  ]);

  // Initial data load
  useEffect(() => {
    if (walletId) {
      refreshBalance();
      refreshTransactions();
    }
  }, [walletId]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !walletId) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, walletId, refreshInterval]);

  return {
    // Wallet data
    walletBalance,
    walletUpdate,
    isLoading,
    error,

    // Transaction data
    transactions,
    transactionUpdate,
    isTransactionLoading,
    transactionError,

    // Connection status
    isConnected,
    connectionStatus,

    // Actions
    refreshBalance,
    refreshTransactions,
    checkTransactionStatus,
    createTransaction,
    cancelTransaction,
    accelerateTransaction,
  };
}
