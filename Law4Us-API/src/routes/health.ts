/**
 * Health check endpoint
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
    environment: {
      node: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV || 'development',
    },
    services: {
      groq: !!process.env.GROQ_API_KEY,
    },
  });
});

export default router;
