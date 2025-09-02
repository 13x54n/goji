import express from 'express';
import jwt from 'jsonwebtoken';
import Passkey from '../models/Passkey';
import User from '../models/User';

const router = express.Router();

// Login with passkey
router.post('/login/passkey', async (req, res) => {
  try {
    const { credentialId } = req.body;

    if (!credentialId) {
      return res.status(400).json({ error: 'credentialId is required' });
    }

    // Find passkey
    const passkey = await Passkey.findOne({ 
      credentialId, 
      isActive: true 
    });

    if (!passkey) {
      return res.status(401).json({ error: 'Invalid passkey' });
    }

    // Find user
    const user = await User.findOne({ email: passkey.email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Update last login and last used
    user.lastLogin = new Date();
    await user.save();

    passkey.lastUsed = new Date();
    await passkey.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Passkey login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        hasPasskey: user.hasPasskey,
        lastLogin: user.lastLogin,
      }
    });

  } catch (error) {
    console.error('Error logging in with passkey:', error);
    res.status(500).json({ error: 'Failed to login with passkey' });
  }
});

// Get user profile
router.post('/profile', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        hasPasskey: user.hasPasskey,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      }
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
