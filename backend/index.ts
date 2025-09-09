import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { databaseLogger, devLogger, errorLogger, prodLogger } from './middleware/logger';
import authRoutes from './routes/authRoutes';
import emailRoutes from './routes/emailRoutes';
import logRoutes from './routes/logRoutes';
import passkeyRoutes from './routes/passkeyRoutes';
import walletApiRoutes from './routes/walletApiRoutes';
import walletRoutes from './routes/walletRoutes';
import { WalletMonitoringService } from './services/walletMonitoringService';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 4000;

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8081",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize wallet monitoring service
const walletMonitoringService = new WalletMonitoringService(io);

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
app.use('/api', walletApiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Goji API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(Number(PORT), '0.0.0.0', () => {
  
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
});

// Export for use in other modules
export { walletMonitoringService };
