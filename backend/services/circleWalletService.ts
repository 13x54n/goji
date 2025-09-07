import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

// Circle SDK Client
const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || '',
  entitySecret: process.env.CIRCLE_ENTITY_SECRET || '',
});

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

class CircleWalletService {
  private static instance: CircleWalletService;
  private wallets: Map<string, WalletInfo> = new Map();
  private tokenBalances: Map<string, TokenBalance[]> = new Map();

  static getInstance(): CircleWalletService {
    if (!CircleWalletService.instance) {
      CircleWalletService.instance = new CircleWalletService();
    }
    return CircleWalletService.instance;
  }

  // Get all wallets for the user
  async getWallets(): Promise<WalletInfo[]> {
    try {
      // For now, we'll use a mock wallet ID - in production this would come from user's account
      const mockWalletId = 'a635d679-4207-4e37-b12e-766afb9b3892';
      
      const walletInfo = await this.getWalletInfo(mockWalletId);
      return [walletInfo];
    } catch (error) {
      console.error('Error fetching wallets:', error);
      return [];
    }
  }

  // Get wallet information including token balances
  async getWalletInfo(walletId: string): Promise<WalletInfo> {
    try {
      // Get token balances for the wallet
      const response = await client.getWalletTokenBalance({
        id: walletId,
        includeAll: true,
        pageSize: 100
      });

      const tokenBalances: TokenBalance[] = response.data?.tokenBalances?.map((balance: any) => ({
        tokenId: balance.tokenId,
        tokenName: balance.tokenName || 'Unknown Token',
        tokenSymbol: balance.tokenSymbol || 'UNKNOWN',
        amount: balance.amount,
        blockchain: balance.blockchain,
        tokenAddress: balance.tokenAddress,
        standard: balance.standard,
        imageUrl: this.getTokenImageUrl(balance.tokenSymbol, balance.blockchain)
      })) || [];

      // Calculate total USD value (simplified - in production you'd use real price data)
      const totalUSDValue = tokenBalances.reduce((total, token) => {
        const amount = parseFloat(token.amount);
        const price = this.getMockTokenPrice(token.tokenSymbol);
        return total + (amount * price);
      }, 0);

      const walletInfo: WalletInfo = {
        id: walletId,
        name: `Wallet ${walletId.slice(-8)}`,
        blockchain: 'ETH', // Default blockchain
        address: `0x${walletId.replace(/-/g, '')}`, // Mock address
        tokenBalances,
        totalUSDValue
      };

      this.wallets.set(walletId, walletInfo);
      this.tokenBalances.set(walletId, tokenBalances);

      return walletInfo;
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      throw error;
    }
  }

  // Get token balances for a specific wallet
  async getWalletTokenBalances(walletId: string): Promise<TokenBalance[]> {
    try {
      const response = await client.getWalletTokenBalance({
        id: walletId,
        includeAll: true,
        pageSize: 100
      });

      const tokenBalances: TokenBalance[] = response.data?.tokenBalances?.map((balance: any) => ({
        tokenId: balance.tokenId,
        tokenName: balance.tokenName || 'Unknown Token',
        tokenSymbol: balance.tokenSymbol || 'UNKNOWN',
        amount: balance.amount,
        blockchain: balance.blockchain,
        tokenAddress: balance.tokenAddress,
        standard: balance.standard,
        imageUrl: this.getTokenImageUrl(balance.tokenSymbol, balance.blockchain)
      })) || [];

      this.tokenBalances.set(walletId, tokenBalances);
      return tokenBalances;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      throw error;
    }
  }

  // Get transactions for a wallet
  async getWalletTransactions(walletId: string): Promise<TransactionInfo[]> {
    try {
      const response = await client.listTransactions({
        walletIds: [walletId],
        pageSize: 50
      });

      const transactions: TransactionInfo[] = response.data?.transactions?.map((tx: any) => ({
        id: tx.id,
        state: tx.state,
        txHash: tx.txHash,
        amount: tx.amount?.[0] || '0',
        destinationAddress: tx.destinationAddress || '',
        tokenId: tx.tokenId || '',
        walletId: tx.walletId || walletId,
        note: tx.note,
        fee: tx.fee || { type: 'level', config: { feeLevel: 'MEDIUM' } },
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt
      })) || [];

      return transactions;
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
      const response = await client.createTransaction({
        walletId: params.walletId,
        tokenId: params.tokenId,
        amounts: [params.amount],
        destinationAddress: params.destinationAddress,
        fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
      });

      const transaction: TransactionInfo = {
        id: response.data?.id || '',
        state: response.data?.state || 'INITIATED',
        txHash: response.data?.txHash,
        amount: params.amount,
        destinationAddress: params.destinationAddress,
        tokenId: params.tokenId,
        walletId: params.walletId,
        note: params.note,
        fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Estimate transfer fee
  async estimateTransferFee(params: {
    tokenId: string;
    amount: string;
    destinationAddress: string;
    walletId?: string;
  }): Promise<{ fee: string; feeLevel: string }> {
    try {
      const response = await client.estimateTransferFee({
        tokenId: params.tokenId,
        amount: [params.amount],
        destinationAddress: params.destinationAddress,
        walletId: params.walletId
      });

      return {
        fee: response.data?.fee || '0',
        feeLevel: 'MEDIUM'
      };
    } catch (error) {
      console.error('Error estimating fee:', error);
      throw error;
    }
  }

  // Validate address
  async validateAddress(address: string, blockchain: string): Promise<boolean> {
    try {
      const response = await client.validateAddress({
        address,
        blockchain
      });

      return response.data?.isValid || false;
    } catch (error) {
      console.error('Error validating address:', error);
      return false;
    }
  }

  // Get cached wallet info
  getCachedWalletInfo(walletId: string): WalletInfo | null {
    return this.wallets.get(walletId) || null;
  }

  // Get cached token balances
  getCachedTokenBalances(walletId: string): TokenBalance[] {
    return this.tokenBalances.get(walletId) || [];
  }

  // Mock token prices (in production, use real price API)
  private getMockTokenPrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'ETH': 2500,
      'BTC': 45000,
      'USDC': 1,
      'USDT': 1,
      'MATIC': 0.8,
      'AVAX': 25,
      'SOL': 100
    };
    return prices[symbol] || 1;
  }

  // Get token image URL
  private getTokenImageUrl(symbol: string, blockchain: string): string {
    const baseUrl = 'https://cryptologos.cc/logos';
    const symbolLower = symbol.toLowerCase();
    
    // Common token images
    const tokenImages: { [key: string]: string } = {
      'eth': `${baseUrl}/ethereum-eth-logo.png`,
      'btc': `${baseUrl}/bitcoin-btc-logo.png`,
      'usdc': `${baseUrl}/usd-coin-usdc-logo.png`,
      'usdt': `${baseUrl}/tether-usdt-logo.png`,
      'matic': `${baseUrl}/polygon-matic-logo.png`,
      'avax': `${baseUrl}/avalanche-avax-logo.png`,
      'sol': `${baseUrl}/solana-sol-logo.png`
    };

    return tokenImages[symbolLower] || `${baseUrl}/${symbolLower}-${symbolLower}-logo.png`;
  }
}

export const circleWalletService = CircleWalletService.getInstance();
