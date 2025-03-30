const fs = require('fs');
const path = require('path');

const CONTRACT_DIR = path.join(__dirname, '../../blockchain/build/contracts');
const OUTPUT_DIRS = [
  path.join(__dirname, '../../frontend/src/contracts'),
  path.join(__dirname, '../../backend/src/contracts')
];

const generateABIs = () => {
  console.log('Generating contract ABIs...');
  
  const contracts = fs.readdirSync(CONTRACT_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      name: path.basename(file, '.json'),
      data: JSON.parse(fs.readFileSync(path.join(CONTRACT_DIR, file)))
    }));

  contracts.forEach(({ name, data }) => {
    const abi = JSON.stringify(data.abi, null, 2);
    const bytecode = data.bytecode;
    
    OUTPUT_DIRS.forEach(outputDir => {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate ABI file
      fs.writeFileSync(
        path.join(outputDir, `${name}.abi.json`),
        abi
      );
      
      // Generate bytecode file
      fs.writeFileSync(
        path.join(outputDir, `${name}.bytecode.json`),
        JSON.stringify({ bytecode }, null, 2)
      );
    });
  });

  console.log(`Generated ${contracts.length} contract interfaces`);
};

generateABIs();
