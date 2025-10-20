#!/bin/bash

# Deploy Frontend Only Script
set -e

echo "🚀 Updating Frontend on IC Mainnet"
echo "=================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check current identity
CURRENT_IDENTITY=$(dfx identity whoami)
echo -e "${BLUE}Current identity: ${CURRENT_IDENTITY}${NC}"

# Handle identity setup for mainnet
if [ "$CURRENT_IDENTITY" = "default" ]; then
    echo -e "${YELLOW}⚠️ Using default identity. Suppressing mainnet warning...${NC}"
    export DFX_WARNING=-mainnet_plaintext_identity
fi

# Get existing canister IDs from current .env.production file
echo -e "${BLUE}📋 Reading existing canister IDs...${NC}"
DAO_BACKEND_ID="7k5cu-siaaa-aaaao-a4paa-cai"
GOVERNANCE_ID="7d6ji-eaaaa-aaaao-a4pbq-cai"
STAKING_ID="6suxx-4iaaa-aaaao-a4pea-cai"
TREASURY_ID="6vvrd-rqaaa-aaaao-a4peq-cai"
PROPOSALS_ID="772tz-taaaa-aaaao-a4pdq-cai"
ASSETS_ID="uulqk-jaaaa-aaaao-a4o7q-cai"

echo "Using existing canister IDs:"
echo "DAO Backend:     ${DAO_BACKEND_ID}"
echo "Governance:      ${GOVERNANCE_ID}"
echo "Staking:         ${STAKING_ID}"
echo "Treasury:        ${TREASURY_ID}"
echo "Proposals:       ${PROPOSALS_ID}"
echo "Assets:          ${ASSETS_ID}"

# Update environment variables with actual canister IDs
echo -e "${BLUE}🔧 Updating environment variables...${NC}"

# Update the frontend .env.production file
cat > src/dao_frontend/.env.production << EOF
# Production environment variables for mainnet deployment
VITE_CANISTER_ID_DAO_BACKEND=$DAO_BACKEND_ID
VITE_CANISTER_ID_GOVERNANCE=$GOVERNANCE_ID
VITE_CANISTER_ID_STAKING=$STAKING_ID
VITE_CANISTER_ID_TREASURY=$TREASURY_ID
VITE_CANISTER_ID_PROPOSALS=$PROPOSALS_ID
VITE_CANISTER_ID_ASSETS=$ASSETS_ID
VITE_CANISTER_ID_INTERNET_IDENTITY=rdmx6-jaaaa-aaaah-qdrqq-cai

# Mainnet configuration
VITE_HOST=https://icp0.io
VITE_DFX_NETWORK=ic
VITE_IC_HOST=https://icp0.io
VITE_NODE_ENV=production

# Production build optimizations
VITE_BUILD_MODE=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
EOF

echo -e "${GREEN}✅ Environment variables updated${NC}"

# Build frontend for production
echo -e "${BLUE}🏗️ Building frontend for production...${NC}"
cd src/dao_frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Clean previous build
rm -rf dist

# Build for production with explicit mode
echo "Building with production configuration..."
NODE_ENV=production npm run build -- --mode production

# Verify build output
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Frontend build failed - dist directory not found!${NC}"
    exit 1
fi

# Verify environment variables in build
echo "Verifying environment variables in build..."
if grep -q "VITE_CANISTER_ID_STAKING:\"\"" dist/assets/*.js; then
    echo -e "${RED}❌ Build failed - STAKING canister ID is empty!${NC}"
    exit 1
fi

# Show what environment variables were included
echo "Environment variables in build:"
grep -o "VITE_CANISTER_ID_[^:]*:[^,}]*" dist/assets/*.js | head -10

echo -e "${GREEN}✅ Frontend build completed successfully${NC}"
cd ../..

# Deploy frontend canister
echo -e "${BLUE}🚀 Deploying frontend canister...${NC}"
dfx deploy dao_frontend --network ic

echo -e "${GREEN}✅ Frontend deployment completed successfully!${NC}"

# Get frontend canister ID
DAO_FRONTEND_ID=$(dfx canister id dao_frontend --network ic)

echo ""
echo -e "${BLUE}🌐 Your DAOVerse frontend has been updated!${NC}"
echo ""
echo "🎯 Frontend URL: https://${DAO_FRONTEND_ID}.icp0.io/"
echo ""
echo -e "${GREEN}🎉 Frontend update completed successfully!${NC}"
