#!/bin/bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
  printf "%b%s%b\n" "${BLUE}" "$1" "${NC}";
}

log_warn() {
  printf "%b%s%b\n" "${YELLOW}" "$1" "${NC}";
}

log_success() {
  printf "%b%s%b\n" "${GREEN}" "$1" "${NC}";
}

log_error() {
  printf "%b%s%b\n" "${RED}" "$1" "${NC}";
}

log_info "Deploying DAOVerse to IC Mainnet"
printf "==================================\n\n"

CURRENT_IDENTITY=$(dfx identity whoami)
log_info "Current identity: ${CURRENT_IDENTITY}"

if [ "${CURRENT_IDENTITY}" = "default" ]; then
  log_warn "Using default identity. Suppressing mainnet warning..."
  export DFX_WARNING=-mainnet_plaintext_identity
elif [ "${CURRENT_IDENTITY}" = "mainnet_deploy" ] || [ "${CURRENT_IDENTITY}" = "mainnet_backup" ]; then
  log_success "Using secure mainnet identity: ${CURRENT_IDENTITY}"
else
  log_warn "Using identity: ${CURRENT_IDENTITY}"
  log_warn "Make sure this identity has sufficient cycles for deployment"
fi

log_info "Checking cycles balance..."
if dfx cycles balance --network ic > /dev/null 2>&1; then
  CYCLES_BALANCE=$(dfx cycles balance --network ic)
  printf "Cycles balance: %s\n" "${CYCLES_BALANCE}"
  CYCLES_NUM=$(printf "%s" "${CYCLES_BALANCE}" | tr -cd '0-9.')
  if [ -n "${CYCLES_NUM}" ]; then
    if awk -v num="${CYCLES_NUM}" -v req="3.5" 'BEGIN { exit (num + 0 < req + 0) ? 0 : 1 }'; then
      log_error "Insufficient cycles for deployment!"
      log_warn "You need at least 3.5T cycles for deployment."
      log_warn "Current balance: ${CYCLES_BALANCE}"
      exit 1
    fi
  fi
  log_success "Sufficient cycles available: ${CYCLES_BALANCE}"
else
  log_warn "Could not check cycles balance, proceeding with deployment..."
fi

log_info "Deploying backend canisters..."
dfx deploy dao_backend --network ic
dfx deploy dao_registry --network ic
dfx deploy dao_analytics --network ic
dfx deploy staking --network ic
dfx deploy treasury --network ic
dfx deploy proposals --network ic
dfx deploy assets --network ic

DAO_BACKEND_ID=$(dfx canister id dao_backend --network ic)
DAO_REGISTRY_ID=$(dfx canister id dao_registry --network ic)
DAO_ANALYTICS_ID=$(dfx canister id dao_analytics --network ic)
STAKING_ID=$(dfx canister id staking --network ic)
TREASURY_ID=$(dfx canister id treasury --network ic)

GOVERNANCE_ARG="(principal \"${DAO_BACKEND_ID}\", principal \"${STAKING_ID}\")"
log_info "Deploying governance canister..."
dfx deploy governance --network ic --argument "${GOVERNANCE_ARG}"

GOVERNANCE_ID=$(dfx canister id governance --network ic)
PROPOSALS_ID=$(dfx canister id proposals --network ic)
ASSETS_ID=$(dfx canister id assets --network ic)

log_info "Deploying ICRC-1 ledger canister..."
if [ ! -f third_party/icrc1/ic-icrc1-ledger.wasm.gz ] || [ ! -f third_party/icrc1/ledger.did ] ; then
  log_error "Missing local ledger artifacts (third_party/icrc1)."
  log_warn "Please run: ./scripts/fetch-ledger.sh <TAG>"
  log_warn "Example:   ./scripts/fetch-ledger.sh release-2024-08-21"
  exit 1
fi

DEPLOYER_PRINCIPAL=$(dfx identity get-principal)

