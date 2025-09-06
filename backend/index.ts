import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { databaseLogger, devLogger, errorLogger, prodLogger } from './middleware/logger';
import authRoutes from './routes/authRoutes';
import emailRoutes from './routes/emailRoutes';
import logRoutes from './routes/logRoutes';
import passkeyRoutes from './routes/passkeyRoutes';
import walletRoutes from './routes/walletRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database logging middleware (always active)
app.use(databaseLogger);

// Logging middleware
const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment) {
  // Development logging - separate success and error logs
  app.use(devLogger); // Log successful requests
  app.use(errorLogger); // Log error requests
} else {
  // Production logging
  app.use(prodLogger);
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/goji';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Static files for QR codes
app.use('/qr-codes', express.static(path.join(process.cwd(), 'public', 'qr-codes')));

// Routes
app.use('/api/passkeys', passkeyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/wallets', walletRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Goji API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Get the actual local IP address dynamically
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    if (interfaces) {
      for (const iface of interfaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIP = iface.address;
          break;
        }
      }
    }
    if (localIP !== 'localhost') break;
  }
  
  console.log(`Server accessible at: http://${localIP}:${PORT}`);
});