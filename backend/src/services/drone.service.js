import { DroneSDK } from 'drone-control-sdk';
import { GeoUtils } from '../utils/geo.js';
import logger from '../utils/logger.js';

const DRONE_API_KEY = process.env.DRONE_API_KEY;

class DroneService {
  constructor() {
    this.drones = new Map();
    this.missions = new Map();
    this.telemetryStreams = new Map();
    this.sdk = new DroneSDK(DRONE_API_KEY);
  }

  async connectDrone(droneId) {
    try {
      const drone = await this.sdk.connect(droneId);
      this.drones.set(droneId, drone);
      
      drone.on('status', (status) => 
        this._handleStatusUpdate(droneId, status));
      drone.on('emergency', (code) => 
        this._handleEmergency(droneId, code));
      
      logger.info(`Drone ${droneId} connected`);
      return true;
    } catch (error) {
      logger.error(`Connection failed: ${error.message}`);
      throw new Error('Drone connection failed');
    }
  }

  async createMission(droneId, waypoints, payload) {
    const drone = this._getDrone(droneId);
    
    try {
      const mission = await drone.createMission({
        waypoints: waypoints.map(wp => ({
          latitude: wp[0],
          longitude: wp[1],
          altitude: wp[2],
          speed: wp[3] || 5.0
        })),
        payload,
        safetyChecks: {
          geofence: true,
          batteryReturn: 20
        }
      });
      
      this.missions.set(mission.id, mission);
      return mission;
    } catch (error) {
      throw new Error(`Mission creation failed: ${error.message}`);
    }
  }

  getTelemetryStream(droneId) {
    if (!this.telemetryStreams.has(droneId)) {
      const drone = this._getDrone(droneId);
      const stream = drone.getTelemetryStream();
      this.telemetryStreams.set(droneId, stream);
    }
    return this.telemetryStreams.get(droneId);
  }

  async executeEmergencyProcedure(droneId, procedure) {
    const drone = this._getDrone(droneId);
    
    const procedures = {
      emergency_land: () => drone.emergencyLand(),
      return_home: () => drone.returnToHome(),
      shutdown: () => drone.shutdown()
    };
    
    if (!procedures[procedure]) {
      throw new Error('Invalid emergency procedure');
    }
    
    try {
      await procedures[procedure]();
      return true;
    } catch (error) {
      throw new Error(`Emergency procedure failed: ${error.message}`);
    }
  }

  _getDrone(droneId) {
    if (!this.drones.has(droneId)) {
      throw new Error('Drone not connected');
    }
    return this.drones.get(droneId);
  }

  _handleStatusUpdate(droneId, status) {
    logger.info(`Drone ${droneId} status: ${JSON.stringify(status)}`);
    // Update database with current status
  }

  _handleEmergency(droneId, code) {
    logger.error(`EMERGENCY ${droneId}: Code ${code}`);
    this.executeEmergencyProcedure(droneId, 'emergency_land');
  }
}

export const droneService = new DroneService();
