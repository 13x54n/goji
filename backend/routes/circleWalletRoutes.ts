import { Router } from 'express';
import { circleWalletService } from '../services/circleWalletService';

const router = Router();

// Get all wallets
router.get('/wallets', async (req, res) => {
  try {
    const wallets = await circleWalletService.getWallets();
    res.json({ success: true, wallets });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch wallets' 
    });
  }
});

// Get wallet info by ID
router.get('/wallets/:walletId', async (req, res) => {
  try {
    const { walletId } = req.params;
    const walletInfo = await circleWalletService.getWalletInfo(walletId);
    res.json({ success: true, wallet: walletInfo });
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch wallet info' 
    });
  }
});

// Get token balances for a wallet
router.get('/wallets/:walletId/balances', async (req, res) => {
  try {
    const { walletId } = req.params;
    const tokenBalances = await circleWalletService.getWalletTokenBalances(walletId);
    res.json({ success: true, tokenBalances });
  } catch (error) {
    console.error('Error fetching token balances:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch token balances' 
    });
  }
});

// Get transactions for a wallet
router.get('/wallets/:walletId/transactions', async (req, res) => {
  try {
    const { walletId } = req.params;
    const transactions = await circleWalletService.getWalletTransactions(walletId);
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch transactions' 
    });
  }
});

// Create a transaction
router.post('/wallets/:walletId/transactions', async (req, res) => {
  try {
    const { walletId } = req.params;
    const { tokenId, amount, destinationAddress, note } = req.body;

    if (!tokenId || !amount || !destinationAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tokenId, amount, destinationAddress'
      });
    }

    const transaction = await circleWalletService.createTransaction({
      walletId,
      tokenId,
      amount,
      destinationAddress,
      note
    });

    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create transaction' 
    });
  }
});

// Estimate transfer fee
router.post('/wallets/:walletId/estimate-fee', async (req, res) => {
  try {
    const { walletId } = req.params;
    const { tokenId, amount, destinationAddress } = req.body;

    if (!tokenId || !amount || !destinationAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tokenId, amount, destinationAddress'
      });
    }

    const feeEstimate = await circleWalletService.estimateTransferFee({
      walletId,
      tokenId,
      amount,
      destinationAddress
    });

    res.json({ success: true, feeEstimate });
  } catch (error) {
    console.error('Error estimating fee:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to estimate fee' 
    });
  }
});

// Validate address
router.post('/validate-address', async (req, res) => {
  try {
    const { address, blockchain } = req.body;

    if (!address || !blockchain) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: address, blockchain'
      });
    }

    const isValid = await circleWalletService.validateAddress(address, blockchain);
    res.json({ success: true, isValid });
  } catch (error) {
    console.error('Error validating address:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to validate address' 
    });
  }
});

export default router;
