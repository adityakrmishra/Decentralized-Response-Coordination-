import { DroneService } from '../services/drone.service.js';
import { validateMissionParams } from '../validators/drone.validator.js';
import logger from '../utils/logger.js';

export class DroneController {
  static async getDroneFleet(req, res) {
    try {
      const fleet = await DroneService.getConnectedDrones();
      res.json(fleet.map(drone => ({
        id: drone.id,
        status: drone.status,
        battery: drone.batteryLevel,
        location: drone.position,
        payload: drone.currentPayload
      })));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch drone fleet' });
    }
  }

  static async dispatchDrone(req, res) {
    try {
      const { droneId } = req.params;
      const { coordinates, payload, priority } = req.body;

      await validateMissionParams.validateAsync({
        coordinates,
        payload,
        priority
      });

      const mission = await DroneService.createMission(
        droneId,
        coordinates,
        payload,
        priority,
        req.user.id
      );

      res.json({
        success: true,
        missionId: mission.id,
        estimatedArrival: mission.eta
      });
      
    } catch (error) {
      logger.error(`Dispatch error: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getTelemetryStream(req, res) {
    try {
      const { droneId } = req.params;
      const telemetryStream = DroneService.getTelemetryStream(droneId);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      telemetryStream.on('data', data => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      });

      req.on('close', () => {
        telemetryStream.destroy();
      });
      
    } catch (error) {
      res.status(404).json({ error: 'Drone not found' });
    }
  }

  static async executeEmergencyProcedure(req, res) {
    try {
      const { droneId } = req.params;
      const { procedure } = req.body;
      
      await DroneService.executeEmergencyProcedure(droneId, procedure);
      res.json({ success: true });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}
