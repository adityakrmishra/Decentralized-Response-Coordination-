import { ethers } from 'ethers';
import { ContractABIs } from '../config/contracts.js';
import { getGasPrice } from '../utils/eth.js';
import logger from '../utils/logger.js';

const BLOCKCHAIN_RPC = process.env.ETH_RPC_URL;
const CONTRACT_ADDRESSES = {
  Allocation: process.env.ALLOCATION_CONTRACT_ADDR,
  Emergency: process.env.EMERGENCY_CONTRACT_ADDR
};

class BlockchainService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(BLOCKCHAIN_RPC);
    this.wallets = new Map();
    this.contracts = new Map();
    
    this._initializeContracts();
  }

  _initializeContracts() {
    for (const [name, address] of Object.entries(CONTRACT_ADDRESSES)) {
      const contract = new ethers.Contract(
        address,
        ContractABIs[name],
        this.provider
      );
      this.contracts.set(name, contract);
    }
  }

  async allocateResources(disasterId, resourceType, quantity, signerAddress) {
    const signer = this._getSigner(signerAddress);
    const contract = this.contracts.get('Allocation').connect(signer);
    
    try {
      const gasLimit = await contract.estimateGas.allocateResources(
        disasterId, resourceType, quantity
      );
      
      const tx = await contract.allocateResources(
        disasterId, 
        resourceType, 
        quantity, 
        {
          gasLimit: gasLimit.mul(120).div(100), // 20% buffer
          gasPrice: await getGasPrice()
        }
      );
      
      return this._handleTransaction(tx);
    } catch (error) {
      logger.error(`Allocation error: ${error.message}`);
      throw this._parseBlockchainError(error);
    }
  }

  async getResourceStatus(resourceId) {
    const contract = this.contracts.get('Allocation');
    return contract.getResourceStatus(resourceId);
  }

  async listenForEvents(eventName, callback) {
    const contract = this.contracts.get('Allocation');
    const filter = contract.filters[eventName]();
    
    contract.on(filter, (...args) => {
      const event = args[args.length - 1];
      callback({
        txHash: event.transactionHash,
        block: event.blockNumber,
        event: eventName,
        args: event.args
      });
    });
  }

  _getSigner(address) {
    if (!this.wallets.has(address)) {
      const wallet = new ethers.Wallet(
        process.env.PRIVATE_KEY, 
        this.provider
      );
      this.wallets.set(address, wallet);
    }
    return this.wallets.get(address);
  }

  async _handleTransaction(tx) {
    const receipt = await tx.wait();
    if (receipt.status !== 1) {
      throw new Error('Transaction failed');
    }
    return {
      txHash: tx.hash,
      block: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  }

  _parseBlockchainError(error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return new Error('Insufficient balance for transaction');
    }
    if (error.data?.message?.includes('revert')) {
      const reason = error.data.message.match(/revert (.*)/)[1];
      return new Error(`Contract error: ${reason}`);
    }
    return error;
  }
}

export const blockchainService = new BlockchainService();
