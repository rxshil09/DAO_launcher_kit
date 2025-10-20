#!/bin/bash

# Transfer tokens from deployer to a specific principal
# Usage: ./scripts/transfer-tokens.sh <recipient_principal> <amount>

if [ -z "$1" ]; then
    echo "Usage: ./scripts/transfer-tokens.sh <recipient_principal> <amount_in_dao_tokens>"
    echo "Example: ./scripts/transfer-tokens.sh abc123-def456-... 100"
    exit 1
fi

RECIPIENT="$1"
AMOUNT="${2:-100}"  # Default 100 DAO tokens if not specified

# Convert DAO tokens to smallest unit (multiply by 10^8)
AMOUNT_E8=$((AMOUNT * 100000000))

echo "🪙 Transferring $AMOUNT DAO tokens ($AMOUNT_E8 base units) to:"
echo "   $RECIPIENT"
echo ""

cd "$(dirname "$0")/.."

# Check sender balance
SENDER=$(dfx identity get-principal)
SENDER_BALANCE=$(dfx canister call icrc1_ledger icrc1_balance_of "(record { owner = principal \"$SENDER\"; subaccount = null })")
echo "Your current balance: $SENDER_BALANCE"
echo ""

# Transfer tokens
echo "Transferring..."
dfx canister call icrc1_ledger icrc1_transfer "(record { 
  to = record { owner = principal \"$RECIPIENT\"; subaccount = null }; 
  amount = $AMOUNT_E8; 
  fee = null; 
  memo = null; 
  from_subaccount = null; 
  created_at_time = null 
})"

echo ""
echo "✅ Transfer complete!"
echo ""
echo "Recipient's new balance:"
dfx canister call icrc1_ledger icrc1_balance_of "(record { owner = principal \"$RECIPIENT\"; subaccount = null })"
