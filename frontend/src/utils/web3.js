import { ethers } from 'ethers';
import ResourceAllocation from '../contracts/ResourceAllocation.json';
import EmergencyRegistry from '../contracts/EmergencyRegistry.json';
import SupplyChainTracker from '../contracts/SupplyChainTracker.json';

const CONTRACT_ADDRESSES = {
  ResourceAllocation: process.env.REACT_APP_RESOURCE_ALLOCATION_ADDR,
  EmergencyRegistry: process.env.REACT_APP_EMERGENCY_REGISTRY_ADDR,
  SupplyChainTracker: process.env.REACT_APP_SUPPLY_CHAIN_ADDR
};

let provider;
let signer;

export const initializeWeb3 = async () => {
  try {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      return true;
    }
    throw new Error('Ethereum provider not found');
  } catch (error) {
    throw new Error(`Web3 initialization failed: ${error.message}`);
  }
};

export const loadContract = async (contractName) => {
  if (!CONTRACT_ADDRESSES[contractName]) {
    throw new Error(`Contract address not found for ${contractName}`);
  }

  const abi = getContractABI(contractName);
  return new ethers.Contract(
    CONTRACT_ADDRESSES[contractName],
    abi,
    signer || provider
  );
};

export const sendTransaction = async (contractMethod, args, options = {}) => {
  try {
    const tx = await contractMethod(...args, {
      gasLimit: 500000,
      ...options
    });
    const receipt = await tx.wait();
    return {
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      events: receipt.events
    };
  } catch (error) {
    return {
      success: false,
      error: parseTransactionError(error)
    };
  }
};

export const formatChainError = (error) => {
  const defaultMessage = 'Blockchain operation failed';
  if (error.code === 'CALL_EXCEPTION') return 'Contract call reverted';
  if (error.code === 'INSUFFICIENT_FUNDS') return 'Insufficient balance';
  return error.reason || error.message || defaultMessage;
};

export const parseUnits = (value, decimals = 18) => 
  ethers.utils.parseUnits(value.toString(), decimals);

export const formatUnits = (value, decimals = 18) =>
  ethers.utils.formatUnits(value, decimals);

const getContractABI = (contractName) => {
  switch(contractName) {
    case 'ResourceAllocation': return ResourceAllocation.abi;
    case 'EmergencyRegistry': return EmergencyRegistry.abi;
    case 'SupplyChainTracker': return SupplyChainTracker.abi;
    default: throw new Error(`Unknown contract: ${contractName}`);
  }
};

const parseTransactionError = (error) => {
  if (error.data?.message) return error.data.message;
  if (error.message.includes('user rejected transaction')) 
    return 'Transaction rejected by user';
  return error.message;
};
