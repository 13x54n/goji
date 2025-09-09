import express from 'express';
import { walletService } from '../services/walletService';

const router = express.Router();

// Get all wallets (for demo purposes)
router.get('/wallets', async (req, res) => {
  try {
    const wallets = await walletService.getAllWallets();
    
    res.json({
      success: true,
      data: wallets,
      count: wallets.length
    });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallets',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get wallets for specific user by email
router.get('/wallets/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const wallets = await walletService.getWalletsForUser(email);
    
    res.json({
      success: true,
      data: wallets,
      count: wallets.length,
      userEmail: email
    });
  } catch (error) {
    console.error('Error fetching wallets for user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallets for user',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific wallet by ID
router.get('/wallets/:walletId', async (req, res) => {
  try {
    const { walletId } = req.params;
    
    const wallet = await walletService.getWalletById(walletId);
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found',
        message: `Wallet with ID ${walletId} not found`
      });
    }
    
    res.json({
      success: true,
      data: wallet
    });
  } catch (error) {
    console.error('Error fetching wallet by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get wallet token balances
router.get('/wallets/:walletId/tokens', async (req, res) => {
  try {
    const { walletId } = req.params;
    
    const wallet = await walletService.getWalletById(walletId);
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found',
        message: `Wallet with ID ${walletId} not found`
      });
    }
    
    res.json({
      success: true,
      data: {
        walletId: wallet.id,
        tokenBalances: wallet.tokenBalances,
        totalUSDValue: wallet.totalUSDValue
      }
    });
  } catch (error) {
    console.error('Error fetching wallet token balances:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet token balances',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
