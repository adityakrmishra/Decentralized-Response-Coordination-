install:
	@echo "Installing all dependencies..."
	npm run install:all

migrate-contracts:
	@echo "Migrating smart contracts..."
	npm run migrate:contracts

start-backend:
	@echo "Starting backend server..."
	cd backend && npm run dev

start-frontend:
	@echo "Starting frontend..."
	cd frontend && npm start

simulate-drone:
	@echo "Running drone simulation..."
	python3 drone-av/simulations/pathfinding.py --env .env

test-all:
	@echo "Running all tests..."
	npm run test:all

lint:
	@echo "Linting code..."
	npm run lint

deploy-prod:
	@echo "Deploying production..."
	docker-compose -f infrastructure/docker/compose.prod.yml up --build -d

.PHONY: install migrate-contracts start-backend start-frontend simulate-drone test-all lint deploy-prod
