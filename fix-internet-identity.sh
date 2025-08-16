#!/bin/bash

# Quick fix script to deploy Internet Identity and copy declarations

set -e

echo "🔐 Deploying Internet Identity canister..."
dfx deploy internet_identity

echo "📋 Regenerating all declarations..."
dfx generate

echo "📋 Copying declarations to frontend location..."
mkdir -p src/dao_frontend/src/declarations
cp -r src/declarations/* src/dao_frontend/src/declarations/

echo "✅ Internet Identity deployed and declarations updated!"
echo ""
echo "You can now build the frontend:"
echo "  cd src/dao_frontend && npm run build"
