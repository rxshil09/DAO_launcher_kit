#!/bin/bash

# Deploy to IC Mainnet Script
set -e

echo "🚀 Deploying DAOVerse to IC Mainnet"
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
elif [ "$CURRENT_IDENTITY" = "mainnet_deploy" ] || [ "$CURRENT_IDENTITY" = "mainnet_backup" ]; then
    echo -e "${GREEN}✅ Using secure mainnet identity: ${CURRENT_IDENTITY}${NC}"
else
    echo -e "${YELLOW}⚠️ Using identity: ${CURRENT_IDENTITY}${NC}"
    echo -e "${YELLOW}Make sure this identity has sufficient cycles for deployment${NC}"
fi

# Check cycles balance properly
echo -e "${BLUE}💰 Checking cycles balance...${NC}"
if dfx cycles balance --network ic > /dev/null 2>&1; then
    CYCLES_BALANCE=$(dfx cycles balance --network ic)
    echo "Cycles balance: $CYCLES_BALANCE"
    
    # Extract numeric value for comparison
    CYCLES_NUM=$(echo "$CYCLES_BALANCE" | grep -o '[0-9.]*' | head -1)
    
    if (( $(echo "$CYCLES_NUM < 3.5" | bc -l) )); then
        echo -e "${RED}❌ Insufficient cycles for deployment!${NC}"
        echo -e "${YELLOW}You need at least 3.5T cycles for deployment.${NC}"
        echo -e "${YELLOW}Current balance: $CYCLES_BALANCE${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Sufficient cycles available: $CYCLES_BALANCE${NC}"
else
    echo -e "${YELLOW}⚠️ Could not check cycles balance, proceeding with deployment...${NC}"
fi

# First deploy backend canisters to get their IDs
echo -e "${BLUE}🚀 Deploying backend canisters first...${NC}"

# Deploy backend canisters in order
dfx deploy dao_backend --network ic
dfx deploy staking --network ic
dfx deploy treasury --network ic
dfx deploy proposals --network ic
dfx deploy assets --network ic

# Deploy governance with proper arguments
DAO_BACKEND_ID=$(dfx canister id dao_backend --network ic)
STAKING_ID=$(dfx canister id staking --network ic)
dfx deploy governance --network ic --argument "(principal \"$DAO_BACKEND_ID\", principal \"$STAKING_ID\")"

echo -e "${GREEN}✅ Backend canisters deployed${NC}"

# Update environment variables with actual canister IDs
echo -e "${BLUE}🔧 Updating environment variables with deployed canister IDs...${NC}"

# Get all canister IDs
GOVERNANCE_ID=$(dfx canister id governance --network ic)
TREASURY_ID=$(dfx canister id treasury --network ic)
PROPOSALS_ID=$(dfx canister id proposals --network ic)
ASSETS_ID=$(dfx canister id assets --network ic)

# Update the root .env.production file
cat > .env.production << EOF
# Production Environment Variables
VITE_CANISTER_ID_DAO_BACKEND=$DAO_BACKEND_ID
VITE_CANISTER_ID_GOVERNANCE=$GOVERNANCE_ID
VITE_CANISTER_ID_STAKING=$STAKING_ID
VITE_CANISTER_ID_TREASURY=$TREASURY_ID
VITE_CANISTER_ID_PROPOSALS=$PROPOSALS_ID
VITE_CANISTER_ID_ASSETS=$ASSETS_ID
VITE_CANISTER_ID_INTERNET_IDENTITY=rdmx6-jaaaa-aaaah-qdrqq-cai

VITE_DFX_NETWORK=ic
VITE_HOST=https://icp0.io
EOF

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

echo -e "${GREEN}✅ Frontend build completed successfully${NC}"
cd ../..

# Deploy frontend canister
echo -e "${BLUE}🚀 Deploying frontend canister...${NC}"
dfx deploy dao_frontend --network ic

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

# Get final deployed canister IDs
echo -e "${BLUE}📋 Getting final deployed canister IDs...${NC}"
DAO_FRONTEND_ID=$(dfx canister id dao_frontend --network ic)

echo -e "${GREEN}✅ All canisters deployed successfully!${NC}"
echo ""
echo -e "${BLUE}🌐 Your DAOVerse is now live on IC Mainnet!${NC}"
echo ""
echo "🎯 Frontend URL: https://${DAO_FRONTEND_ID}.icp0.io/"
echo ""
echo -e "${BLUE}📋 Deployed Canister IDs:${NC}"
echo "DAO Backend:     ${DAO_BACKEND_ID}"
echo "Governance:      ${GOVERNANCE_ID}"
echo "Staking:         ${STAKING_ID}"
echo "Treasury:        ${TREASURY_ID}"
echo "Proposals:       ${PROPOSALS_ID}"
echo "Assets:          ${ASSETS_ID}"
echo "Frontend:        ${DAO_FRONTEND_ID}"
echo ""
echo -e "${BLUE}🔧 Backend Candid UIs:${NC}"
echo "DAO Backend:     https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=${DAO_BACKEND_ID}"
echo "Governance:      https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=${GOVERNANCE_ID}"
echo "Staking:         https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=${STAKING_ID}"
echo "Treasury:        https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=${TREASURY_ID}"
echo "Proposals:       https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=${PROPOSALS_ID}"
echo "Assets:          https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=${ASSETS_ID}"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "1. Test your application at the frontend URL"
echo "2. Monitor canister cycles with: ./manage-cycles.sh ic"
echo "3. Set up monitoring and alerts"
echo ""
echo -e "${GREEN}🎉 Happy DAOing on the Internet Computer!${NC}"

# Final cycles check
echo -e "${BLUE}💰 Final cycles check...${NC}"
FINAL_BALANCE=$(dfx cycles balance --network ic 2>/dev/null || echo "Unable to check")
echo "Remaining cycles balance: $FINAL_BALANCE"