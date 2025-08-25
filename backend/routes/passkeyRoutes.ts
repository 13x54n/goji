import express from 'express';
import Passkey from '../models/Passkey';
import User from '../models/User';

const router = express.Router();

// Create a new passkey
router.post('/create', async (req, res) => {
  try {
    const { email, credentialId, deviceInfo } = req.body;

    if (!email || !credentialId || !deviceInfo) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, credentialId, deviceInfo' 
      });
    }

    // Check if passkey already exists
    const existingPasskey = await Passkey.findOne({ credentialId });
    if (existingPasskey) {
      return res.status(409).json({ error: 'Passkey already exists' });
    }

    // Create or update user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        email, 
        isEmailVerified: true, // Assuming email is verified if they can create passkey
        hasPasskey: true 
      });
    } else {
      user.hasPasskey = true;
    }
    await user.save();

    // Create passkey
    const passkey = new Passkey({
      email,
      credentialId,
      deviceInfo,
      isActive: true,
    });

    await passkey.save();

    res.status(201).json({
      success: true,
      message: 'Passkey created successfully',
      passkey: {
        id: passkey._id,
        email: passkey.email,
        credentialId: passkey.credentialId,
        createdAt: passkey.createdAt,
        deviceInfo: passkey.deviceInfo,
      }
    });

  } catch (error) {
    console.error('Error creating passkey:', error);
    res.status(500).json({ error: 'Failed to create passkey' });
  }
});

// Verify passkey
router.post('/verify', async (req, res) => {
  try {
    const { credentialId } = req.body;

    if (!credentialId) {
      return res.status(400).json({ error: 'credentialId is required' });
    }

    const passkey = await Passkey.findOne({ 
      credentialId, 
      isActive: true 
    });

    if (!passkey) {
      return res.status(404).json({ error: 'Passkey not found or inactive' });
    }

    // Update last used timestamp
    passkey.lastUsed = new Date();
    await passkey.save();

    // Update user's last login
    await User.findOneAndUpdate(
      { email: passkey.email },
      { lastLogin: new Date() }
    );

    res.json({
      success: true,
      message: 'Passkey verified successfully',
      user: {
        email: passkey.email,
        lastLogin: new Date(),
      }
    });

  } catch (error) {
    console.error('Error verifying passkey:', error);
    res.status(500).json({ error: 'Failed to verify passkey' });
  }
});

// Get passkeys for a user
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const passkeys = await Passkey.find({ 
      email, 
      isActive: true 
    }).select('-__v');

    res.json({
      success: true,
      passkeys: passkeys.map(pk => ({
        id: pk._id,
        credentialId: pk.credentialId,
        createdAt: pk.createdAt,
        deviceInfo: pk.deviceInfo,
        lastUsed: pk.lastUsed,
      }))
    });

  } catch (error) {
    console.error('Error fetching passkeys:', error);
    res.status(500).json({ error: 'Failed to fetch passkeys' });
  }
});

// Deactivate a passkey
router.delete('/:credentialId', async (req, res) => {
  try {
    const { credentialId } = req.params;

    const passkey = await Passkey.findOne({ credentialId });
    if (!passkey) {
      return res.status(404).json({ error: 'Passkey not found' });
    }

    passkey.isActive = false;
    await passkey.save();

    // Check if user has any other active passkeys
    const activePasskeys = await Passkey.countDocuments({ 
      email: passkey.email, 
      isActive: true 
    });

    // Update user's hasPasskey status
    await User.findOneAndUpdate(
      { email: passkey.email },
      { hasPasskey: activePasskeys > 0 }
    );

    res.json({
      success: true,
      message: 'Passkey deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating passkey:', error);
    res.status(500).json({ error: 'Failed to deactivate passkey' });
  }
});

export default router;
