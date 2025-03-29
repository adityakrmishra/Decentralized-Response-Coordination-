// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ResourceAllocation is Ownable {
    enum RequestStatus { Pending, Allocated, Fulfilled }
    enum PriorityLevel { Critical, High, Medium, Low }

    struct ResourceRequest {
        address requester;
        int32[2] coordinates; // [latitude * 1e6, longitude * 1e6]
        PriorityLevel priority;
        RequestStatus status;
        uint256 timestamp;
    }

    mapping(bytes32 => ResourceRequest) public requests;
    uint256 public requestCount;
    
    event RequestCreated(bytes32 indexed requestId, address indexed requester);
    event ResourceAllocated(bytes32 indexed requestId, address indexed allocator);
    event RequestFulfilled(bytes32 indexed requestId);

    modifier onlyAuthorized() {
        require(_isAuthorized(msg.sender), "Unauthorized");
        _;
    }

    function createRequest(
        int32[2] memory coordinates,
        PriorityLevel priority
    ) external onlyAuthorized returns (bytes32) {
        require(_validateCoordinates(coordinates), "Invalid coordinates");
        
        bytes32 requestId = keccak256(abi.encodePacked(
            msg.sender, block.timestamp, requestCount
        ));
        
        requests[requestId] = ResourceRequest({
            requester: msg.sender,
            coordinates: coordinates,
            priority: priority,
            status: RequestStatus.Pending,
            timestamp: block.timestamp
        });
        
        requestCount++;
        emit RequestCreated(requestId, msg.sender);
        return requestId;
    }

    function allocateResources(bytes32 requestId) external onlyOwner {
        require(requests[requestId].status == RequestStatus.Pending, 
            "Invalid status");
        
        requests[requestId].status = RequestStatus.Allocated;
        emit ResourceAllocated(requestId, msg.sender);
    }

    function fulfillRequest(bytes32 requestId) external onlyAuthorized {
        require(requests[requestId].status == RequestStatus.Allocated, 
            "Not allocated");
        
        requests[requestId].status = RequestStatus.Fulfilled;
        emit RequestFulfilled(requestId);
    }

    function _isAuthorized(address account) internal view virtual returns (bool) {
        return account == owner() || _isGovernmentApproved(account);
    }

    function _isGovernmentApproved(address account) internal pure returns (bool) {
        // Implementation for government authority verification
        return true; // Simplified for example
    }

    function _validateCoordinates(int32[2] memory coord) internal pure returns (bool) {
        return (coord[0] >= -90 * 1e6 && coord[0] <= 90 * 1e6) && 
               (coord[1] >= -180 * 1e6 && coord[1] <= 180 * 1e6);
    }
}
