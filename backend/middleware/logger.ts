import morgan from 'morgan';
import Log from '../models/Log';

// Custom token for request body (for debugging)
morgan.token('body', (req: any) => {
  if (req.body && Object.keys(req.body).length > 0) {
    return JSON.stringify(req.body);
  }
  return '';
});

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req: any, res: any) => {
  if (!res._header || !req._startAt) return '';
  const diff = process.hrtime(req._startAt);
  const ms = diff[0] * 1e3 + diff[1] * 1e-6;
  return ms.toFixed(2);
});

// Custom token for IP address
morgan.token('remote-addr', (req: any) => {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
});

// Enhanced database logging middleware
export const databaseLogger = async (req: any, res: any, next: any) => {
  const startTime = process.hrtime();
  
  // Store original send method
  const originalSend = res.send;
  
  // Override send method to capture response
  res.send = function(data: any) {
    const diff = process.hrtime(startTime);
    const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;
    
    // Create log entry
    const logEntry = new Log({
      timestamp: new Date(),
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: Math.round(responseTime * 100) / 100, // Round to 2 decimal places
      ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || '',
      requestBody: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
      responseBody: data,
      userEmail: req.body?.email || req.query?.email,
      error: res.statusCode >= 400 ? data : undefined
    });
    
    // Save to database (non-blocking)
    logEntry.save().catch(err => {
      console.error('Failed to save log to database:', err);
    });
    
    // Enhanced terminal console output
    const timestamp = new Date().toISOString();
    const method = req.method.padEnd(7);
    const status = res.statusCode.toString().padStart(3);
    const responseTimeStr = `${responseTime.toFixed(2)}ms`.padStart(8);
    const url = req.originalUrl || req.url;
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    
    // Color coding for different status codes
    let statusColor = '\x1b[32m'; // Green for 2xx
    if (res.statusCode >= 400 && res.statusCode < 500) statusColor = '\x1b[33m'; // Yellow for 4xx
    if (res.statusCode >= 500) statusColor = '\x1b[31m'; // Red for 5xx
    
    console.log(
      `\x1b[36m[${timestamp}]\x1b[0m ` +
      `${method} ` +
      `${statusColor}${status}\x1b[0m ` +
      `${responseTimeStr} ` +
      `\x1b[35m${url}\x1b[0m ` +
      `\x1b[90m(${ip})\x1b[0m`
    );
    
    // Show request body for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      console.log(`  \x1b[90mBody:\x1b[0m ${JSON.stringify(req.body, null, 2)}`);
    }
    
    // Show error details for 4xx/5xx responses
    if (res.statusCode >= 400) {
      console.log(`  \x1b[31mError:\x1b[0m ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    }
    
    // Call original send method
    return originalSend.call(this, data);
  };
  
  next();
};

// Development format - more detailed
export const devFormat = ':method :url :status :response-time-ms ms - :body';

// Production format - standard combined format
export const prodFormat = 'combined';

// Custom format for API requests
export const apiFormat = ':method :url :status :response-time-ms ms - :remote-addr';

// Create different morgan instances
export const devLogger = morgan(devFormat, {
  skip: (req, res) => res.statusCode >= 400,
});

export const errorLogger = morgan(devFormat, {
  skip: (req, res) => res.statusCode < 400,
});

export const prodLogger = morgan(prodFormat);

export const apiLogger = morgan(apiFormat);
