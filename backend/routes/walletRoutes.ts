import express from 'express';
import User from '../models/User';
import Wallet from '../models/Wallet';
import { QRCodeService } from '../services/qrCodeService';

const router = express.Router();

// Get all user wallets grouped by blockchain
router.get('/wallets', async (req, res) => {
  try {
    // For demo purposes, get the first user or create a test user
    let user = await User.findOne().populate('wallets');
    
    if (!user) {
      return res.status(404).json({ error: 'No users found' });
    }

    // Group wallets by blockchain
    const walletsByBlockchain: { [key: string]: any[] } = {};
    
    if (user.wallets) {
      for (const wallet of user.wallets) {
        const blockchain = (wallet as any).blockchain;
        if (!walletsByBlockchain[blockchain]) {
          walletsByBlockchain[blockchain] = [];
        }
        walletsByBlockchain[blockchain].push(wallet);
      }
    }

    res.json({
      success: true,
      wallets: walletsByBlockchain,
      totalWallets: user.wallets?.length || 0
    });

  } catch (error) {
    console.error('Error fetching user wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

// Get wallet address for specific blockchain
router.get('/address/:blockchain', async (req, res) => {
  try {
    const { blockchain } = req.params;
    
    const wallet = await Wallet.findOne({ 
      blockchain: blockchain.toUpperCase() 
    });

    if (!wallet) {
      return res.status(404).json({ 
        error: `No wallet found for blockchain: ${blockchain}` 
      });
    }

    // Generate QR code URL if not exists or if it contains localhost
    let qrCodeUrl = wallet.qrCodeUrl;
    if (!qrCodeUrl || qrCodeUrl.includes('localhost:4000')) {
      try {
        qrCodeUrl = await QRCodeService.generateQRCode(wallet.address, wallet.blockchain);
        // Update wallet with QR code URL
        await Wallet.findByIdAndUpdate(wallet._id, { qrCodeUrl });
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
        // Fallback to data URL
        qrCodeUrl = await QRCodeService.generateQRCodeDataURL(wallet.address);
      }
    }

    res.json({
      success: true,
      wallet: {
        id: wallet.id,
        address: wallet.address,
        blockchain: wallet.blockchain,
        accountType: wallet.accountType,
        state: wallet.state,
        qrCodeUrl
      }
    });

  } catch (error) {
    console.error('Error fetching wallet address:', error);
    res.status(500).json({ error: 'Failed to fetch wallet address' });
  }
});

// Get available blockchains for user
router.get('/blockchains', async (req, res) => {
  try {
    const wallets = await Wallet.find();
    
    const blockchains = wallets.map(wallet => ({
      blockchain: wallet.blockchain,
      accountType: wallet.accountType,
      state: wallet.state,
      hasWallet: true
    }));

    // Define all supported blockchains
    const supportedBlockchains = [
      { blockchain: 'ARB-SEPOLIA', name: 'Arbitrum Sepolia', type: 'Ethereum L2' },
      { blockchain: 'AVAX-FUJI', name: 'Avalanche Fuji', type: 'EVM' },
      { blockchain: 'BASE-SEPOLIA', name: 'Base Sepolia', type: 'Ethereum L2' },
      { blockchain: 'ETH-SEPOLIA', name: 'Ethereum Sepolia', type: 'Ethereum' },
      { blockchain: 'OP-SEPOLIA', name: 'Optimism Sepolia', type: 'Ethereum L2' },
      { blockchain: 'UNI-SEPOLIA', name: 'Uniswap Sepolia', type: 'Ethereum L2' },
      { blockchain: 'MATIC-AMOY', name: 'Polygon Amoy', type: 'Ethereum L2' },
      { blockchain: 'SOL-DEVNET', name: 'Solana Devnet', type: 'Solana' },
      { blockchain: 'APTOS-TESTNET', name: 'Aptos Testnet', type: 'Aptos' }
    ];

    const availableBlockchains = supportedBlockchains.map(supported => {
      const userWallet = blockchains.find(w => w.blockchain === supported.blockchain);
      return {
        ...supported,
        hasWallet: !!userWallet,
        accountType: userWallet?.accountType,
        state: userWallet?.state
      };
    });

    res.json({
      success: true,
      blockchains: availableBlockchains,
      userBlockchains: blockchains
    });

  } catch (error) {
    console.error('Error fetching blockchains:', error);
    res.status(500).json({ error: 'Failed to fetch blockchains' });
  }
});

export default router;
