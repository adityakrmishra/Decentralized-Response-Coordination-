import { SDKManager, FlightController } from 'dji-sdk';

export class DJIDroneController {
  constructor(config) {
    this.sdkKey = config.sdkKey;
    this.drone = null;
    this.telemetryInterval = null;
  }

  async connect() {
    try {
      await SDKManager.registerApp(this.sdkKey);
      this.drone = new FlightController();
      
      return new Promise((resolve, reject) => {
        this.drone.on('connect', () => {
          console.log('DJI Drone Connected');
          this.startTelemetry();
          resolve();
        });
        
        this.drone.on('error', (error) => reject(error));
        this.drone.connect();
      });
    } catch (error) {
      throw new Error(`DJI Connection Failed: ${error.message}`);
    }
  }

  startTelemetry() {
    this.telemetryInterval = setInterval(() => {
      const telemetry = {
        position: this.drone.getPosition(),
        battery: this.drone.getBatteryLevel(),
        altitude: this.drone.getAltitude(),
        speed: this.drone.getSpeed()
      };
      this.emit('telemetry', telemetry);
    }, 1000);
  }

  async takeOff() {
    if (!this.drone) throw new Error('Not connected');
    return this.drone.executeAction('takeoff');
  }

  async land() {
    if (!this.drone) throw new Error('Not connected');
    return this.drone.executeAction('land');
  }

  async setWaypoints(waypoints) {
    if (!this.drone) throw new Error('Not connected');
    const mission = new MissionOperator();
    
    waypoints.forEach((wp, index) => {
      mission.addWaypoint({
        latitude: wp[0],
        longitude: wp[1],
        altitude: wp[2],
        heading: wp[3] || 0,
        index
      });
    });

    await mission.upload();
    return mission.start();
  }

  disconnect() {
    if (this.telemetryInterval) clearInterval(this.telemetryInterval);
    this.drone?.disconnect();
  }
}
