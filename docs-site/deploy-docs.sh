#!/bin/bash

# Deploy Documentation Site to IC Mainnet
# This script deploys the Astro documentation site as a separate canister

set -e

echo "🚀 DAO Launcher Kit - Documentation Deployment"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "astro.config.mjs" ]; then
    echo "❌ Error: Must run from docs-site directory"
    echo "   Run: cd docs-site && ./deploy-docs.sh"
    exit 1
fi

# Check dfx identity
IDENTITY=$(dfx identity whoami)
echo "📋 Current identity: $IDENTITY"
echo ""

# Build the documentation site
echo "📦 Building documentation site..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build complete"
echo ""

# Create canister configuration if it doesn't exist
if [ ! -f "dfx.json" ]; then
    echo "📝 Creating dfx.json for docs canister..."
    cat > dfx.json << 'EOF'
{
  "canisters": {
    "docs_frontend": {
      "type": "assets",
      "source": ["dist"]
    }
  },
  "defaults": {
    "build": {
      "args": "",
      "packtool": ""
    }
  },
  "version": 1
}
EOF
    echo "✅ Created dfx.json"
fi

# Deploy to IC
echo "🌐 Deploying to Internet Computer..."
echo ""

# Check network argument
NETWORK=${1:-ic}

if [ "$NETWORK" = "local" ]; then
    echo "📍 Deploying to local replica..."
    dfx deploy docs_frontend
else
    echo "📍 Deploying to IC mainnet..."
    dfx deploy docs_frontend --network ic
    
    CANISTER_ID=$(dfx canister id docs_frontend --network ic)
    
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📚 Documentation URL:"
    echo "   https://$CANISTER_ID.icp0.io"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Update Navbar.jsx in main app with production URL:"
    echo "      href=\"https://$CANISTER_ID.icp0.io\""
    echo ""
    echo "   2. Update astro.config.mjs site URL:"
    echo "      site: 'https://$CANISTER_ID.icp0.io'"
    echo ""
    echo "   3. Test the deployed docs site"
    echo ""
fi
