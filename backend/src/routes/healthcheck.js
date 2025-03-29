import express from 'express';
import { HealthController } from '../controllers/health.controller.js';
import { checkDbConnection } from '../middleware/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const health = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks: {
      database: await checkDbConnection(),
      memoryUsage: process.memoryUsage().rss,
      cpuUsage: process.cpuUsage()
    }
  };

  res.status(200).json(health);
});

router.get('/ready', async (req, res) => {
  const ready = await HealthController.checkReadiness();
  res.status(ready ? 200 : 503).json({ ready });
});

router.get('/live', (req, res) => {
  res.status(200).json({ live: true });
});

export default router;
