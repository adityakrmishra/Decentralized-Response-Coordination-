// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EmergencyRegistry is Ownable {
    struct Emergency {
        int32[2] epicenter;
        uint32 radius; // meters
        uint8 severity; // 1-5 scale
        uint256 startTime;
        uint256 endTime;
        bool resolved;
    }

    mapping(bytes32 => Emergency) public emergencies;
    bytes32[] public activeEmergencies;
    
    event EmergencyDeclared(bytes32 indexed emergencyId);
    emergencyResolved(bytes32 indexed emergencyId);

    function reportEmergency(
        int32[2] memory epicenter,
        uint32 radius,
        uint8 severity
    ) external onlyOwner returns (bytes32) {
        require(severity >= 1 && severity <= 5, "Invalid severity");
        require(_validateCoordinates(epicenter), "Invalid coordinates");
        
        bytes32 emergencyId = keccak256(abi.encodePacked(
            epicenter, block.timestamp, severity
        ));
        
        emergencies[emergencyId] = Emergency({
            epicenter: epicenter,
            radius: radius,
            severity: severity,
            startTime: block.timestamp,
            endTime: 0,
            resolved: false
        });
        
        activeEmergencies.push(emergencyId);
        emit EmergencyDeclared(emergencyId);
        return emergencyId;
    }

    function resolveEmergency(bytes32 emergencyId) external onlyOwner {
        require(!emergencies[emergencyId].resolved, "Already resolved");
        
        emergencies[emergencyId].resolved = true;
        emergencies[emergencyId].endTime = block.timestamp;
        
        // Remove from active list
        for (uint i = 0; i < activeEmergencies.length; i++) {
            if (activeEmergencies[i] == emergencyId) {
                activeEmergencies[i] = activeEmergencies[activeEmergencies.length-1];
                activeEmergencies.pop();
                break;
            }
        }
        
        emit EmergencyResolved(emergencyId);
    }

    function isLocationAffected(
        int32[2] memory coordinates
    ) external view returns (bool) {
        for (uint i = 0; i < activeEmergencies.length; i++) {
            Emergency storage e = emergencies[activeEmergencies[i]];
            if (_calculateDistance(e.epicenter, coordinates) <= e.radius) {
                return true;
            }
        }
        return false;
    }

    function _calculateDistance(
        int32[2] memory a,
        int32[2] memory b
    ) internal pure returns (uint32) {
        // Simplified Haversine approximation for blockchain
        int32 latDiff = a[0] - b[0];
        int32 lonDiff = a[1] - b[1];
        return uint32((sqrt(uint(latDiff**2 + lonDiff**2)) * 111319) / 1e6); // meters
    }

    function _validateCoordinates(int32[2] memory coord) internal pure returns (bool) {
        return (coord[0] >= -90 * 1e6 && coord[0] <= 90 * 1e6) && 
               (coord[1] >= -180 * 1e6 && coord[1] <= 180 * 1e6);
    }

    function sqrt(uint x) internal pure returns (uint y) {
        uint z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
