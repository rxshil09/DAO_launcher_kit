#!/bin/bash

echo "🚀 Starting DAO deployment..."

# Stop any running dfx instances
dfx stop

# Clean .dfx directory
rm -rf .dfx

# Start dfx in the background
echo "📦 Starting Internet Computer replica..."
dfx start --clean --background

# Wait for the replica to be ready
sleep 5

# Deploy canisters in the correct order
echo "🏗️ Deploying identity and asset canisters..."
dfx deploy internet_identity
dfx deploy assets

echo "💎 Deploying core DAO components..."
# Deploy base canisters first
dfx deploy treasury
dfx deploy staking
dfx deploy proposals

# Deploy governance with proper initialization
echo "🏛️ Deploying governance canister..."
dfx deploy governance --argument "(
  record {
    admin_principal = principal \"$(dfx identity get-principal)\";
    min_proposal_threshold = 100_000_000;
    quorum_percentage = 51;
  }
)"

# Deploy frontend components last
echo "🖥️ Deploying frontend components..."
dfx deploy dao_frontend
dfx deploy dao_backend

echo "✨ Deployment complete! Your DAO is ready."