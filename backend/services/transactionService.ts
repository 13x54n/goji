import { v4 as uuidv4 } from 'uuid';
import { client } from '../utils/circleWalletClient';

export interface TransactionRequest {
  walletId: string;
  tokenId: string;
  destinationAddress: string;
  amount: string;
  note?: string;
  feeLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TransactionResponse {
  id: string;
  state: string;
  txHash?: string;
  amount: string;
  destinationAddress: string;
  tokenId: string;
  walletId: string;
  note?: string;
  fee: {
    type: string;
    config: {
      feeLevel: string;
    };
  };
  createdAt: string;
  updatedAt: string;
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

export interface WalletBalance {
  tokenId: string;
  amount: string;
  tokenAddress?: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenStandard?: string;
  blockchain?: string;
}

export interface FeeEstimate {
  fee: string;
  feeLevel: string;
  estimatedTime: string;
}

export class TransactionService {
  /**
   * Get token details by ID
   */
  static async getTokenDetails(tokenId: string): Promise<any> {
    try {
      const response = await client.getToken({
        id: tokenId
      });
      
      return response.data?.token || null;
    } catch (error) {
      console.error('Error fetching token details:', error);
      return null;
    }
  }

  /**
   * Enrich transactions with token details
   */
  static async enrichTransactionsWithTokenDetails(transactions: TransactionResponse[]): Promise<TransactionResponse[]> {
    try {
      // Get unique token IDs from transactions
      const tokenIds = [...new Set(transactions.map(tx => tx.tokenId).filter(Boolean))];
      
      // Fetch token details for all unique tokens
      const tokenDetailsPromises = tokenIds.map(async (tokenId) => {
        const tokenDetails = await this.getTokenDetails(tokenId);
        return { tokenId, tokenDetails };
      });
      
      const tokenDetailsMap = new Map();
      const tokenDetailsResults = await Promise.all(tokenDetailsPromises);
      
      tokenDetailsResults.forEach(({ tokenId, tokenDetails }) => {
        if (tokenDetails) {
          tokenDetailsMap.set(tokenId, tokenDetails);
        }
      });
      
      // Enrich transactions with token details
      return transactions.map(transaction => ({
        ...transaction,
        tokenDetails: tokenDetailsMap.get(transaction.tokenId) || null
      }));
    } catch (error) {
      console.error('Error enriching transactions with token details:', error);
      return transactions; // Return original transactions if enrichment fails
    }
  }

  /**
   * Create a new transaction
   */
  static async createTransaction(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      const idempotencyKey = uuidv4();
      
      const response = await client.createTransaction({
        amounts: [request.amount],
        destinationAddress: request.destinationAddress,
        tokenId: request.tokenId,
        walletId: request.walletId,
        fee: { 
          type: 'level', 
          config: { 
            feeLevel: request.feeLevel || 'MEDIUM' 
          } 
        },
        idempotencyKey
      });

      return {
        id: response.data?.id || '',
        state: response.data?.state || 'INITIATED',
        txHash: response.data?.txHash,
        amount: request.amount,
        destinationAddress: request.destinationAddress,
        tokenId: request.tokenId,
        walletId: request.walletId,
        note: request.note,
        fee: {
          type: 'level',
          config: {
            feeLevel: request.feeLevel || 'MEDIUM'
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error(`Failed to create transaction: ${error}`);
    }
  }

  /**
   * Get wallet token balance
   */
  static async getWalletBalance(walletId: string): Promise<WalletBalance[]> {
    try {
      const response = await client.getWalletTokenBalance({
        id: walletId,
        includeAll: true
      });

      return response.data?.tokenBalances?.map((balance: any) => ({
        tokenId: balance.tokenId || '',
        amount: balance.amount || '0',
        tokenAddress: balance.tokenAddress,
        tokenName: balance.tokenName,
        tokenSymbol: balance.tokenSymbol,
        tokenStandard: balance.tokenStandard,
        blockchain: balance.blockchain
      })) || [];
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw new Error(`Failed to fetch wallet balance: ${error}`);
    }
  }

  /**
   * Estimate transfer fee
   */
  static async estimateTransferFee(
    tokenId: string,
    amount: string,
    destinationAddress: string,
    walletId?: string
  ): Promise<FeeEstimate> {
    try {
      const response = await client.estimateTransferFee({
        tokenId,
        amount: [amount],
        destinationAddress,
        walletId
      });

      return {
        fee: response.data?.fee || '0',
        feeLevel: 'MEDIUM',
        estimatedTime: '2-5 minutes'
      };
    } catch (error) {
      console.error('Error estimating transfer fee:', error);
      throw new Error(`Failed to estimate transfer fee: ${error}`);
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransaction(transactionId: string, includeTokenDetails: boolean = true): Promise<TransactionResponse | null> {
    try {
      const response = await client.getTransaction({
        id: transactionId
      });

      const transaction = response.data?.transaction;
      if (!transaction) return null;

      const transactionData = {
        id: transaction.id || '',
        state: transaction.state || 'UNKNOWN',
        txHash: transaction.txHash,
        amount: transaction.amounts?.[0] || '0',
        destinationAddress: transaction.destinationAddress || '',
        tokenId: transaction.tokenId || '',
        walletId: transaction.walletId || '',
        note: transaction.note,
        fee: transaction.fee || { type: 'level', config: { feeLevel: 'MEDIUM' } },
        createdAt: transaction.createdAt || new Date().toISOString(),
        updatedAt: transaction.updatedAt || new Date().toISOString()
      };

      // Enrich with token details if requested
      if (includeTokenDetails && transactionData.tokenId) {
        const tokenDetails = await this.getTokenDetails(transactionData.tokenId);
        return {
          ...transactionData,
          tokenDetails
        };
      }

      return transactionData;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw new Error(`Failed to fetch transaction: ${error}`);
    }
  }

  /**
   * List transactions for a wallet
   */
  static async listTransactions(walletIds: string[], limit: number = 50, includeTokenDetails: boolean = true): Promise<TransactionResponse[]> {
    try {
      const response = await client.listTransactions({
        walletIds,
        pageSize: limit
      });

      const transactions = response.data?.transactions?.map((transaction: any) => ({
        id: transaction.id || '',
        state: transaction.state || 'UNKNOWN',
        txHash: transaction.txHash,
        amount: transaction.amounts?.[0] || '0',
        destinationAddress: transaction.destinationAddress || '',
        tokenId: transaction.tokenId || '',
        walletId: transaction.walletId || '',
        note: transaction.note,
        fee: transaction.fee || { type: 'level', config: { feeLevel: 'MEDIUM' } },
        createdAt: transaction.createdAt || new Date().toISOString(),
        updatedAt: transaction.updatedAt || new Date().toISOString()
      })) || [];

      // Enrich with token details if requested
      if (includeTokenDetails && transactions.length > 0) {
        return await this.enrichTransactionsWithTokenDetails(transactions);
      }

      return transactions;
    } catch (error) {
      console.error('Error listing transactions:', error);
      throw new Error(`Failed to list transactions: ${error}`);
    }
  }

  /**
   * Cancel a transaction
   */
  static async cancelTransaction(transactionId: string): Promise<boolean> {
    try {
      const response = await client.cancelTransaction({
        id: transactionId,
        idempotencyKey: uuidv4()
      });

      return response.data?.id === transactionId;
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      throw new Error(`Failed to cancel transaction: ${error}`);
    }
  }

  /**
   * Accelerate a transaction
   */
  static async accelerateTransaction(transactionId: string): Promise<boolean> {
    try {
      const response = await client.accelerateTransaction({
        id: transactionId,
        idempotencyKey: uuidv4()
      });

      return response.data?.id === transactionId;
    } catch (error) {
      console.error('Error accelerating transaction:', error);
      throw new Error(`Failed to accelerate transaction: ${error}`);
    }
  }

  /**
   * Validate an address for a specific blockchain
   */
  static async validateAddress(address: string, blockchain: string): Promise<boolean> {
    try {
      const response = await client.validateAddress({
        address,
        blockchain: blockchain as any
      });

      return response.data?.isValid || false;
    } catch (error) {
      console.error('Error validating address:', error);
      return false;
    }
  }

  /**
   * Get available tokens for a blockchain
   */
  static async getAvailableTokens(blockchain: string): Promise<any[]> {
    try {
      // This would typically come from Circle's token list API
      // For now, we'll return common tokens for each blockchain
      const commonTokens: { [key: string]: any[] } = {
        'ETH-SEPOLIA': [
          {
            id: 'eth-sepolia-native',
            symbol: 'ETH',
            name: 'Ethereum',
            address: '',
            standard: 'Fungible',
            blockchain: 'ETH-SEPOLIA'
          }
        ],
        'ARB-SEPOLIA': [
          {
            id: 'arb-sepolia-native',
            symbol: 'ETH',
            name: 'Ethereum',
            address: '',
            standard: 'Fungible',
            blockchain: 'ARB-SEPOLIA'
          }
        ],
        'BASE-SEPOLIA': [
          {
            id: 'base-sepolia-native',
            symbol: 'ETH',
            name: 'Ethereum',
            address: '',
            standard: 'Fungible',
            blockchain: 'BASE-SEPOLIA'
          }
        ],
        'SOL-DEVNET': [
          {
            id: 'sol-devnet-native',
            symbol: 'SOL',
            name: 'Solana',
            address: '',
            standard: 'Fungible',
            blockchain: 'SOL-DEVNET'
          }
        ]
      };

      return commonTokens[blockchain] || [];
    } catch (error) {
      console.error('Error fetching available tokens:', error);
      return [];
    }
  }
}
