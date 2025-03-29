# integration/blockchain_bridge.py
from web3 import Web3
import json

class BlockchainIntegrator:
    def __init__(self, rpc_url):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        with open('contracts/EmergencyRegistry.json') as f:
            contract_abi = json.load(f)['abi']
        self.contract = self.w3.eth.contract(
            address='0x...', 
            abi=contract_abi
        )
    
    def get_active_emergencies(self):
        """Fetch emergencies from blockchain"""
        return self.contract.functions.getActiveEmergencies().call()
    
    def submit_resource_allocation(self, tx_data):
        """Submit resource allocation transaction"""
        tx_hash = self.contract.functions.allocateResources(
            tx_data['disasterId'],
            tx_data['resourceType'],
            tx_data['quantity']
        ).transact({
            'from': tx_data['from'],
            'gas': 500000
        })
        return tx_hash.hex()
