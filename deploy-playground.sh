#!/bin/bash

# Deploy to Playground Script
echo "🚀 Deploying DAOVerse to Playground Network"

# Check if using secure identity
CURRENT_IDENTITY=$(dfx identity whoami)
if [ "$CURRENT_IDENTITY" = "default" ]; then
    echo "⚠️  Warning: Using default identity. For security, consider creating a new identity:"
    echo "   dfx identity new playground_identity"
    echo "   dfx identity use playground_identity"
    echo ""
    read -p "Continue with default identity? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check wallet balance
echo "💰 Checking wallet balance..."
dfx wallet balance --network playground 2>/dev/null || {
    echo "❌ No wallet found or insufficient cycles."
    echo "📝 To get cycles for playground:"
    echo "   1. Visit: https://internetcomputer.org/docs/current/developer-docs/setup/cycles/cycles-faucet"
    echo "   2. Request cycles using your principal ID: $(dfx identity get-principal)"
    echo "   3. Or use the cycles wallet at: https://nns.ic0.app/"
    exit 1
}

# Build frontend
echo "🔨 Building frontend..."
cd src/dao_frontend
npm install
npm run build
cd ../..

# Deploy canisters
echo "🚀 Deploying canisters to playground..."
dfx deploy --network playground

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "📋 Canister URLs:"
    dfx canister url dao_frontend --network playground
    echo ""
    echo "🔧 Update your .env.playground file with the new canister IDs:"
    dfx canister id dao_backend --network playground
    dfx canister id governance --network playground
    dfx canister id staking --network playground
    dfx canister id treasury --network playground
    dfx canister id proposals --network playground
    dfx canister id assets --network playground
    dfx canister id dao_frontend --network playground
else
    echo "❌ Deployment failed!"
    exit 1
fi
