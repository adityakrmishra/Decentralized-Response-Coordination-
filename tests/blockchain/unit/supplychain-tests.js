const { expect } = require('chai');
const { expectEvent } = require('@openzeppelin/test-helpers');

const SupplyChainTracker = artifacts.require('SupplyChainTracker');

contract('SupplyChainTracker', ([admin, supplier]) => {
  beforeEach(async () => {
    this.contract = await SupplyChainTracker.new({ from: admin });
    await this.contract.authorizeSupplier(supplier, { from: admin });
  });

  it('should register new resource', async () => {
    const tx = await this.contract.registerResource(
      'medical',
      [37654900, -122294300],
      { from: supplier }
    );
    
    expectEvent(tx, 'ResourceRegistered');
    const resource = await this.contract.resources(0);
    expect(resource.resourceType).to.equal('medical');
  });

  it('should update resource location', async () => {
    await this.contract.registerResource('food', [0, 0], { from: supplier });
    const tx = await this.contract.updateLocation(0, [1000000, 2000000], { from: supplier });
    
    expectEvent(tx, 'LocationUpdated');
    const resource = await this.contract.resources(0);
    expect(resource.currentLocation[0]).to.be.bignumber.equal('1000000');
  });

  it('should verify location authenticity', async () => {
    await this.contract.registerResource('equipment', [123456, 654321], { from: supplier });
    const isValid = await this.contract.verifyLocation(0, [123456, 654321]);
    expect(isValid).to.be.true;
  });
});
