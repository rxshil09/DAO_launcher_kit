#!/bin/bash

# Quick fix script for missing declarations

echo "🔧 Fixing declaration imports..."

# Generate all backend declarations
echo "📋 Generating all backend declarations..."
dfx generate dao_backend
dfx generate governance  
dfx generate staking
dfx generate treasury
dfx generate proposals
dfx generate assets
dfx generate internet_identity

# Copy to frontend location
echo "📋 Copying declarations to frontend..."
mkdir -p src/dao_frontend/src/declarations
cp -r src/declarations/* src/dao_frontend/src/declarations/

# List what we have
echo "✅ Available declarations:"
ls -la src/dao_frontend/src/declarations/

echo ""
echo "🔄 Now you can build the frontend:"
echo "  cd src/dao_frontend && npm run build"
