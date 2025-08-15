#!/bin/bash

# DAO Launcher Kit Setup Script
# This script sets up the development environment and deploys the canisters

set -e

echo "🚀 Setting up DAO Launcher Kit..."

# Check if running in WSL
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX not found. Please install DFX first:"
    echo "   sh -ci \"\$(curl -fsSL https://sdk.dfinity.org/install.sh)\""
    exit 1
fi

# Start DFX in the background if not already running
echo "📡 Starting DFX..."
dfx start --clean --background

# Wait for DFX to be ready
echo "⏳ Waiting for DFX to be ready..."
sleep 5

# Deploy the DAO backend canister
echo "🏗️ Deploying DAO backend..."
dfx deploy dao_backend

# Deploy the assets canister
echo "📦 Deploying assets..."
dfx deploy assets

# Get canister IDs and update the environment file
echo "🔑 Getting canister IDs..."
DAO_BACKEND_ID=$(dfx canister id dao_backend)
ASSETS_ID=$(dfx canister id assets)

# Create the local environment file
echo "📝 Creating .env.local file..."
cat > .env.local << EOF
# Local Development Environment Variables (Auto-generated)
VITE_CANISTER_ID_DAO_BACKEND=$DAO_BACKEND_ID
VITE_CANISTER_ID_ASSETS=$ASSETS_ID
VITE_CANISTER_ID_GOVERNANCE=$DAO_BACKEND_ID
VITE_CANISTER_ID_STAKING=$DAO_BACKEND_ID
VITE_CANISTER_ID_TREASURY=$DAO_BACKEND_ID
VITE_CANISTER_ID_PROPOSALS=$DAO_BACKEND_ID
VITE_CANISTER_ID_INTERNET_IDENTITY=rdmx6-jaaaa-aaaaa-aaadq-cai
VITE_DFX_NETWORK=local
VITE_HOST=http://localhost:4943
EOF

# Update the frontend environment
echo "🔄 Updating frontend environment..."
cd src/dao_frontend
cp ../../.env.local .env.local

# Install frontend dependencies
echo "📥 Installing frontend dependencies..."
npm install

# Build and start the frontend
echo "🏃 Starting frontend development server..."
echo "✅ Setup complete!"
echo ""
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔧 DFX dashboard available at: http://localhost:4943/_/dashboard"
echo ""
echo "Canister IDs:"
echo "  DAO Backend: $DAO_BACKEND_ID"
echo "  Assets: $ASSETS_ID"
echo ""
echo "To start the frontend development server:"
echo "  cd src/dao_frontend && npm run dev"

# Don't start the dev server automatically, let user decide
# npm run dev
