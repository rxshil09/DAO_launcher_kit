#!/bin/bash

# Script to update frontend environment variables with current canister IDs

echo "🔧 Updating frontend environment variables..."

# Get current canister IDs
DAO_BACKEND_ID=$(dfx canister id dao_backend)
GOVERNANCE_ID=$(dfx canister id governance)
STAKING_ID=$(dfx canister id staking)
TREASURY_ID=$(dfx canister id treasury)
PROPOSALS_ID=$(dfx canister id proposals)
ASSETS_ID=$(dfx canister id assets)
DAO_FRONTEND_ID=$(dfx canister id dao_frontend)
INTERNET_IDENTITY_ID=$(dfx canister id internet_identity)

# Update .env.local file
cat > src/dao_frontend/.env.local << EOF
# Frontend environment variables for local development
VITE_CANISTER_ID_DAO_BACKEND=${DAO_BACKEND_ID}
VITE_CANISTER_ID_GOVERNANCE=${GOVERNANCE_ID}
VITE_CANISTER_ID_STAKING=${STAKING_ID}
VITE_CANISTER_ID_TREASURY=${TREASURY_ID}
VITE_CANISTER_ID_PROPOSALS=${PROPOSALS_ID}
VITE_CANISTER_ID_ASSETS=${ASSETS_ID}
VITE_CANISTER_ID_DAO_FRONTEND=${DAO_FRONTEND_ID}
VITE_CANISTER_ID_INTERNET_IDENTITY=${INTERNET_IDENTITY_ID}

# Network configuration
VITE_HOST=http://127.0.0.1:4943
VITE_DFX_NETWORK=local
VITE_IC_HOST=http://127.0.0.1:4943
EOF

echo "✅ Environment variables updated:"
echo "DAO Backend: ${DAO_BACKEND_ID}"
echo "Governance: ${GOVERNANCE_ID}"
echo "Staking: ${STAKING_ID}"
echo "Treasury: ${TREASURY_ID}"
echo "Proposals: ${PROPOSALS_ID}"
echo "Assets: ${ASSETS_ID}"
echo "Frontend: ${DAO_FRONTEND_ID}"
echo "Internet Identity: ${INTERNET_IDENTITY_ID}"
echo ""
echo "🔄 Rebuild frontend with: cd src/dao_frontend && npm run build"
