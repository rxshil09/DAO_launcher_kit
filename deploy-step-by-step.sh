#!/bin/bash

# Step-by-step deployment script for troubleshootingecho "Step 7: Building frontend..."
cd src/dao_frontend
npm install
npm run build
cd ../..
echo "✅ Frontend built"
wait_for_confirmation

echo "Step 8: Deploying frontend..."
dfx deploy dao_frontend
echo "✅ Frontend deployed"
wait_for_confirmation

echo "Step 9: Generating all declarations..." the main deploy.sh script encounters issues

set -e  # Exit on error

echo "🔧 Step-by-step DAO deployment for troubleshooting..."

# Function to wait for user confirmation
wait_for_confirmation() {
    echo "Press Enter to continue to next step (or Ctrl+C to abort)..."
    read
}

echo "Step 1: Cleaning and starting dfx..."
dfx stop || true
rm -rf .dfx || true
dfx start --clean --background
echo "✅ DFX started. Waiting 5 seconds for initialization..."
sleep 5
wait_for_confirmation

echo "Step 2: Deploying base canisters (dao_backend, staking)..."
dfx deploy dao_backend
dfx deploy staking
echo "✅ Base canisters deployed"
wait_for_confirmation

echo "Step 3: Getting canister IDs and deploying governance..."
DAO_BACKEND_ID=$(dfx canister id dao_backend)
STAKING_ID=$(dfx canister id staking)
echo "DAO Backend ID: ${DAO_BACKEND_ID}"
echo "Staking ID: ${STAKING_ID}"

INIT_ARG="(principal \"${DAO_BACKEND_ID}\", principal \"${STAKING_ID}\")"
echo "Governance init argument: ${INIT_ARG}"

dfx deploy governance --argument "${INIT_ARG}"
echo "✅ Governance canister deployed"
wait_for_confirmation

echo "Step 4: Deploying remaining backend canisters..."
dfx deploy treasury
dfx deploy proposals
dfx deploy assets
echo "✅ Backend canisters deployed"
wait_for_confirmation

echo "Step 5: Deploying Internet Identity..."
dfx deploy internet_identity
echo "✅ Internet Identity deployed"
wait_for_confirmation

echo "Step 6: Generating backend declarations..."
dfx generate dao_backend
dfx generate governance  
dfx generate staking
dfx generate treasury
dfx generate proposals
dfx generate assets
dfx generate internet_identity

# Copy declarations to frontend location
echo "📋 Copying declarations to frontend location..."
mkdir -p src/dao_frontend/src/declarations
cp -r src/declarations/* src/dao_frontend/src/declarations/
echo "✅ Backend declarations generated and copied"
wait_for_confirmation

echo "Step 7: Building frontend..."
cd src/dao_frontend
npm install
npm run build
cd ../..
echo "✅ Frontend built"
wait_for_confirmation

echo "Step 7: Deploying frontend..."
dfx deploy dao_frontend
echo "✅ Frontend deployed"
wait_for_confirmation

echo "Step 8: Generating all declarations..."
dfx generate
echo "✅ All declarations generated"

echo "🎉 Deployment complete!"
echo ""
echo "Frontend URL: http://localhost:4943/?canisterId=$(dfx canister id dao_frontend)"
echo "Dev server: cd src/dao_frontend && npm run dev"
