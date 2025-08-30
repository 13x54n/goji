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

// Login with password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user has password
    if (!user.password) {
      return res.status(401).json({ 
        error: 'Account does not have a password set' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
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
        hasPassword: user.hasPassword,
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

// Set password
router.post('/password', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        email, 
        isEmailVerified: true, // Assuming email is verified if they can set password
        hasPassword: true,
        password: hashedPassword
      });
    } else {
      user.password = hashedPassword;
      user.hasPassword = true;
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
      message: 'Password set successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        hasPasskey: user.hasPasskey,
        hasPassword: user.hasPassword,
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
        hasPassword: user.hasPassword,
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
