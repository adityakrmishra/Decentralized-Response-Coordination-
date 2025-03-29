import { MavLinkProtocol, common } from 'mavlink-mappings';

export class ArduPilotController {
  constructor(connection) {
    this.protocol = new MavLinkProtocol();
    this.connection = connection;
    this.connected = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.connection.on('connect', () => {
        this.connected = true;
        this.setupListeners();
        resolve();
      });

      this.connection.on('error', reject);
      this.connection.connect();
    });
  }

  setupListeners() {
    this.protocol.on('HEARTBEAT', (message) => {
      this.emit('status', {
        armed: message.baseMode & common.MavModeFlag.SAFETY_ARMED,
        mode: common.MavMode[message.customMode]
      });
    });

    this.protocol.on('GLOBAL_POSITION_INT', (message) => {
      this.emit('telemetry', {
        lat: message.lat / 1e7,
        lon: message.lon / 1e7,
        alt: message.alt / 1e3,
        heading: message.hdg / 100
      });
    });
  }

  async arm() {
    return this.sendCommand(
      common.MavCmd.COMPONENT_ARM_DISARM,
      [1, 0, 0, 0, 0, 0, 0]
    );
  }

  async disarm() {
    return this.sendCommand(
      common.MavCmd.COMPONENT_ARM_DISARM,
      [0, 0, 0, 0, 0, 0, 0]
    );
  }

  async sendCommand(command, params) {
    if (!this.connected) throw new Error('Not connected');
    
    const msg = new common.CommandLong({
      targetSystem: 1,
      targetComponent: 1,
      command,
      confirmation: 0,
      param1: params[0],
      param2: params[1],
      param3: params[2],
      param4: params[3],
      param5: params[4],
      param6: params[5],
      param7: params[6]
    });

    return this.protocol.send(msg);
  }

  async setFlightMode(mode) {
    const modeId = common.MavMode[mode];
    return this.sendCommand(
      common.MavCmd.DO_SET_MODE,
      [common.MavModeFlag.CUSTOM_MODE_ENABLED, modeId, 0, 0, 0, 0, 0]
    );
  }

  disconnect() {
    this.connection?.close();
    this.connected = false;
  }
}
