const { expect } = require('chai');
const { expectEvent } = require('@openzeppelin/test-helpers');

const EmergencyRegistry = artifacts.require('EmergencyRegistry');

contract('Event Tracking', ([owner]) => {
  beforeEach(async () => {
    this.contract = await EmergencyRegistry.new({ from: owner });
  });

  it('should emit EmergencyDeclared event', async () => {
    const tx = await this.contract.reportEmergency(
      [37654900, -122294300],
      5000,
      3,
      { from: owner }
    );
    
    expectEvent(tx, 'EmergencyDeclared', {
      severity: '3'
    });
  });

  it('should track multiple events', async () => {
    await this.contract.reportEmergency([0, 0], 1000, 1, { from: owner });
    const tx = await this.contract.resolveEmergency(0, { from: owner });
    
    expectEvent(tx, 'EmergencyResolved');
  });
});
