const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONTRACT_TYPES_DIR = path.join(__dirname, '../../frontend/src/types/contracts');
const ABI_DIR = path.join(__dirname, '../../frontend/src/contracts');

const generateTypes = () => {
  console.log('Generating TypeScript definitions...');
  
  try {
    // Generate TypeChain typings
    execSync(
      `typechain --target ethers-v5 --out-dir ${CONTRACT_TYPES_DIR} ${ABI_DIR}/*.abi.json`,
      { stdio: 'inherit' }
    );

    // Generate enum types
    const contractNames = fs.readdirSync(ABI_DIR)
      .filter(file => file.endsWith('.abi.json'))
      .map(file => path.basename(file, '.abi.json'));
    
    const enumDefinitions = contractNames
      .map(name => `export type ${name}ContractAddress = string;`)
      .join('\n');

    fs.writeFileSync(
      path.join(CONTRACT_TYPES_DIR, 'contracts.ts'),
      `// Auto-generated contract address types\n${enumDefinitions}`
    );

    console.log('Type definitions generated successfully');
  } catch (error) {
    console.error('Error generating types:', error.message);
    process.exit(1);
  }
};

generateTypes();
