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

# Deploy base canisters first (no dependencies)
echo "🏗️ Deploying base canisters..."
dfx deploy dao_backend 
dfx deploy dao_registry
dfx deploy dao_analytics
dfx deploy staking

# Get and verify canister IDs
DAO_BACKEND_ID=$(dfx canister id dao_backend)
STAKING_ID=$(dfx canister id staking)

echo "Debug: DAO Backend ID: ${DAO_BACKEND_ID}"
echo "Debug: Staking ID: ${STAKING_ID}"

# Format the initialization argument carefully
INIT_ARG="(principal \"${DAO_BACKEND_ID}\", principal \"${STAKING_ID}\")"
echo "Debug: Init argument: ${INIT_ARG}"

# Deploy governance with initialization arguments
echo "🏛️ Deploying governance canister..."
dfx deploy governance --argument "${INIT_ARG}" || {
    echo "❌ Governance canister deployment failed"
    dfx canister status governance
    exit 1
}

# Deploy remaining backend canisters
echo "💎 Deploying remaining backend components..."
dfx deploy treasury
dfx deploy proposals
dfx deploy assets

## Deploy ICRC-1 Ledger (token) with initial supply to Treasury
echo "🪙 Deploying ICRC-1 ledger..."
TREASURY_ID=$(dfx canister id treasury)
DEPLOYER_PRINCIPAL=$(dfx identity get-principal)

# Ensure local ledger artifacts exist
if [ ! -f third_party/icrc1/ic-icrc1-ledger.wasm.gz ] || [ ! -f third_party/icrc1/ledger.did ]; then
  echo "❌ Missing local ledger artifacts (third_party/icrc1)."
  echo "   Please run: ./scripts/fetch-ledger.sh <TAG>"
  echo "   Example:   ./scripts/fetch-ledger.sh release-2024-08-21"
  exit 1
fi

LEDGER_INIT='(variant { Init = record {
  token_name = "DAO Token";
  token_symbol = "DAO";
  decimals = opt (8 : nat8);
  minting_account = record { owner = principal "'"${TREASURY_ID}"'"; subaccount = null };
  transfer_fee = 10000;
  metadata = vec {};
  initial_balances = vec {
    record { record { owner = principal "'"${TREASURY_ID}"'"; subaccount = null }; 1000000000000 : nat }
  };
  archive_options = record {
    num_blocks_to_archive = 1000 : nat64;
    max_transactions_per_response = null;
    trigger_threshold = 2000 : nat64;
    max_message_size_bytes = opt (2097152 : nat64);
    cycles_for_archive_creation = opt (0 : nat64);
    node_max_memory_size_bytes = null;
    controller_id = principal "'"${DEPLOYER_PRINCIPAL}"'";
    more_controller_ids = null
  };
  feature_flags = opt record { icrc2 = true };
  index_principal = null
} })'

dfx deploy icrc1_ledger --argument "$LEDGER_INIT"

LEDGER_ID=$(dfx canister id icrc1_ledger)
echo "Ledger ID: ${LEDGER_ID}"

# Wire ledger to staking and treasury
dfx canister call staking setLedgerCanister "(principal \"${LEDGER_ID}\")"
dfx canister call treasury setLedgerCanister "(principal \"${LEDGER_ID}\")"

# Deploy Internet Identity canister
echo "🔐 Deploying Internet Identity..."
dfx deploy internet_identity

# Generate type declarations for backend canisters only (before frontend)
echo "📋 Generating backend type declarations..."
dfx generate dao_backend
dfx generate dao_analytics
dfx generate governance  
dfx generate staking
dfx generate treasury
dfx generate proposals
dfx generate assets
dfx generate internet_identity
dfx generate icrc1_ledger

# Copy declarations to frontend location for build
echo "📋 Copying declarations to frontend location..."
mkdir -p src/dao_frontend/src/declarations
cp -r src/declarations/* src/dao_frontend/src/declarations/

# Build frontend with generated declarations
echo "🔨 Building frontend..."
cd src/dao_frontend
npm install
npm run build
cd ../..

# Deploy frontend canister
echo "🌐 Deploying frontend..."
dfx deploy dao_frontend

# Generate all declarations 
echo "📋 Generating all type declarations..."
dfx generate

# Generate environment variables for frontend
echo "⚙️ Updating frontend environment variables..."
./scripts/update-env.sh > /dev/null

echo "✨ Deployment complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Frontend will be available at: http://localhost:4943/?canisterId=$(dfx canister id dao_frontend)"
echo "2. Start frontend development server: cd src/dao_frontend && npm run dev"
echo "3. Environment variables have been generated in .env"
