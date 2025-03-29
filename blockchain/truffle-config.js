require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const { ETH_RPC, POLYGON_RPC, BSC_RPC } = require('./utils/networks');

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gas: 6721975,
      gasPrice: 20000000000,
    },
    mainnet: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.MNEMONIC,
        providerOrUrl: ETH_RPC.mainnet,
        addressIndex: 0,
        numberOfAddresses: 10,
        chainId: 1
      }),
      network_id: 1,
      gas: 5500000,
      gasPrice: 35000000000, // 35 Gwei
      confirmations: 3,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    goerli: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.MNEMONIC,
        providerOrUrl: ETH_RPC.goerli,
        addressIndex: 0,
        numberOfAddresses: 10,
        chainId: 5
      }),
      network_id: 5,
      gas: 5500000,
      gasPrice: 10000000000, // 10 Gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: false
    },
    polygon: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.MNEMONIC,
        providerOrUrl: POLYGON_RPC.mainnet,
        addressIndex: 0,
        numberOfAddresses: 10,
        chainId: 137
      }),
      network_id: 137,
      gas: 5500000,
      gasPrice: 35000000000,
      confirmations: 3,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    bsc: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.MNEMONIC,
        providerOrUrl: BSC_RPC.mainnet,
        addressIndex: 0,
        numberOfAddresses: 10,
        chainId: 56
      }),
      network_id: 56,
      gas: 5500000,
      gasPrice: 5000000000, // 5 Gwei
      confirmations: 3,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: '0.8.19',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
          details: {
            yul: true,
            yulDetails: {
              stackAllocation: true,
              optimizerSteps: 'dhfoDgvulfnTUtnIf'
            }
          }
        },
        evmVersion: 'london'
      }
    }
  },
  plugins: [
    'truffle-plugin-verify',
    'solidity-coverage',
    'truffle-contract-size'
  ],
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY,
    polygonscan: process.env.POLYGONSCAN_API_KEY,
    bscscan: process.env.BSCSCAN_API_KEY
  },
  mocha: {
    timeout: 100000
  },
  db: {
    enabled: false
  }
};
