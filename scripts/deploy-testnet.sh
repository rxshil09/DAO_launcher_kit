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

echo
log_info "Deploying DAOVerse to DFINITY Testnet"
printf "==================================\n\n"

# Allow overriding network (default: testnet) and host
NETWORK=${NETWORK:-testnet}
if [ "${NETWORK}" = "testnet" ]; then
  VITE_HOST=${VITE_HOST:-https://ic0.app}
else
  VITE_HOST=${VITE_HOST:-https://icp0.io}
fi

CURRENT_IDENTITY=$(dfx identity whoami)
log_info "Current identity: ${CURRENT_IDENTITY}"

log_info "Deploying backend canisters to network: ${NETWORK}"
dfx deploy dao_backend --network "${NETWORK}"
dfx deploy dao_registry --network "${NETWORK}"
dfx deploy dao_analytics --network "${NETWORK}"
dfx deploy staking --network "${NETWORK}"
dfx deploy treasury --network "${NETWORK}"
dfx deploy proposals --network "${NETWORK}"
dfx deploy assets --network "${NETWORK}"

DAO_BACKEND_ID=$(dfx canister id dao_backend --network "${NETWORK}")
STAKING_ID=$(dfx canister id staking --network "${NETWORK}")
TREASURY_ID=$(dfx canister id treasury --network "${NETWORK}")

GOVERNANCE_ARG="(principal \"${DAO_BACKEND_ID}\", principal \"${STAKING_ID}\")"
log_info "Deploying governance canister with init args..."
dfx deploy governance --network "${NETWORK}" --argument "${GOVERNANCE_ARG}"

log_info "Deploying ICRC-1 ledger (if local artifacts exist)..."
if [ ! -f third_party/icrc1/ic-icrc1-ledger.wasm.gz ] || [ ! -f third_party/icrc1/ledger.did ] ; then
  log_warn "Local ledger artifacts missing in third_party/icrc1. Skipping local ledger deploy."
  log_warn "If you want a local ledger on testnet, fetch artifacts with: ./scripts/fetch-ledger.sh <TAG>"
else
  DEPLOYER_PRINCIPAL=$(dfx identity get-principal)
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

  dfx deploy icrc1_ledger --network "${NETWORK}" --argument "${LEDGER_INIT}"
  LEDGER_ID=$(dfx canister id icrc1_ledger --network "${NETWORK}")

  log_info "Linking ledger to staking and treasury..."
  dfx canister call --network "${NETWORK}" staking setLedgerCanister "(principal \"${LEDGER_ID}\")"
  dfx canister call --network "${NETWORK}" treasury setLedgerCanister "(principal \"${LEDGER_ID}\")"
fi

log_info "Deploying Internet Identity canister (if configured in dfx.json)..."
if grep -q 'internet_identity' dfx.json 2>/dev/null; then
  dfx deploy internet_identity --network "${NETWORK}" || log_warn "internet_identity may not be configured for testnet"
fi

log_info "Generating declarations and copying to frontend..."
dfx generate || true
mkdir -p src/dao_frontend/src/declarations
cp -r src/declarations/* src/dao_frontend/src/declarations/ || true

log_info "Building frontend (optional - set SKIP_BUILD=1 to skip)..."
if [ "${SKIP_BUILD:-0}" != "1" ]; then
  pushd src/dao_frontend > /dev/null
  if [ ! -d node_modules ]; then
    npm install
  fi
  npm run build || log_warn "Frontend build failed or is not configured; continuing"
  popd > /dev/null
else
  log_info "Skipping frontend build as requested"
fi

log_info "Deploying frontend canister..."
dfx deploy dao_frontend --network "${NETWORK}" || log_warn "Frontend deploy failed"

log_info "Writing testnet environment files (.env.testnet and src/dao_frontend/.env.testnet)"
DAO_REGISTRY_ID=$(dfx canister id dao_registry --network "${NETWORK}")
DAO_ANALYTICS_ID=$(dfx canister id dao_analytics --network "${NETWORK}")
GOVERNANCE_ID=$(dfx canister id governance --network "${NETWORK}")
PROPOSALS_ID=$(dfx canister id proposals --network "${NETWORK}")
ASSETS_ID=$(dfx canister id assets --network "${NETWORK}")
DAO_FRONTEND_ID=$(dfx canister id dao_frontend --network "${NETWORK}")
INTERNET_IDENTITY_ID=$(dfx canister id internet_identity --network "${NETWORK}" 2>/dev/null || echo "")
LEDGER_ID=$(dfx canister id icrc1_ledger --network "${NETWORK}" 2>/dev/null || echo "")

cat > .env.testnet <<EOF
# Testnet Environment Variables
VITE_CANISTER_ID_DAO_BACKEND=${DAO_BACKEND_ID}
VITE_CANISTER_ID_DAO_REGISTRY=${DAO_REGISTRY_ID}
VITE_CANISTER_ID_DAO_ANALYTICS=${DAO_ANALYTICS_ID}
VITE_CANISTER_ID_GOVERNANCE=${GOVERNANCE_ID}
VITE_CANISTER_ID_STAKING=${STAKING_ID}
VITE_CANISTER_ID_TREASURY=${TREASURY_ID}
VITE_CANISTER_ID_PROPOSALS=${PROPOSALS_ID}
VITE_CANISTER_ID_ASSETS=${ASSETS_ID}
VITE_CANISTER_ID_LEDGER=${LEDGER_ID}
VITE_CANISTER_ID_INTERNET_IDENTITY=${INTERNET_IDENTITY_ID}

VITE_DFX_NETWORK=${NETWORK}
VITE_HOST=${VITE_HOST}
EOF

cat > src/dao_frontend/.env.testnet <<EOF
# Frontend Testnet environment variables
VITE_CANISTER_ID_DAO_BACKEND=${DAO_BACKEND_ID}
VITE_CANISTER_ID_DAO_REGISTRY=${DAO_REGISTRY_ID}
VITE_CANISTER_ID_DAO_ANALYTICS=${DAO_ANALYTICS_ID}
VITE_CANISTER_ID_GOVERNANCE=${GOVERNANCE_ID}
VITE_CANISTER_ID_STAKING=${STAKING_ID}
VITE_CANISTER_ID_TREASURY=${TREASURY_ID}
VITE_CANISTER_ID_PROPOSALS=${PROPOSALS_ID}
VITE_CANISTER_ID_ASSETS=${ASSETS_ID}
VITE_CANISTER_ID_LEDGER=${LEDGER_ID}
VITE_CANISTER_ID_INTERNET_IDENTITY=${INTERNET_IDENTITY_ID}

VITE_HOST=${VITE_HOST}
VITE_DFX_NETWORK=${NETWORK}
EOF

log_success "Testnet deployment completed"

printf "\nDeployed Canister IDs (testnet):\n"
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

log_info "You can now build or run the frontend against testnet using src/dao_frontend/.env.testnet"