# Token distribution for mainnet:
# Total Supply: 1,000,000,000,000 (1 trillion tokens with 8 decimals = 10,000 DAO tokens)
# - Treasury: 400,000,000,000 (40% = 4,000 DAO tokens)
# - Deployer/Founder: 200,000,000,000 (20% = 2,000 DAO tokens)
# - Community Pool: 400,000,000,000 (40% = 4,000 DAO tokens - goes to treasury)

log_info "Token Distribution:"
log_info "  Treasury:        400,000,000,000 (40%)"
log_info "  Deployer:        200,000,000,000 (20%)"
log_info "  Community Pool:  400,000,000,000 (40%)"
log_info "  Total:         1,000,000,000,000 (100%)"
log_info ""
log_info "  Deployer Principal: ${DEPLOYER_PRINCIPAL}"
log_info "  Treasury Principal: ${TREASURY_ID}"

LEDGER_INIT=$(cat <<EOF
(variant { Init = record {
  token_name = "DAO Token";
  token_symbol = "DAO";
  decimals = opt (8 : nat8);
  minting_account = record { owner = principal "${TREASURY_ID}"; subaccount = null };
  transfer_fee = 10000;
  metadata = vec {};
  initial_balances = vec {
    record { record { owner = principal "${TREASURY_ID}"; subaccount = null }; 800000000000 : nat };
    record { record { owner = principal "${DEPLOYER_PRINCIPAL}"; subaccount = null }; 200000000000 : nat }
  };
  archive_options = record {
    num_blocks_to_archive = 1000 : nat64;
    max_transactions_per_response = null;
    trigger_threshold = 2000 : nat64;
    max_message_size_bytes = opt (2097152 : nat64);
    cycles_for_archive_creation = opt (0 : nat64);
    node_max_memory_size_bytes = null;
    controller_id = principal "${DEPLOYER_PRINCIPAL}";
    more_controller_ids = null
  };
  feature_flags = opt record { icrc2 = true };
  index_principal = null
} })
EOF
)

dfx deploy icrc1_ledger --network ic --argument "${LEDGER_INIT}"
LEDGER_ID=$(dfx canister id icrc1_ledger --network ic)

log_info "Linking ledger canister to staking and treasury..."
dfx canister call --network ic staking setLedgerCanister "(principal \"${LEDGER_ID}\")"
dfx canister call --network ic treasury setLedgerCanister "(principal \"${LEDGER_ID}\")"

log_success "Backend canisters deployed"

log_info "Updating environment variables with deployed canister IDs..."
cat > .env.production <<EOF
# Production Environment Variables
VITE_CANISTER_ID_DAO_BACKEND=${DAO_BACKEND_ID}
VITE_CANISTER_ID_DAO_REGISTRY=${DAO_REGISTRY_ID}
VITE_CANISTER_ID_DAO_ANALYTICS=${DAO_ANALYTICS_ID}
VITE_CANISTER_ID_GOVERNANCE=${GOVERNANCE_ID}
VITE_CANISTER_ID_STAKING=${STAKING_ID}
VITE_CANISTER_ID_TREASURY=${TREASURY_ID}
VITE_CANISTER_ID_PROPOSALS=${PROPOSALS_ID}
VITE_CANISTER_ID_ASSETS=${ASSETS_ID}
VITE_CANISTER_ID_LEDGER=${LEDGER_ID}
VITE_CANISTER_ID_INTERNET_IDENTITY=rdmx6-jaaaa-aaaah-qdrqq-cai

VITE_DFX_NETWORK=ic
VITE_HOST=https://icp0.io
EOF

