#!/bin/bash
set -e

# Fetch a pinned ICRC-1 ledger WASM and DID locally for dfx to use
# Usage: ./scripts/fetch-ledger.sh <TAG>
# Example TAG: release-2024-08-21

TAG="$1"
if [ -z "$TAG" ]; then
  echo "Usage: $0 <TAG>"
  echo "Example TAG: release-2024-08-21"
  exit 1
fi

DEST_DIR="third_party/icrc1"
mkdir -p "$DEST_DIR"

WASM_URL="https://github.com/dfinity/ic/releases/download/${TAG}/ic-icrc1-ledger.wasm.gz"

echo "Downloading ICRC-1 ledger wasm from: $WASM_URL"
curl -fL "$WASM_URL" -o "$DEST_DIR/ic-icrc1-ledger.wasm.gz"

# Try ledger-suite path first, then old rosetta-api path as fallback
DID_URL1="https://raw.githubusercontent.com/dfinity/ic/${TAG}/rs/ledger_suite/icrc1/ledger/ledger.did"
DID_URL2="https://raw.githubusercontent.com/dfinity/ic/${TAG}/rs/rosetta-api/icrc1/ledger/ledger.did"
echo "Attempting to download ledger.did from: $DID_URL1"
if curl -fL "$DID_URL1" -o "$DEST_DIR/ledger.did"; then
  echo "Downloaded ledger.did from ledger_suite path"
else
  echo "ledger_suite path not available, trying rosetta-api path: $DID_URL2"
  curl -fL "$DID_URL2" -o "$DEST_DIR/ledger.did"
fi

echo "✅ Downloaded to $DEST_DIR"
