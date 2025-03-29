import { useContext, useEffect, useCallback } from 'react';
import { BlockchainContext } from '../contexts/BlockchainContext';
import { ethers } from 'ethers';

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }

  const { 
    currentAccount,
    contracts,
    networkStatus,
    addNotification,
    fetchEmergencies,
    fetchSupplyChainData
  } = context;

  const checkContractConnection = useCallback(async (contractName) => {
    try {
      if (!contracts[contractName]) {
        throw new Error(`${contractName} contract not initialized`);
      }
      
      const code = await contracts[contractName].provider.getCode(
        contracts[contractName].address
      );
      
      if (code === '0x') {
        throw new Error(`${contractName} contract not deployed on this network`);
      }
      
      return true;
    } catch (error) {
      addNotification(`Contract Error: ${error.message}`, 'error');
      return false;
    }
  }, [contracts, addNotification]);

  const validateAddress = (address) => {
    if (!ethers.utils.isAddress(address)) {
      addNotification('Invalid Ethereum address', 'error');
      return false;
    }
    return true;
  };

  const getContractBalance = useCallback(async (contractName) => {
    if (!await checkContractConnection(contractName)) return '0';
    
    try {
      const balance = await contracts[contractName].provider.getBalance(
        contracts[contractName].address
      );
      return ethers.utils.formatEther(balance);
    } catch (error) {
      addNotification(`Balance check failed: ${error.message}`, 'error');
      return '0';
    }
  }, [contracts, checkContractConnection, addNotification]);

  const getTransactionHistory = useCallback(async (address) => {
    try {
      if (!validateAddress(address)) return [];
      
      const provider = contracts.ResourceAllocation.provider;
      const blockNumber = await provider.getBlockNumber();
      
      const filter = {
        address: contracts.ResourceAllocation.address,
        fromBlock: blockNumber - 10000,
        toBlock: 'latest',
      };
      
      const logs = await provider.getLogs(filter);
      return logs.map(log => 
        contracts.ResourceAllocation.interface.parseLog(log)
      );
    } catch (error) {
      addNotification(`History fetch failed: ${error.message}`, 'error');
      return [];
    }
  }, [contracts, validateAddress, addNotification]);

  useEffect(() => {
    const syncData = async () => {
      if (networkStatus === 'connected') {
        await Promise.all([
          fetchEmergencies(),
          fetchSupplyChainData()
        ]);
      }
    };
    
    const interval = setInterval(syncData, 30000);
    return () => clearInterval(interval);
  }, [networkStatus, fetchEmergencies, fetchSupplyChainData]);

  return {
    ...context,
    checkContractConnection,
    validateAddress,
    getContractBalance,
    getTransactionHistory
  };
};
