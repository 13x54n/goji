import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import VerificationCode from '../models/VerificationCode';
import Wallet from '../models/Wallet';
import { generateVerificationCode, sendVerificationEmail } from '../services/emailService';
import { client } from '../utils/circleWalletClient';

const router = express.Router();

// Send verification code
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save verification code to database
    const verificationRecord = new VerificationCode({
      email: email.toLowerCase(),
      code: verificationCode,
      expiresAt,
    });

    await verificationRecord.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      // If email failed to send, delete the verification record
      await VerificationCode.findByIdAndDelete(verificationRecord._id);
      return res.status(500).json({
        error: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'Verification code sent successfully',
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Verify code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Email and verification code are required'
      });
    }

    // Find the verification code
    const verificationRecord = await VerificationCode.findOne({
      email: email.toLowerCase(),
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verificationRecord) {
      return res.status(400).json({
        error: 'Invalid or expired verification code'
      });
    }

    verificationRecord.isUsed = true;
    await verificationRecord.save();

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Create user first
      user = new User({
        email: email.toLowerCase(),
        isEmailVerified: true,
      });
    } else {
      user.isEmailVerified = true;
    }
    await user.save();

    // Check if user has any wallets in database
    const existingWallets = await Wallet.find({ userId: user._id });
    if (existingWallets.length === 0) {
      console.log('Creating wallets for user:', user.email);
      
      // Create wallet set
      const walletSetResponse = await client.createWalletSet({
        name: `${user._id}-${user.email}`
      });
      
      console.log('Wallet set created:', walletSetResponse.data?.walletSet?.id);

      // Create SCA wallets for multiple blockchains
      const walletsResponse = await client.createWallets({
        blockchains: ['ARB-SEPOLIA', 'AVAX-FUJI', 'BASE-SEPOLIA', 'ETH-SEPOLIA', 'OP-SEPOLIA', 'UNI-SEPOLIA', 'MATIC-AMOY'],
        count: 1,
        accountType: "SCA",
        walletSetId: walletSetResponse.data?.walletSet?.id ?? '',
        metadata: [{
          name: `${user.email}`,
          refId: `${user._id}`,
        }]
      });

      // Create EOA wallet for Solana
      const solanaResponse = await client.createWallets({
        accountType: "EOA",
        blockchains: ["SOL-DEVNET", 'APTOS-TESTNET'],
        count: 1,
        walletSetId: walletSetResponse.data?.walletSet?.id ?? '',
        metadata: [{
          name: `${user.email}`,
          refId: `${user._id}`,
        }]
      });

      // Save SCA wallets to database
      if (walletsResponse.data?.wallets) {
        console.log('Saving SCA wallets:', walletsResponse.data.wallets.length);
        for (const walletData of walletsResponse.data.wallets) {
          try {
            // Check if wallet already exists for this address and blockchain combination
            const existingWallet = await Wallet.findOne({ 
              address: walletData.address, 
              blockchain: walletData.blockchain 
            });
            if (existingWallet) {
              console.log('Wallet already exists:', walletData.address, 'for blockchain:', walletData.blockchain);
              user.wallets.push(existingWallet._id as any);
              continue;
            }

            const wallet = new Wallet({
              id: walletData.id,
              state: walletData.state,
              walletSetId: walletData.walletSetId,
              custodyType: walletData.custodyType,
              address: walletData.address,
              blockchain: walletData.blockchain,
              accountType: walletData.accountType,
              updateDate: new Date(walletData.updateDate),
              createDate: new Date(walletData.createDate),
              userId: user._id,
            });
            await wallet.save();
            user.wallets.push(wallet._id as any);
            console.log('Saved SCA wallet:', walletData.address, 'for blockchain:', walletData.blockchain);
          } catch (error: any) {
            if (error.code === 11000) {
              // Duplicate key error - wallet already exists
              console.log('Wallet already exists (duplicate key):', walletData.address, 'for blockchain:', walletData.blockchain);
              const existingWallet = await Wallet.findOne({ 
                address: walletData.address, 
                blockchain: walletData.blockchain 
              });
              if (existingWallet) {
                user.wallets.push(existingWallet._id as any);
              }
            } else {
              console.error('Error saving SCA wallet:', error);
              throw error;
            }
          }
        }
      }

      // Save Solana wallet to database
      if (solanaResponse.data?.wallets) {
        console.log('Saving Solana wallets:', solanaResponse.data.wallets.length);
        for (const walletData of solanaResponse.data.wallets) {
          try {
            // Check if wallet already exists for this address and blockchain combination
            const existingWallet = await Wallet.findOne({ 
              address: walletData.address, 
              blockchain: walletData.blockchain 
            });
            if (existingWallet) {
              console.log('Wallet already exists:', walletData.address, 'for blockchain:', walletData.blockchain);
              user.wallets.push(existingWallet._id as any);
              continue;
            }

            const wallet = new Wallet({
              id: walletData.id,
              state: walletData.state,
              walletSetId: walletData.walletSetId,
              custodyType: walletData.custodyType,
              address: walletData.address,
              blockchain: walletData.blockchain,
              accountType: walletData.accountType,
              updateDate: new Date(walletData.updateDate),
              createDate: new Date(walletData.createDate),
              userId: user._id,
            });
            await wallet.save();
            user.wallets.push(wallet._id as any);
            console.log('Saved Solana wallet:', walletData.address, 'for blockchain:', walletData.blockchain);
          } catch (error: any) {
            if (error.code === 11000) {
              // Duplicate key error - wallet already exists
              console.log('Wallet already exists (duplicate key):', walletData.address, 'for blockchain:', walletData.blockchain);
              const existingWallet = await Wallet.findOne({ 
                address: walletData.address, 
                blockchain: walletData.blockchain 
              });
              if (existingWallet) {
                user.wallets.push(existingWallet._id as any);
              }
            } else {
              console.error('Error saving Solana wallet:', error);
              throw error;
            }
          }
        }
      }

      await user.save();
    } else {
      // User already has wallets, add them to the user's wallet array
      console.log('User already has wallets:', existingWallets.length);
      user.wallets = existingWallets.map(wallet => wallet._id as any);
      await user.save();
    }

    let token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Populate user with wallets for response
    const userWithWallets = await User.findById(user._id).populate('wallets');

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        hasPasskey: user.hasPasskey,
        wallets: userWithWallets?.wallets || [],
      }
    });

  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Resend verification code
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // Delete any existing unused codes for this email
    await VerificationCode.deleteMany({
      email: email.toLowerCase(),
      isUsed: false
    });

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save new verification code
    const verificationRecord = new VerificationCode({
      email: email.toLowerCase(),
      code: verificationCode,
      expiresAt,
    });

    await verificationRecord.save();

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      await VerificationCode.findByIdAndDelete(verificationRecord._id);
      return res.status(500).json({
        error: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'New verification code sent successfully',
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Error resending verification code:', error);
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
});

// Test email endpoint
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // Test email configuration
    const { verifyEmailConfig, sendVerificationEmail } = await import('../services/emailService');

    // Verify email config
    const configValid = await verifyEmailConfig();
    if (!configValid) {
      return res.status(500).json({
        error: 'Email configuration is invalid'
      });
    }

    // Send test email
    const testCode = '123456';
    const emailSent = await sendVerificationEmail(email, testCode);

    if (!emailSent) {
      return res.status(500).json({
        error: 'Failed to send test email'
      });
    }

    res.json({
      success: true,
      message: 'Test email sent successfully',
      note: 'Check https://ethereal.email to view the email'
    });

  } catch (error: any) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
});

export default router;
