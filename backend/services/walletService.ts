import User from '../models/User';
import Wallet from '../models/Wallet';

export interface WalletInfo {
  id: string;
  name: string;
  blockchain: string;
  address: string;
  tokenBalances: TokenBalance[];
  totalUSDValue: number;
  qrCodeUrl?: string;
}

export interface TokenBalance {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  amount: string;
  blockchain: string;
  tokenAddress?: string;
  standard?: string;
  imageUrl?: string;
}

export class WalletService {
  // Get all wallets for a specific user by email
  async getWalletsForUser(email: string): Promise<WalletInfo[]> {
    try {
      
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return [];
      }

      // Get all wallets for this user
      const userWallets = await Wallet.find({ userId: user._id });
      
      if (userWallets.length === 0) {
        return [];
      }

      // Convert to WalletInfo format
      const walletInfos = userWallets.map(wallet => this.createWalletInfo(wallet));

      return walletInfos;
    } catch (error) {
      console.error('Error fetching wallets for user:', error);
      return [];
    }
  }

  // Get all wallets (for demo purposes)
  async getAllWallets(): Promise<WalletInfo[]> {
    try {
      
      // Find the first user or create a demo user
      let user = await User.findOne();
      if (!user) {
        user = await this.createDemoUser();
      }

      // Get all wallets for this user
      const userWallets = await Wallet.find({ userId: user._id });
      
      if (userWallets.length === 0) {
        const demoWallet = await this.createDemoWallet(user._id);
        userWallets.push(demoWallet);
      }

      // Convert to WalletInfo format
      const walletInfos = userWallets.map(wallet => this.createWalletInfo(wallet));

      return walletInfos;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      return [];
    }
  }

  // Get specific wallet by ID
  async getWalletById(walletId: string): Promise<WalletInfo | null> {
    try {
      const wallet = await Wallet.findOne({ id: walletId });
      if (!wallet) {
        return null;
      }

      return this.createWalletInfo(wallet);
    } catch (error) {
      console.error('Error fetching wallet by ID:', error);
      return null;
    }
  }

  // Create WalletInfo from Wallet model
  private createWalletInfo(wallet: any): WalletInfo {
    return {
      id: wallet.id,
      name: `${wallet.blockchain} Wallet`,
      blockchain: wallet.blockchain,
      address: wallet.address,
      tokenBalances: this.getMockTokenBalances(wallet.blockchain),
      totalUSDValue: this.calculateMockUSDValue(wallet.blockchain),
      qrCodeUrl: wallet.qrCodeUrl
    };
  }

  // Get mock token balances based on blockchain
  private getMockTokenBalances(blockchain: string): TokenBalance[] {
    const baseTokens = [
      {
        tokenId: 'eth-1',
        tokenName: 'Ethereum',
        tokenSymbol: 'ETH',
        amount: '2.5',
        tokenAddress: '0x0000000000000000000000000000000000000000',
        standard: 'ERC20',
        imageUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
      },
      {
        tokenId: 'usdc-1',
        tokenName: 'USD Coin',
        tokenSymbol: 'USDC',
        amount: '1000.00',
        tokenAddress: '0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C',
        standard: 'ERC20',
        imageUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
      }
    ];

    return baseTokens.map(token => ({
      ...token,
      blockchain
    }));
  }

  // Calculate mock USD value
  private calculateMockUSDValue(blockchain: string): number {
    // Mock calculation: ETH = $2500, USDC = $1
    return (2.5 * 2500) + (1000 * 1);
  }

  // Create a demo user for testing
  private async createDemoUser() {
    const demoUser = new User({
      email: 'demo@goji.app',
      name: 'Demo User',
      isEmailVerified: true,
      hasPasskey: true
    });
    
    await demoUser.save();
    return demoUser;
  }

  // Create a demo wallet for testing
  private async createDemoWallet(userId: any) {
    const demoWallet = new Wallet({
      id: 'demo-wallet-1',
      state: 'LIVE',
      walletSetId: 'demo-wallet-set',
      custodyType: 'DEVELOPER',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      blockchain: 'ETH-SEPOLIA',
      accountType: 'SCA',
      userId: userId,
      qrCodeUrl: 'http://localhost:4000/qr-codes/demo-qr.png'
    });
    
    await demoWallet.save();
    return demoWallet;
  }
}

export const walletService = new WalletService();
