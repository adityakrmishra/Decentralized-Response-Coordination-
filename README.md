# Decentralized Response Coordination & Citizen Engagement Portal
![Python](https://img.shields.io/badge/Python-3.9%2B-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A blockchain-powered platform to automate disaster response logistics and empower community participation.

## 📌 Overview

This project combines **decentralized resource allocation** via smart contracts with a **citizen engagement portal** to:
- Automatically redirect emergency supplies (medical kits, food, etc.) to disaster zones using blockchain.
- Deploy drones/autonomous vehicles for rapid delivery.
- Provide real-time updates, reporting tools, and transparency for affected communities.

## ✨ Features

### 🌐 Decentralized Response Coordination
- **Smart Contract Automation**: Resource allocation logic encoded on-chain (e.g., Ethereum).
- **Drone/AV Integration**: APIs to coordinate with drones/autonomous delivery systems.
- **Transparent Tracking**: Immutable records of supply chain movements on the blockchain.

### 🧑💻 Citizen Engagement Portal
- **Real-Time Alerts**: Map-based interface showing disaster zones and resource status.
- **Community Reporting**: Citizens can submit incident reports/needs via web/mobile.
- **Supply Tracking**: Verify delivery status of resources using blockchain IDs.

## 🛠️ Technologies
- **Blockchain**: Ethereum/Solidity (smart contracts), IPFS (data storage)
- **Frontend**: React.js, Web3.js, Mapbox
- **Backend**: Node.js, Express.js
- **Drones/AV**: Simulation APIs (e.g., ROS/Gazebo), Hardware SDKs (vendor-specific)

## 🚀 Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/adityakrmishra/decentralized-response-coordination.git
   cd decentralized-response-coordination
   ```
2. Install Dependencies
   ```bash
   # Smart Contracts
    cd blockchain
    npm install

   # Frontend
   cd ../frontend
   npm install
   ```
3. Configure Environment
- Add .env files with:
  - Blockchain network credentials (e.g., Infura API, Metamask keys)
  - Mapbox API token
  - Drone/AV service keys

  ## 🖥️ Usage
1. Deploy Smart Contracts
```bash
cd blockchain
truffle migrate --network ropsten  # Example for Ethereum testnet
```
2. Start Citizen Portal
```bash
cd frontend
npm start
```
3. Simulate Disaster Response
- Use the portal to:
  - Trigger a mock disaster scenario
  - Monitor smart contract-driven resource allocation
  - Track drone delivery simulations

## 🤝 Contributing
1. Fork the repository.
2. Create a feature branch: git checkout -b feature/new-feature.
3. Commit changes: git commit -m 'Add new feature'.
4. Push to the branch: git push origin feature/new-feature.
5. Open a Pull Request.

## 📜 License
MIT License. See LICENSE for details.

# Project Structure
```
decentralized-response-coordination/
├── blockchain/
│ ├── contracts/
│ │ ├── ResourceAllocation.sol
│ │ ├── EmergencyRegistry.sol
│ │ └── SupplyChainTracker.sol
│ ├── migrations/
│ │ ├── 1_deploy_core.js
│ │ └── 2_deploy_registry.js
│ ├── test/
│ │ ├── unit/
│ │ │ ├── allocation-tests.js
│ │ │ ├── registry-tests.js
│ │ │ ├── supplychain-tests.js
│ │ │ ├── edge-cases.js
│ │ │ └── event-tests.js
│ │ ├── integration/
│ │ │ ├── full-flow-test.js
│ │ │ └── cross-contract-test.js
│ │ ├── security/
│ │ │ ├── reentrancy-test.js
│ │ │ └── overflow-test.js
│ │ └── helpers/
│ │ ├── test-utils.js
│ │ └── mock-data.js
│ ├── truffle-config.js
│ └── package.json
│
├── frontend/
│ ├── public/
│ │ ├── index.html
│ │ ├── robots.txt
│ │ └── manifest.json
│ ├── src/
│ │ ├── components/
│ │ │ ├── Map/
│ │ │ │ ├── MapInterface.jsx
│ │ │ │ └── HeatmapLayer.jsx
│ │ │ ├── Reporting/
│ │ │ │ ├── ReportPortal.jsx
│ │ │ │ └── MediaUpload.jsx
│ │ │ └── common/
│ │ │ ├── Header.jsx
│ │ │ └── Footer.jsx
│ │ ├── contexts/
│ │ │ └── BlockchainContext.jsx
│ │ ├── hooks/
│ │ │ ├── useBlockchain.js
│ │ │ └── useGeoLocation.js
│ │ ├── assets/
│ │ │ ├── styles/
│ │ │ │ ├── main.scss
│ │ │ │ └── variables.scss
│ │ │ └── icons/
│ │ ├── utils/
│ │ │ ├── web3.js
│ │ │ └── api.js
│ │ ├── App.jsx
│ │ └── index.js
│ ├── tests/
│ │ ├── unit/
│ │ │ ├── Header.test.jsx
│ │ │ ├── MapInterface.test.jsx
│ │ │ └── hooks.test.js
│ │ └── integration/
│ │ ├── full-flow.cy.js
│ │ └── reporting.cy.js
│ ├── .eslintrc
│ ├── .prettierrc
│ └── package.json
│
├── backend/
│ ├── src/
│ │ ├── routes/
│ │ │ ├── v1/
│ │ │ │ ├── disaster.routes.js
│ │ │ │ └── drone.routes.js
│ │ │ └── healthcheck.js
│ │ ├── controllers/
│ │ │ ├── allocation.controller.js
│ │ │ └── drone.controller.js
│ │ ├── models/
│ │ │ ├── Disaster.schema.js
│ │ │ └── Resource.schema.js
│ │ ├── middleware/
│ │ │ ├── auth.js
│ │ │ └── validation.js
│ │ ├── services/
│ │ │ ├── blockchain.service.js
│ │ │ └── drone.service.js
│ │ ├── config/
│ │ │ ├── db.js
│ │ │ └── env.js
│ │ ├── tests/
│ │ │ ├── unit/
│ │ │ │ ├── controllers.test.js
│ │ │ │ └── services.test.js
│ │ │ └── integration/
│ │ │ ├── api-tests.js
│ │ │ └── drone-tests.js
│ │ └── server.js
│ ├── Dockerfile
│ └── package.json
│
├── drone-av/
│ ├── simulations/
│ │ ├── pathfinding.py
│ │ ├── failure-scenarios.py
│ │ └── payload-tests.py
│ ├── hardware/
│ │ ├── dji-integration.js
│ │ └── ardupilot-integration.js
│ ├── config/
│ │ ├── flight-params.yaml
│ │ └── safety-rules.yaml
│ ├── tests/
│ │ ├── navigation-tests.py
│ │ └── hardware-tests.py
│ └── scripts/
│ ├── deploy.sh
│ └── maintenance.sh
│
├── infrastructure/
│ ├── terraform/
│ │ ├── main.tf
│ │ └── variables.tf
│ └── docker/
│ ├── compose.prod.yml
│ └── compose.dev.yml
│
├── docs/
│ ├── API.md
│ ├── ARCHITECTURE.md
│ └── DEPLOYMENT.md
│
├── .github/
│ └── workflows/
│ ├── ci.yml
│ └── cd.yml
│
├── scripts/
│ ├── setup-env.sh
│ └── codegen/
│ ├── contract-abis.js
│ └── type-definitions.js
│── requiremenrs.txt
├── .env.example
├── .gitignore
├── package.json
├── Makefile
├── Dockerfile
├── LICENSE
└── README.md
```
