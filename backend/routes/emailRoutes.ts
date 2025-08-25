import express from 'express';
import User from '../models/User';
import VerificationCode from '../models/VerificationCode';
import { generateVerificationCode, sendVerificationEmail } from '../services/emailService';

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

    // Mark code as used
    verificationRecord.isUsed = true;
    await verificationRecord.save();

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({
        email: email.toLowerCase(),
        isEmailVerified: true,
      });
    } else {
      user.isEmailVerified = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        hasPasskey: user.hasPasskey,
        hasSecurityCode: user.hasSecurityCode,
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
