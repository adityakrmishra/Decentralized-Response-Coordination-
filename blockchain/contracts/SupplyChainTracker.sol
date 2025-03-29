// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SupplyChainTracker is Ownable {
    enum ResourceStatus { InTransit, Delivered, Cancelled }
    
    struct Resource {
        bytes32 resourceId;
        string resourceType;
        int32[2] currentLocation;
        address supplier;
        ResourceStatus status;
        uint256 lastUpdate;
    }

    mapping(bytes32 => Resource) public resources;
    mapping(address => bool) public authorizedSuppliers;
    
    event ResourceRegistered(bytes32 indexed resourceId, address supplier);
    event LocationUpdated(bytes32 indexed resourceId, int32[2] newLocation);
    event StatusChanged(bytes32 indexed resourceId, ResourceStatus newStatus);

    modifier onlySupplier() {
        require(authorizedSuppliers[msg.sender], "Unauthorized supplier");
        _;
    }

    function registerResource(
        string calldata resourceType,
        int32[2] memory initialLocation
    ) external onlySupplier returns (bytes32) {
        require(_validateCoordinates(initialLocation), "Invalid coordinates");
        
        bytes32 resourceId = keccak256(abi.encodePacked(
            msg.sender, block.timestamp, resourceType
        ));
        
        resources[resourceId] = Resource({
            resourceId: resourceId,
            resourceType: resourceType,
            currentLocation: initialLocation,
            supplier: msg.sender,
            status: ResourceStatus.InTransit,
            lastUpdate: block.timestamp
        });
        
        emit ResourceRegistered(resourceId, msg.sender);
        return resourceId;
    }

    function updateLocation(
        bytes32 resourceId,
        int32[2] memory newLocation
    ) external onlySupplier {
        require(resources[resourceId].status == ResourceStatus.InTransit, 
            "Not in transit");
        require(_validateCoordinates(newLocation), "Invalid coordinates");
        
        resources[resourceId].currentLocation = newLocation;
        resources[resourceId].lastUpdate = block.timestamp;
        emit LocationUpdated(resourceId, newLocation);
    }

    function updateStatus(
        bytes32 resourceId, 
        ResourceStatus newStatus
    ) external onlySupplier {
        require(resources[resourceId].status != newStatus, "Same status");
        
        resources[resourceId].status = newStatus;
        resources[resourceId].lastUpdate = block.timestamp;
        emit StatusChanged(resourceId, newStatus);
    }

    function verifyLocation(
        bytes32 resourceId,
        int32[2] memory claimedLocation
    ) external view returns (bool) {
        return keccak256(abi.encode(resources[resourceId].currentLocation)) == 
               keccak256(abi.encode(claimedLocation));
    }

    function authorizeSupplier(address supplier) external onlyOwner {
        authorizedSuppliers[supplier] = true;
    }

    function _validateCoordinates(int32[2] memory coord) internal pure returns (bool) {
        return (coord[0] >= -90 * 1e6 && coord[0] <= 90 * 1e6) && 
               (coord[1] >= -180 * 1e6 && coord[1] <= 180 * 1e6);
    }
}
