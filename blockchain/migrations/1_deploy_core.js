const EmergencyRegistry = artifacts.require("EmergencyRegistry");
const ResourceAllocation = artifacts.require("ResourceAllocation");

module.exports = function(deployer) {
  // Deploy Emergency Registry first as other contracts may depend on it
  deployer.deploy(EmergencyRegistry)
    .then(() => {
      // Deploy Resource Allocation with registry address
      return deployer.deploy(ResourceAllocation);
    });
};
