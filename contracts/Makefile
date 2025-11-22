# Makefile for TicketVerse Smart Contracts

# Environment Variables
-include .env

# Phony targets
.PHONY: all test clean deploy deploy-sepolia help

# Default target
all: clean build test

# Build contracts
build:
	forge build

# Run tests
test:
	forge test -vv

# Clean artifacts
clean:
	forge clean

# Deploy to local anvil node (for testing)
deploy-local:
	forge script script/DeployHub.s.sol:DeployHub --rpc-url http://localhost:8545 --broadcast --private-key $(PRIVATE_KEY)

# Deploy to Sepolia Testnet (Verify with Blockscout)
deploy:
	@echo "Deploying to Sepolia..."
	forge script script/DeployHub.s.sol:DeployHub \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--verify \
		--verifier blockscout \
		--verifier-url https://eth-sepolia.blockscout.com/api

# Help command
help:
	@echo "Available commands:"
	@echo "  make build          - Compile contracts"
	@echo "  make test           - Run tests"
	@echo "  make clean          - Clean build artifacts"
	@echo "  make deploy         - Deploy to Sepolia (requires .env)"
	@echo "  make deploy-local   - Deploy to local node"
