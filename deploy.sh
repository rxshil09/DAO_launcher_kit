#!/bin/bash

set -e  # Exit on error
set -x  # Print commands for debugging

echo "🚀 Starting DAO deployment..."

# Stop any running dfx instances and clean state
dfx stop
rm -rf .dfx

# Start dfx in the background
echo "📦 Starting Internet Computer replica..."
dfx start --clean --background

sleep 5

# Deploy base canisters first
echo "🏗️ Deploying base canisters..."
dfx deploy dao_backend
dfx deploy staking

# Get and verify canister IDs
DAO_BACKEND_ID=$(dfx canister id dao_backend)
STAKING_ID=$(dfx canister id staking)

echo "Debug: DAO Backend ID: ${DAO_BACKEND_ID}"
echo "Debug: Staking ID: ${STAKING_ID}"

# Format the initialization argument carefully
INIT_ARG="(principal \"${DAO_BACKEND_ID}\", principal \"${STAKING_ID}\")"
echo "Debug: Init argument: ${INIT_ARG}"

# Try deploying governance
echo "🏛️ Deploying governance canister..."
dfx deploy governance --argument "${INIT_ARG}" || {
    echo "❌ Governance canister deployment failed"
    dfx canister status governance
    exit 1
}

# Only continue if governance deployed successfully
echo "💎 Deploying remaining components..."
dfx deploy treasury
dfx deploy proposals
dfx deploy assets
dfx deploy dao_frontend

echo "✨ Deployment complete!"