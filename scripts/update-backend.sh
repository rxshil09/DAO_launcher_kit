#!/bin/bash

# Update Backend Canisters on IC Mainnet
set -e

echo "🔄 Backend Canister Update for DAOVerse"
echo "======================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check cycles balance
echo -e "${BLUE}💰 Checking cycles balance...${NC}"
if dfx cycles balance --network ic > /dev/null 2>&1; then
    CYCLES_BALANCE=$(dfx cycles balance --network ic)
    echo "Cycles balance: $CYCLES_BALANCE"
    
    # Extract numeric value for comparison
    CYCLES_NUM=$(echo "$CYCLES_BALANCE" | grep -o '[0-9.]*' | head -1)
    
    if (( $(echo "$CYCLES_NUM < 1.0" | bc -l) )); then
        echo -e "${YELLOW}⚠️ Low cycles balance: $CYCLES_BALANCE${NC}"
        echo -e "${YELLOW}Consider topping up cycles before major updates${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Could not check cycles balance${NC}"
fi

echo ""
echo -e "${BLUE}Which backend canister would you like to update?${NC}"
echo "1) dao_backend (Main DAO coordinator)"
echo "2) staking (Token staking mechanism)"
echo "3) treasury (Multi-signature treasury)"
echo "4) proposals (Proposal management)"
echo "5) governance (Voting and governance)"
echo "6) assets (Asset management)"
echo "7) All backend canisters"
echo "8) Exit"

read -p "Enter choice (1-8): " choice

case $choice in
    1)
        echo -e "${BLUE}🔄 Updating dao_backend canister...${NC}"
        dfx deploy dao_backend --network ic
        echo -e "${GREEN}✅ dao_backend updated successfully${NC}"
        ;;
    2)
        echo -e "${BLUE}🔄 Updating staking canister...${NC}"
        dfx deploy staking --network ic
        echo -e "${GREEN}✅ staking updated successfully${NC}"
        ;;
    3)
        echo -e "${BLUE}🔄 Updating treasury canister...${NC}"
        dfx deploy treasury --network ic
        echo -e "${GREEN}✅ treasury updated successfully${NC}"
        ;;
    4)
        echo -e "${BLUE}🔄 Updating proposals canister...${NC}"
        dfx deploy proposals --network ic
        echo -e "${GREEN}✅ proposals updated successfully${NC}"
        ;;
    5)
        echo -e "${BLUE}🔄 Updating governance canister...${NC}"
        echo "Getting required canister IDs for governance..."
        DAO_BACKEND_ID=$(dfx canister id dao_backend --network ic)
        STAKING_ID=$(dfx canister id staking --network ic)
        echo "DAO Backend ID: $DAO_BACKEND_ID"
        echo "Staking ID: $STAKING_ID"
        dfx deploy governance --network ic --argument "(principal \"$DAO_BACKEND_ID\", principal \"$STAKING_ID\")"
        echo -e "${GREEN}✅ governance updated successfully${NC}"
        ;;
    6)
        echo -e "${BLUE}🔄 Updating assets canister...${NC}"
        dfx deploy assets --network ic
        echo -e "${GREEN}✅ assets updated successfully${NC}"
        ;;
    7)
        echo -e "${BLUE}🔄 Updating all backend canisters...${NC}"
        echo -e "${YELLOW}This will update all backend canisters in the correct order${NC}"
        read -p "Are you sure? (y/N): " confirm
        
        if [[ $confirm =~ ^[Yy]$ ]]; then
            echo "Step 1/6: Updating dao_backend..."
            dfx deploy dao_backend --network ic
            
            echo "Step 2/6: Updating staking..."
            dfx deploy staking --network ic
            
            echo "Step 3/6: Updating treasury..."
            dfx deploy treasury --network ic
            
            echo "Step 4/6: Updating proposals..."
            dfx deploy proposals --network ic
            
            echo "Step 5/6: Updating assets..."
            dfx deploy assets --network ic
            
            echo "Step 6/6: Updating governance..."
            DAO_BACKEND_ID=$(dfx canister id dao_backend --network ic)
            STAKING_ID=$(dfx canister id staking --network ic)
            dfx deploy governance --network ic --argument "(principal \"$DAO_BACKEND_ID\", principal \"$STAKING_ID\")"
            
            echo -e "${GREEN}✅ All backend canisters updated successfully!${NC}"
        else
            echo "Update cancelled"
            exit 0
        fi
        ;;
    8)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📊 Checking updated canister status...${NC}"

# Check the status of updated canisters
case $choice in
    1) dfx canister status dao_backend --network ic ;;
    2) dfx canister status staking --network ic ;;
    3) dfx canister status treasury --network ic ;;
    4) dfx canister status proposals --network ic ;;
    5) dfx canister status governance --network ic ;;
    6) dfx canister status assets --network ic ;;
    7) 
        echo "Checking all canister statuses..."
        for canister in dao_backend staking treasury proposals assets governance; do
            echo "--- $canister ---"
            dfx canister status $canister --network ic
        done
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Backend update completed successfully!${NC}"
echo -e "${BLUE}💡 Next steps:${NC}"
echo "1. Test the updated functionality"
echo "2. Monitor canister cycles with: ./scripts/manage-cycles.sh"
echo "3. Update frontend if needed with: ./scripts/update-frontend.sh"
