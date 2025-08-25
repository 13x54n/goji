import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import Passkey from '../models/Passkey';
import User from '../models/User';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      isEmailVerified: false, // Would be set to true after email verification
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      }
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login with security code (replaces password login)
router.post('/login', async (req, res) => {
  try {
    const { email, securityCode } = req.body;

    if (!email || !securityCode) {
      return res.status(400).json({ 
        error: 'Email and security code are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user has security code
    if (!user.securityCode) {
      return res.status(401).json({ 
        error: 'Account does not have a security code set' 
      });
    }

    // Verify security code
    const isSecurityCodeValid = await bcrypt.compare(securityCode, user.securityCode);
    if (!isSecurityCodeValid) {
      return res.status(401).json({ error: 'Invalid security code' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        hasPasskey: user.hasPasskey,
        hasSecurityCode: user.hasSecurityCode,
        lastLogin: user.lastLogin,
      }
    });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

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

// Set security code
router.post('/security-code', async (req, res) => {
  try {
    const { email, securityCode } = req.body;

    if (!email || !securityCode) {
      return res.status(400).json({ 
        error: 'Email and security code are required' 
      });
    }

    if (!/^\d{6}$/.test(securityCode)) {
      return res.status(400).json({ 
        error: 'Security code must be exactly 6 digits' 
      });
    }

    // Hash the security code and store it in the securityCode field
    const saltRounds = 12;
    const hashedSecurityCode = await bcrypt.hash(securityCode, saltRounds);

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        email, 
        isEmailVerified: true, // Assuming email is verified if they can set security code
        hasSecurityCode: true,
        securityCode: hashedSecurityCode
      });
    } else {
      user.securityCode = hashedSecurityCode;
      user.hasSecurityCode = true;
    }

    await user.save();

    // Generate JWT token for the user
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Security code set successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        hasPasskey: user.hasPasskey,
        hasSecurityCode: user.hasSecurityCode,
      }
    });

  } catch (error) {
    console.error('Error setting security code:', error);
    res.status(500).json({ error: 'Failed to set security code' });
  }
});



// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await User.findById(decoded.userId);

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
