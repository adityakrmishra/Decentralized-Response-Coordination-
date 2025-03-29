const SupplyChainTracker = artifacts.require("SupplyChainTracker");

module.exports = function(deployer) {
  // Deploy Supply Chain Tracker after core contracts
  deployer.deploy(SupplyChainTracker);
};