cat > src/dao_frontend/.env.production <<EOF
# Production environment variables for mainnet deployment
VITE_CANISTER_ID_DAO_BACKEND=${DAO_BACKEND_ID}
VITE_CANISTER_ID_DAO_REGISTRY=${DAO_REGISTRY_ID}
VITE_CANISTER_ID_DAO_ANALYTICS=${DAO_ANALYTICS_ID}
VITE_CANISTER_ID_GOVERNANCE=${GOVERNANCE_ID}
VITE_CANISTER_ID_STAKING=${STAKING_ID}
VITE_CANISTER_ID_TREASURY=${TREASURY_ID}
VITE_CANISTER_ID_PROPOSALS=${PROPOSALS_ID}
VITE_CANISTER_ID_ASSETS=${ASSETS_ID}
VITE_CANISTER_ID_LEDGER=${LEDGER_ID}
VITE_CANISTER_ID_INTERNET_IDENTITY=7wzyf-fiaaa-aaaao-a4pca-cai

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

log_success "Environment variables updated"

log_info "Building frontend for production..."
cd src/dao_frontend
if [ ! -d "node_modules" ]; then
  log_info "Installing frontend dependencies..."
  npm install
fi

rm -rf dist
printf "Building with production configuration...\n"
NODE_ENV=production npm run build -- --mode production

if [ ! -d "dist" ]; then
  log_error "Frontend build failed - dist directory not found!"
  exit 1
fi

if grep -q 'VITE_CANISTER_ID_STAKING:\"\"' dist/assets/*.js 2>/dev/null; then
  log_error "Build failed - staking canister ID is empty in built assets!"
  exit 1
fi

log_success "Frontend build completed successfully"
cd ../..

log_info "Deploying frontend canister..."
dfx deploy dao_frontend --network ic

log_success "Deployment completed successfully!"

DAO_FRONTEND_ID=$(dfx canister id dao_frontend --network ic)

printf "\n"
log_info "Your DAOVerse is now live on IC Mainnet!"
printf "\nFrontend URL: https://${DAO_FRONTEND_ID}.icp0.io/\n"

printf "Deployed Canister IDs:\n"
printf "DAO Backend:     %s\n" "${DAO_BACKEND_ID}"
printf "DAO Registry:    %s\n" "${DAO_REGISTRY_ID}"
printf "DAO Analytics:   %s\n" "${DAO_ANALYTICS_ID}"
printf "Governance:      %s\n" "${GOVERNANCE_ID}"
printf "Staking:         %s\n" "${STAKING_ID}"
printf "Treasury:        %s\n" "${TREASURY_ID}"
printf "Proposals:       %s\n" "${PROPOSALS_ID}"
printf "Assets:          %s\n" "${ASSETS_ID}"
printf "Ledger:          %s\n" "${LEDGER_ID}"
printf "Frontend:        %s\n" "${DAO_FRONTEND_ID}"

CANDID_BASE="https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id="
printf "\nBackend Candid UIs:\n"
printf "DAO Backend:     %s%s\n" "${CANDID_BASE}" "${DAO_BACKEND_ID}"
printf "DAO Registry:    %s%s\n" "${CANDID_BASE}" "${DAO_REGISTRY_ID}"
printf "DAO Analytics:   %s%s\n" "${CANDID_BASE}" "${DAO_ANALYTICS_ID}"
printf "Governance:      %s%s\n" "${CANDID_BASE}" "${GOVERNANCE_ID}"
printf "Staking:         %s%s\n" "${CANDID_BASE}" "${STAKING_ID}"
printf "Treasury:        %s%s\n" "${CANDID_BASE}" "${TREASURY_ID}"
printf "Proposals:       %s%s\n" "${CANDID_BASE}" "${PROPOSALS_ID}"
printf "Assets:          %s%s\n" "${CANDID_BASE}" "${ASSETS_ID}"
printf "Ledger:          %s%s\n" "${CANDID_BASE}" "${LEDGER_ID}"

printf "\nNext Steps:\n"
printf "1. Test your application at the frontend URL\n"
printf "2. Monitor canister cycles with: ./manage-cycles.sh ic\n"
printf "3. Set up monitoring and alerts\n"

log_info "Final cycles check..."
FINAL_BALANCE=$(dfx cycles balance --network ic 2>/dev/null || echo "Unable to check")
printf "Remaining cycles balance: %s\n" "${FINAL_BALANCE}"
