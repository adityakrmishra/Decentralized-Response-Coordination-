#!/bin/bash

# Environment Setup Script for Disaster Response Platform
set -eo pipefail

# Check dependencies
check_dependency() {
  if ! command -v $1 &> /dev/null; then
    echo "Error: $1 is required but not installed"
    exit 1
  fi
}

check_dependency node
check_dependency npm
check_dependency python3
check_dependency docker
check_dependency terraform

# Create environment files
create_env_file() {
  if [ ! -f ".env" ]; then
    cat << EOF > .env
# Blockchain Configuration
ETH_RPC_URL=https://mainnet.infura.io/v3/your-project-id
ALLOCATION_CONTRACT_ADDR=0x...
EMERGENCY_CONTRACT_ADDR=0x...

# Database Configuration
DB_HOST=localhost
DB_PORT=27017
DB_NAME=disaster_response

# API Keys
MAPBOX_TOKEN=pk.eyJ1Ijoi...
DRONE_API_KEY=drn_...
EOF
    echo "Created .env template file"
  fi
}

# Setup directories
create_directories() {
  mkdir -p \
    ./backend/logs \
    ./frontend/public/config \
    ./drone-av/simulations/output \
    ./infrastructure/terraform/state
}

# Install git hooks
install_git_hooks() {
  echo "Installing Git hooks..."
  cat << EOF > .git/hooks/pre-commit
#!/bin/sh
npm run lint && npm run test:ci
EOF

  cat << EOF > .git/hooks/pre-push
#!/bin/sh
npm run build && npm run security:audit
EOF

  chmod +x .git/hooks/pre-commit
  chmod +x .git/hooks/pre-push
}

# Main setup
main() {
  echo "Starting environment
