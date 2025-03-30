const { expect } = require('chai');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const ResourceAllocation = artifacts.require('ResourceAllocation');

contract('ResourceAllocation', ([owner, responder, citizen]) => {
  beforeEach(async () => {
    this.contract = await ResourceAllocation.new({ from: owner });
  });

  it('should create emergency resource request', async () => {
    const coords = [37.7749 * 1e6, -122.4194 * 1e6];
    const tx = await this.contract.createRequest(coords, 2, { from: responder });
    
    expectEvent(tx, 'RequestCreated', {
      requester: responder,
      status: 0 // Pending
    });
  });

  it('should prevent unauthorized resource allocation', async () => {
    await expectRevert(
      this.contract.allocateResources(0, { from: citizen }),
      'Unauthorized'
    );
  });

  it('should track full allocation lifecycle', async () => {
    // Create request
    await this.contract.createRequest([0, 0], 3, { from: responder });
    
    // Allocate resources
    const allocateTx = await this.contract.allocateResources(0, { from: owner });
    expectEvent(allocateTx, 'ResourceAllocated');
    
    // Fulfill request
    const fulfillTx = await this.contract.fulfillRequest(0, { from: responder });
    expectEvent(fulfillTx, 'RequestFulfilled');
    
    // Verify status
    const request = await this.contract.requests(0);
    expect(request.status).to.be.bignumber.equal(new BN(2)); // Fulfilled
  });
});
