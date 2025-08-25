import express from 'express';
import Log from '../models/Log';

const router = express.Router();

// Get all logs with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Log.countDocuments();

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get logs by email
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const logs = await Log.find({ userEmail: email })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Log.countDocuments({ userEmail: email });

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching logs by email:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get logs by status code
router.get('/status/:statusCode', async (req, res) => {
  try {
    const { statusCode } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const logs = await Log.find({ statusCode: parseInt(statusCode) })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Log.countDocuments({ statusCode: parseInt(statusCode) });

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching logs by status code:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get recent logs (last 24 hours)
router.get('/recent', async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const logs = await Log.find({ timestamp: { $gte: oneDayAgo } })
      .sort({ timestamp: -1 })
      .limit(100)
      .select('-__v');

    res.json({ logs, count: logs.length });
  } catch (error) {
    console.error('Error fetching recent logs:', error);
    res.status(500).json({ error: 'Failed to fetch recent logs' });
  }
});

// Clear old logs (older than 30 days)
router.delete('/clear-old', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await Log.deleteMany({ timestamp: { $lt: thirtyDaysAgo } });
    
    res.json({ 
      message: `Cleared ${result.deletedCount} old logs`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error clearing old logs:', error);
    res.status(500).json({ error: 'Failed to clear old logs' });
  }
});

export default router;
