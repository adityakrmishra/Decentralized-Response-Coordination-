import express from 'express';
import { body, validationResult } from 'express-validator';
import { DisasterController } from '../../controllers/disaster.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Create new disaster event
router.post(
  '/',
  authenticate,
  authorize('admin', 'responder'),
  [
    body('type').isIn(['earthquake', 'flood', 'wildfire', 'hurricane']),
    body('severity').isInt({ min: 1, max: 5 }),
    body('location.coordinates').isArray({ min: 2, max: 2 }),
    body('location.radius').isFloat({ min: 100 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const disaster = await DisasterController.createDisaster(req.body);
      res.status(201).json(disaster);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get active disasters with filtering
router.get('/', async (req, res) => {
  try {
    const filters = {
      status: req.query.status || 'active',
      severity: req.query.severity,
      type: req.query.type,
      location: req.query.coordinates ? {
        coordinates: req.query.coordinates.split(',').map(Number),
        radius: parseInt(req.query.radius) || 5000
      } : null
    };

    const disasters = await DisasterController.getDisasters(filters);
    res.json(disasters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update disaster status
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  [
    body('status').isIn(['active', 'resolved', 'archived']),
    body('resolutionNotes').optional().isString()
  ],
  async (req, res) => {
    try {
      const updated = await DisasterController.updateStatus(
        req.params.id,
        req.body.status,
        req.body.resolutionNotes
      );
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
