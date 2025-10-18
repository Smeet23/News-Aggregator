// Request logging middleware
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Custom token for user ID
morgan.token('user-id', (req) => {
  return req.user ? req.user.id : 'anonymous';
});

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? parseFloat(responseTime).toFixed(2) : '0';
});

// Development logging format (colorized for console)
const devFormat = ':method :url :status :response-time ms - :res[content-length]';

// Production logging format (detailed for file)
const prodFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Simple request logger for debugging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`📥 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  
  // Add response time header
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Don't set headers after response is sent
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', duration);
    }
    
    // Log response with color coding based on status
    const status = res.statusCode;
    let emoji = '✅';
    if (status >= 400 && status < 500) emoji = '⚠️';
    if (status >= 500) emoji = '❌';
    
    console.log(`${emoji} ${req.method} ${req.originalUrl} - ${status} - ${duration}ms`);
  });
  
  next();
};

// Export different loggers based on environment
const setupLogging = (app) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, log to file
    app.use(morgan(prodFormat, { stream: accessLogStream }));
  } else {
    // In development, log to console with colors
    app.use(morgan(devFormat));
    // Also use simple request logger for better visibility
    app.use(requestLogger);
  }
};

module.exports = {
  setupLogging,
  requestLogger
};