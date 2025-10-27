/**
 * Law4Us Document Generation API
 * Backend service for generating legal documents with attachments
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Import routes
import documentRoutes from './routes/document';
import healthRoutes from './routes/health';
import submissionRoutes from './routes/submission';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure directories exist
const ensureDirectories = () => {
  const dirs = ['uploads', 'output', 'templates'];
  dirs.forEach((dir) => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};
ensureDirectories();

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/submission', submissionRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Law4Us Document Generation API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      generateDocument: '/api/document/generate',
      checkStatus: '/api/document/status/:id',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Law4Us Document Generation API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🤖 Groq API: ${process.env.GROQ_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('');
  console.log('📚 Endpoints:');
  console.log(`   GET  /api/health - Health check`);
  console.log(`   POST /api/document/generate - Generate document with attachments`);
  console.log('');
});

export default app;
