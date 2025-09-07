import { sessionService } from './sessionService';

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

export interface Token {
  id: string;
  symbol: string;
  name: string;
  address: string;
  standard: string;
  blockchain: string;
}

class TransactionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const session = sessionService.getSession();
    const headers = {
      'Content-Type': 'application/json',
      ...(session?.email && { 'user-id': session.email }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create a new transaction
   */
  async createTransaction(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      const response = await this.makeRequest('/api/wallets/transactions', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return response.transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<TransactionResponse | null> {
    try {
      const response = await this.makeRequest(`/api/wallets/transactions/${transactionId}`);
      return response.transaction;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * List transactions for a wallet
   */
  async getWalletTransactions(walletId: string, limit: number = 50): Promise<TransactionResponse[]> {
    try {
      const response = await this.makeRequest(`/api/wallets/wallets/${walletId}/transactions?limit=${limit}`);
      return response.transactions;
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(walletId: string): Promise<WalletBalance[]> {
    try {
      const response = await this.makeRequest(`/api/wallets/wallets/${walletId}/balance`);
      return response.balance;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  /**
   * Estimate transfer fee
   */
  async estimateTransferFee(
    tokenId: string,
    amount: string,
    destinationAddress: string,
    walletId?: string
  ): Promise<FeeEstimate> {
    try {
      const response = await this.makeRequest('/api/wallets/transactions/estimate-fee', {
        method: 'POST',
        body: JSON.stringify({
          tokenId,
          amount,
          destinationAddress,
          walletId,
        }),
      });

      return response.feeEstimate;
    } catch (error) {
      console.error('Error estimating transfer fee:', error);
      throw error;
    }
  }

  /**
   * Cancel transaction
   */
  async cancelTransaction(transactionId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/api/wallets/transactions/${transactionId}/cancel`, {
        method: 'POST',
      });

      return response.success;
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      throw error;
    }
  }

  /**
   * Accelerate transaction
   */
  async accelerateTransaction(transactionId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/api/wallets/transactions/${transactionId}/accelerate`, {
        method: 'POST',
      });

      return response.success;
    } catch (error) {
      console.error('Error accelerating transaction:', error);
      throw error;
    }
  }

  /**
   * Get available tokens for a blockchain
   */
  async getAvailableTokens(blockchain: string): Promise<Token[]> {
    try {
      const response = await this.makeRequest(`/api/wallets/tokens/${blockchain}`);
      return response.tokens;
    } catch (error) {
      console.error('Error fetching available tokens:', error);
      throw error;
    }
  }

  /**
   * Validate address
   */
  async validateAddress(address: string, blockchain: string): Promise<boolean> {
    try {
      const response = await this.makeRequest('/api/wallets/validate-address', {
        method: 'POST',
        body: JSON.stringify({
          address,
          blockchain,
        }),
      });

      return response.isValid;
    } catch (error) {
      console.error('Error validating address:', error);
      return false;
    }
  }

  /**
   * Get wallet address for specific blockchain
   */
  async getWalletAddress(blockchain: string): Promise<{
    id: string;
    address: string;
    blockchain: string;
    accountType: string;
    state: string;
    qrCodeUrl: string;
  }> {
    try {
      const response = await this.makeRequest(`/api/wallets/address/${blockchain}`);
      return response.wallet;
    } catch (error) {
      console.error('Error fetching wallet address:', error);
      throw error;
    }
  }

  /**
   * Get available blockchains
   */
  async getAvailableBlockchains(): Promise<{
    blockchain: string;
    name: string;
    type: string;
    hasWallet: boolean;
    accountType?: string;
    state?: string;
  }[]> {
    try {
      const response = await this.makeRequest('/api/wallets/blockchains');
      return response.blockchains;
    } catch (error) {
      console.error('Error fetching blockchains:', error);
      throw error;
    }
  }

  /**
   * Get user wallets grouped by blockchain
   */
  async getUserWallets(): Promise<{
    wallets: { [key: string]: any[] };
    totalWallets: number;
  }> {
    try {
      const response = await this.makeRequest('/api/wallets/wallets');
      return {
        wallets: response.wallets,
        totalWallets: response.totalWallets,
      };
    } catch (error) {
      console.error('Error fetching user wallets:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const transactionService = new TransactionService();
