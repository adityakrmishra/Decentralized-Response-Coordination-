const { expect } = require('chai');
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const EmergencyRegistry = artifacts.require('EmergencyRegistry');

contract('EmergencyRegistry', ([owner, reporter]) => {
  beforeEach(async () => {
    this.contract = await EmergencyRegistry.new({ from: owner });
  });

  it('should report new emergency', async () => {
    const tx = await this.contract.reportEmergency(
      [37654900, -122294300], // Scaled coordinates
      5000, // 5km radius
      3, // Severity
      { from: owner }
    );
    
    expectEvent(tx, 'EmergencyDeclared');
    expect(await this.contract.activeEmergencyCount()).to.be.bignumber.equal('1');
  });

  it('should resolve emergency', async () => {
    await this.contract.reportEmergency([0, 0], 1000, 1, { from: owner });
    const tx = await this.contract.resolveEmergency(0, { from: owner });
    
    expectEvent(tx, 'EmergencyResolved');
    expect(await this.contract.activeEmergencyCount()).to.be.bignumber.equal('0');
  });

  it('should detect affected locations', async () => {
    const emergencyCoords = [37654900, -122294300];
    await this.contract.reportEmergency(emergencyCoords, 5000, 2, { from: owner });
    
    const isAffected = await this.contract.isLocationAffected([37654950, -122294250]);
    expect(isAffected).to.be.true;
  });
});
