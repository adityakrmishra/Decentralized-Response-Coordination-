const { expect } = require('chai');
const { expectRevert } = require('@openzeppelin/test-helpers');

const ResourceAllocation = artifacts.require('ResourceAllocation');

contract('Edge Cases', ([owner, user]) => {
  beforeEach(async () => {
    this.contract = await ResourceAllocation.new({ from: owner });
  });

  it('should prevent invalid coordinates', async () => {
    await expectRevert(
      this.contract.createRequest([91 * 1e6, 0], 1, { from: user }),
      'Invalid coordinates'
    );
  });

  it('should handle duplicate requests', async () => {
    await this.contract.createRequest([0, 0], 1, { from: user });
    await expectRevert(
      this.contract.createRequest([0, 0], 1, { from: user }),
      'Existing active request'
    );
  });

  it('should prevent underflow/overflow', async () => {
    await expectRevert(
      this.contract.allocateResources(999, { from: owner }),
      'Invalid status'
    );
  });
});
