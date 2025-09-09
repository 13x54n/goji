import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import express from 'express';
import { walletMonitoringService } from '../index';
import Wallet from '../models/Wallet';
import { QRCodeService } from '../services/qrCodeService';
import { TransactionService } from '../services/transactionService';

const router = express.Router();

// Get all user wallets grouped by blockchain
router.get('/user/:userId', async (req, res) => {
  try {
    let wallets = await Wallet.find({ userId: req.params.userId });

    if (!wallets) {
      return res.status(404).json({ error: 'No wallets found' });
    }

    // Group wallets by blockchain
    const walletsByBlockchain: { [key: string]: any[] } = {};

    if (wallets) {
      for (const wallet of wallets) {
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
      totalWallets: wallets?.length || 0
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

// Create a new transaction
router.post('/transactions', async (req, res) => {
  try {
    const { walletId, tokenId, destinationAddress, amount, note, feeLevel } = req.body;
    const userId = req.headers['user-id'] as string; // This should come from auth middleware

    // Validate required fields
    if (!walletId || !tokenId || !destinationAddress || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: walletId, tokenId, destinationAddress, amount'
      });
    }

    // Validate address
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const isValidAddress = await TransactionService.validateAddress(destinationAddress, wallet.blockchain);
    if (!isValidAddress) {
      return res.status(400).json({ error: 'Invalid destination address for this blockchain' });
    }

    // Create transaction
    const transaction = await TransactionService.createTransaction({
      walletId,
      tokenId,
      destinationAddress,
      amount,
      note,
      feeLevel
    });

    // Broadcast transaction update
    if (userId) {
      await walletMonitoringService.broadcastTransactionUpdate(transaction.id, userId);
    }

    res.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get transaction by ID
router.get('/transactions/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { includeTokenDetails = 'true' } = req.query;

    const transaction = await TransactionService.getTransaction(
      transactionId, 
      includeTokenDetails === 'true'
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// List transactions for a wallet
router.get('/wallets/:walletId/transactions', async (req, res) => {
  try {
    const { walletId } = req.params;
    const { limit = 50, includeTokenDetails = 'true' } = req.query;

    const transactions = await TransactionService.listTransactions(
      [walletId], 
      Number(limit), 
      includeTokenDetails === 'true'
    );

    res.json({
      success: true,
      transactions,
      count: transactions.length
    });

  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ error: 'Failed to fetch wallet transactions' });
  }
});

// Get wallet balance
router.get('/wallets/:userId/balance', async (req, res) => {
  try {
    let wallets = await Wallet.find({ userId: req.params.userId });
    
    // If no wallets found for user, return all wallets for testing
    if (!wallets || wallets.length === 0) {
      console.log('No wallets found for user, returning all wallets for testing');
      wallets = await Wallet.find({});
    }
    
    if (!wallets || wallets.length === 0) {
      return res.status(404).json({ error: 'No wallets found' });
    }

    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY || '',
      entitySecret: process.env.CIRCLE_ENTITY_SECRET || '',
    });

    // Fetch token balances for all wallets in the set using Circle API
    const walletTokenData = [];

    for (const wallet of wallets) {
      try {
        // Use Circle API to get token balances for this wallet
        const response = await client.getWalletTokenBalance({
          id: wallet.id,
          includeAll: true, // Include all tokens
          pageSize: 50 // Circle API limit
        });

        if (response.data?.tokenBalances) {
          // Add wallet context to each token balance
          const tokenBalancesWithWallet = response.data.tokenBalances.map((token: any) => ({
            ...token,
            walletId: wallet.id,
            walletAddress: wallet.address,
            blockchain: wallet.blockchain,
            walletSetId: wallet.walletSetId,
            accountType: wallet.accountType
          }));

          walletTokenData.push({
            walletId: wallet.id,
            walletAddress: wallet.address,
            blockchain: wallet.blockchain,
            accountType: wallet.accountType,
            tokenCount: response.data.tokenBalances.length,
            tokenBalances: tokenBalancesWithWallet
          });
        } else {
          // No tokens found for this wallet
          walletTokenData.push({
            walletId: wallet.id,
            walletAddress: wallet.address,
            blockchain: wallet.blockchain,
            accountType: wallet.accountType,
            tokenCount: 0,
            tokenBalances: []
          });
        }
      } catch (error) {
        console.error(`Error fetching tokens for wallet ${wallet.id}:`, error);
        // Add error info but continue with other wallets
        walletTokenData.push({
          walletId: wallet.id,
          walletAddress: wallet.address,
          blockchain: wallet.blockchain,
          accountType: wallet.accountType,
          tokenCount: 0,
          tokenBalances: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.status(200).json({
      success: true,
      walletData: walletTokenData,
    });

  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
});

// Get all tokens for a specific wallet set
router.get('/wallet-set/:walletSetId/tokens', async (req, res) => {
  try {
    const { walletSetId } = req.params;

    // Find all wallets with this walletSetId
    const wallets = await Wallet.find({ walletSetId });

    if (!wallets || wallets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No wallets found for this wallet set'
      });
    }

    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY || '',
      entitySecret: process.env.CIRCLE_ENTITY_SECRET || '',
    });

    // Fetch token balances for all wallets in the set
    const walletTokenData = [];

    for (const wallet of wallets) {
      try {
        const response = await client.getWalletTokenBalance({
          id: wallet.id,
          includeAll: true,
          pageSize: 50
        });

        if (response.data?.tokenBalances) {
          const tokenBalancesWithWallet = response.data.tokenBalances.map((token: any) => ({
            ...token,
            walletId: wallet.id,
            walletAddress: wallet.address,
            blockchain: wallet.blockchain,
            walletSetId: wallet.walletSetId,
            accountType: wallet.accountType
          }));

          walletTokenData.push({
            walletId: wallet.id,
            walletAddress: wallet.address,
            blockchain: wallet.blockchain,
            accountType: wallet.accountType,
            tokenCount: response.data.tokenBalances.length,
            tokenBalances: tokenBalancesWithWallet
          });
        } else {
          walletTokenData.push({
            walletId: wallet.id,
            walletAddress: wallet.address,
            blockchain: wallet.blockchain,
            accountType: wallet.accountType,
            tokenCount: 0,
            tokenBalances: []
          });
        }
      } catch (error) {
        console.error(`Error fetching tokens for wallet ${wallet.id}:`, error);
        walletTokenData.push({
          walletId: wallet.id,
          walletAddress: wallet.address,
          blockchain: wallet.blockchain,
          accountType: wallet.accountType,
          tokenCount: 0,
          tokenBalances: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const totalTokens = walletTokenData.reduce((sum, wallet) => sum + wallet.tokenCount, 0);
    const allTokenBalances = walletTokenData.flatMap(wallet => wallet.tokenBalances);

    res.json({
      success: true,
      walletSetId: walletSetId,
      totalWallets: wallets.length,
      totalTokens: totalTokens,
      walletData: walletTokenData,
      allTokenBalances: allTokenBalances
    });

  } catch (error) {
    console.error('Error fetching wallet set tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet set tokens'
    });
  }
});

// Estimate transfer fee
router.post('/transactions/estimate-fee', async (req, res) => {
  try {
    const { tokenId, amount, destinationAddress, walletId } = req.body;

    if (!tokenId || !amount || !destinationAddress) {
      return res.status(400).json({
        error: 'Missing required fields: tokenId, amount, destinationAddress'
      });
    }

    const feeEstimate = await TransactionService.estimateTransferFee(
      tokenId,
      amount,
      destinationAddress,
      walletId
    );

    res.json({
      success: true,
      feeEstimate
    });

  } catch (error) {
    console.error('Error estimating transfer fee:', error);
    res.status(500).json({ error: 'Failed to estimate transfer fee' });
  }
});

// Cancel transaction
router.post('/transactions/:transactionId/cancel', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.headers['user-id'] as string;

    const success = await TransactionService.cancelTransaction(transactionId);

    if (success) {
      // Broadcast transaction update
      if (userId) {
        await walletMonitoringService.broadcastTransactionUpdate(transactionId, userId);
      }

      res.json({
        success: true,
        message: 'Transaction cancelled successfully'
      });
    } else {
      res.status(400).json({ error: 'Failed to cancel transaction' });
    }

  } catch (error) {
    console.error('Error cancelling transaction:', error);
    res.status(500).json({ error: 'Failed to cancel transaction' });
  }
});

// Accelerate transaction
router.post('/transactions/:transactionId/accelerate', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.headers['user-id'] as string;

    const success = await TransactionService.accelerateTransaction(transactionId);

    if (success) {
      // Broadcast transaction update
      if (userId) {
        await walletMonitoringService.broadcastTransactionUpdate(transactionId, userId);
      }

      res.json({
        success: true,
        message: 'Transaction accelerated successfully'
      });
    } else {
      res.status(400).json({ error: 'Failed to accelerate transaction' });
    }

  } catch (error) {
    console.error('Error accelerating transaction:', error);
    res.status(500).json({ error: 'Failed to accelerate transaction' });
  }
});

// Get available tokens for a blockchain
router.get('/tokens/:blockchain', async (req, res) => {
  try {
    const { blockchain } = req.params;

    const tokens = await TransactionService.getAvailableTokens(blockchain);

    res.json({
      success: true,
      tokens,
      blockchain
    });

  } catch (error) {
    console.error('Error fetching available tokens:', error);
    res.status(500).json({ error: 'Failed to fetch available tokens' });
  }
});

// Validate address
router.post('/validate-address', async (req, res) => {
  try {
    const { address, blockchain } = req.body;

    if (!address || !blockchain) {
      return res.status(400).json({
        error: 'Missing required fields: address, blockchain'
      });
    }

    const isValid = await TransactionService.validateAddress(address, blockchain);

    res.json({
      success: true,
      isValid,
      address,
      blockchain
    });

  } catch (error) {
    console.error('Error validating address:', error);
    res.status(500).json({ error: 'Failed to validate address' });
  }
});

export default router;
