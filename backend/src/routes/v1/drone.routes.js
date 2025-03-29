import express from 'express';
import { DroneController } from '../../controllers/drone.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Drone fleet management
router.get('/', authenticate, async (req, res) => {
  try {
    const drones = await DroneController.getDroneFleet();
    res.json(drones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dispatch drone to mission
router.post(
  '/:id/dispatch',
  authenticate,
  authorize('responder'),
  async (req, res) => {
    try {
      const mission = await DroneController.dispatchDrone(
        req.params.id,
        req.body.missionId,
        req.body.operatorId
      );
      res.status(202).json(mission);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Real-time telemetry stream
router.get('/:id/telemetry', authenticate, async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const telemetryStream = await DroneController.getTelemetryStream(req.params.id);
    
    telemetryStream.on('data', (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    req.on('close', () => {
      telemetryStream.destroy();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
