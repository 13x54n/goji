
export interface TokenBalance {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  amount: string;
  blockchain: string;
  tokenAddress?: string;
  standard: string;
  imageUrl?: string;
}

export interface WalletInfo {
  id: string;
  name: string;
  blockchain: string;
  address: string;
  tokenBalances: TokenBalance[];
  totalUSDValue: number;
}

export interface TransactionInfo {
  id: string;
  state: string;
  txHash?: string;
  amount: string;
  destinationAddress: string;
  tokenId: string;
  walletId: string;
  note?: string;
  fee: { type: string; config: { feeLevel: string } };
  createdAt: string;
  updatedAt: string;
}

class CircleWalletApiService {
  private static instance: CircleWalletApiService;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
  }

  static getInstance(): CircleWalletApiService {
    if (!CircleWalletApiService.instance) {
      CircleWalletApiService.instance = new CircleWalletApiService();
    }
    return CircleWalletApiService.instance;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Get all wallets
  async getWallets(): Promise<WalletInfo[]> {
    try {
      const response = await this.makeRequest<{ success: boolean; wallets: WalletInfo[] }>('/api/circle/wallets');
      return response.wallets;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error;
    }
  }

  // Get wallet info by ID
  async getWalletInfo(walletId: string): Promise<WalletInfo> {
    try {
      const response = await this.makeRequest<{ success: boolean; wallet: WalletInfo }>(`/api/circle/wallets/${walletId}`);
      return response.wallet;
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      throw error;
    }
  }

  // Get token balances for a wallet
  async getWalletTokenBalances(walletId: string): Promise<TokenBalance[]> {
    try {
      const response = await this.makeRequest<{ success: boolean; tokenBalances: TokenBalance[] }>(`/api/circle/wallets/${walletId}/balances`);
      return response.tokenBalances;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      throw error;
    }
  }

  // Get transactions for a wallet
  async getWalletTransactions(walletId: string): Promise<TransactionInfo[]> {
    try {
      const response = await this.makeRequest<{ success: boolean; transactions: TransactionInfo[] }>(`/api/circle/wallets/${walletId}/transactions`);
      return response.transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Create a transaction
  async createTransaction(params: {
    walletId: string;
    tokenId: string;
    amount: string;
    destinationAddress: string;
    note?: string;
  }): Promise<TransactionInfo> {
    try {
      const response = await this.makeRequest<{ success: boolean; transaction: TransactionInfo }>(
        `/api/circle/wallets/${params.walletId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            tokenId: params.tokenId,
            amount: params.amount,
            destinationAddress: params.destinationAddress,
            note: params.note
          })
        }
      );
      return response.transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Estimate transfer fee
  async estimateTransferFee(params: {
    walletId: string;
    tokenId: string;
    amount: string;
    destinationAddress: string;
  }): Promise<{ fee: string; feeLevel: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; feeEstimate: { fee: string; feeLevel: string } }>(
        `/api/circle/wallets/${params.walletId}/estimate-fee`,
        {
          method: 'POST',
          body: JSON.stringify({
            tokenId: params.tokenId,
            amount: params.amount,
            destinationAddress: params.destinationAddress
          })
        }
      );
      return response.feeEstimate;
    } catch (error) {
      console.error('Error estimating fee:', error);
      throw error;
    }
  }

  // Validate address
  async validateAddress(address: string, blockchain: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ success: boolean; isValid: boolean }>('/api/circle/validate-address', {
        method: 'POST',
        body: JSON.stringify({ address, blockchain })
      });
      return response.isValid;
    } catch (error) {
      console.error('Error validating address:', error);
      return false;
    }
  }
}

export const circleWalletApiService = CircleWalletApiService.getInstance();
