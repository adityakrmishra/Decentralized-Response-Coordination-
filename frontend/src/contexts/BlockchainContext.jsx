import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import ResourceAllocation from '../contracts/ResourceAllocation.json';
import EmergencyRegistry from '../contracts/EmergencyRegistry.json';
import SupplyChainTracker from '../contracts/SupplyChainTracker.json';

const BlockchainContext = createContext();

const contractAddresses = {
  ResourceAllocation: process.env.REACT_APP_RESOURCE_ALLOCATION_ADDR,
  EmergencyRegistry: process.env.REACT_APP_EMERGENCY_REGISTRY_ADDR,
  SupplyChainTracker: process.env.REACT_APP_SUPPLY_CHAIN_ADDR
};

export function BlockchainProvider({ children }) {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('disconnected');
  const [notifications, setNotifications] = useState([]);
  const [supplyChainData, setSupplyChainData] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [provider, setProvider] = useState(null);
  const [contracts, setContracts] = useState({});

  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) throw new Error('No Ethereum provider found');
      
      const [account] = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const loadContracts = async () => ({
        ResourceAllocation: new ethers.Contract(
          contractAddresses.ResourceAllocation,
          ResourceAllocation.abi,
          signer
        ),
        EmergencyRegistry: new ethers.Contract(
          contractAddresses.EmergencyRegistry,
          EmergencyRegistry.abi,
          signer
        ),
        SupplyChainTracker: new ethers.Contract(
          contractAddresses.SupplyChainTracker,
          SupplyChainTracker.abi,
          signer
        )
      });

      setCurrentAccount(account);
      setProvider(provider);
      setContracts(await loadContracts());
      setNetworkStatus('connected');
      
      // Setup event listeners
      window.ethereum.on('accountsChanged', ([newAccount]) => 
        setCurrentAccount(newAccount || null)
      );
      
      window.ethereum.on('chainChanged', () => 
        window.location.reload()
      );

    } catch (error) {
      addNotification(`Connection Error: ${error.message}`, 'error');
      setNetworkStatus('error');
    }
  }, []);

  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    }]);
  };

  const submitEmergencyReport = async (report) => {
    try {
      setNetworkStatus('pending');
      const tx = await contracts.EmergencyRegistry.reportEmergency(
        report.coordinates,
        report.radius,
        report.severity,
        { gasLimit: 500000 }
      );
      
      addNotification('Emergency reported - awaiting confirmation...', 'pending');
      await tx.wait();
      addNotification('Emergency confirmed on blockchain!', 'success');
      return tx;
    } catch (error) {
      addNotification(`Submission failed: ${error.message}`, 'error');
      throw error;
    } finally {
      setNetworkStatus('connected');
    }
  };

  const fetchEmergencies = useCallback(async () => {
    if (!contracts.EmergencyRegistry) return;
    
    const filter = contracts.EmergencyRegistry.filters.EmergencyDeclared();
    const events = await contracts.EmergencyRegistry.queryFilter(filter);
    
    const emergencies = await Promise.all(
      events.map(async (e) => {
        const emergency = await contracts.EmergencyRegistry.emergencies(e.args.emergencyId);
        return {
          id: e.args.emergencyId,
          coordinates: emergency.epicenter,
          radius: emergency.radius,
          severity: emergency.severity,
          timestamp: new Date(emergency.startTime * 1000)
        };
      })
    );
    
    setEmergencies(emergencies);
  }, [contracts.EmergencyRegistry]);

  const fetchSupplyChainData = useCallback(async () => {
    if (!contracts.SupplyChainTracker) return;
    
    const resourceCount = await contracts.SupplyChainTracker.resourceCount();
    const resources = await Promise.all(
      Array(Number(resourceCount))
        .fill()
        .map(async (_, i) => {
          const resource = await contracts.SupplyChainTracker.resources(i);
          return {
            id: resource.resourceId,
            type: resource.resourceType,
            location: resource.currentLocation,
            status: ResourceStatus[resource.status],
            updated: new Date(resource.lastUpdate * 1000)
          };
        })
    );
    
    setSupplyChainData(resources);
  }, [contracts.SupplyChainTracker]);

  useEffect(() => {
    if (networkStatus === 'connected') {
      fetchEmergencies();
      fetchSupplyChainData();
      
      // Real-time updates
      contracts.EmergencyRegistry.on('EmergencyDeclared', fetchEmergencies);
      contracts.SupplyChainTracker.on('LocationUpdated', fetchSupplyChainData);
      
      return () => {
        contracts.EmergencyRegistry.off('EmergencyDeclared', fetchEmergencies);
        contracts.SupplyChainTracker.off('LocationUpdated', fetchSupplyChainData);
      };
    }
  }, [networkStatus, contracts, fetchEmergencies, fetchSupplyChainData]);

  return (
    <BlockchainContext.Provider value={{
      currentAccount,
      networkStatus,
      notifications,
      emergencies,
      supplyChainData,
      connectWallet,
      submitEmergencyReport,
      allocateResources: async (requestId) => {
        const tx = await contracts.ResourceAllocation.allocateResources(requestId);
        await tx.wait();
        return tx;
      }
    }}>
      {children}
    </BlockchainContext.Provider>
  );
}

export const useBlockchain = () => useContext(BlockchainContext);
