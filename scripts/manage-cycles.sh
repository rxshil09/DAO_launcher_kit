#!/bin/bash

# Cycles Management Script for DAOVerse (Updated for dfx cycles)
set -e

echo "💰 DAOVerse Cycles Management"
echo "============================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

NETWORK=${1:-ic}

if [ "$NETWORK" != "ic" ] && [ "$NETWORK" != "local" ] && [ "$NETWORK" != "playground" ]; then
    echo -e "${RED}Usage: $0 [ic|local|playground]${NC}"
    echo "Default network is 'ic'"
    exit 1
fi

echo -e "${BLUE}Network: $NETWORK${NC}"

# Check cycles balance (updated for new dfx cycles command)
echo -e "${BLUE}📊 Checking cycles balance...${NC}"
if [ "$NETWORK" = "ic" ]; then
    CYCLES_BALANCE=$(dfx cycles balance --network ic 2>/dev/null || echo "0 TC")
    echo -e "${GREEN}Cycles Balance: $CYCLES_BALANCE${NC}"
else
    echo -e "${YELLOW}Cycles balance check only available for IC network${NC}"
fi

# Check canister cycles
echo -e "${BLUE}🔍 Checking canister cycles...${NC}"

CANISTERS=("dao_backend" "governance" "staking" "treasury" "proposals" "assets" "dao_frontend")

for canister in "${CANISTERS[@]}"; do
    CANISTER_ID=$(dfx canister id $canister --network $NETWORK 2>/dev/null || echo "")
    if [ -n "$CANISTER_ID" ]; then
        STATUS=$(dfx canister status $canister --network $NETWORK 2>/dev/null || echo "")
        if [ -n "$STATUS" ]; then
            CYCLES=$(echo "$STATUS" | grep "Balance:" | grep -o '[0-9,]*' | tr -d ',' || echo "0")
            if [ "$CYCLES" != "0" ]; then
                # Format cycles display
                if [ $CYCLES -gt 1000000000000 ]; then
                    FORMATTED="$(echo "scale=2; $CYCLES / 1000000000000" | bc -l)T cycles"
                elif [ $CYCLES -gt 1000000000 ]; then
                    FORMATTED="$(echo "scale=2; $CYCLES / 1000000000" | bc -l)B cycles"
                else
                    FORMATTED="${CYCLES} cycles"
                fi
                
                echo -e "${GREEN}$canister ($CANISTER_ID): $FORMATTED${NC}"
                
                # Warn if cycles are low (less than 1T)
                if [ $CYCLES -lt 1000000000000 ]; then
                    echo -e "${YELLOW}  ⚠️  Low cycles warning!${NC}"
                fi
            else
                echo -e "${RED}$canister ($CANISTER_ID): Unable to get cycles${NC}"
            fi
        else
            echo -e "${RED}$canister ($CANISTER_ID): Cannot get status${NC}"
        fi
    else
        echo -e "${YELLOW}$canister: Not deployed on $NETWORK${NC}"
    fi
done

# Top-up cycles function (updated for dfx cycles)
if [ "$NETWORK" = "ic" ]; then
    echo ""
    echo -e "${BLUE}💳 Cycles Top-up Options:${NC}"
    echo "1. Top up all canisters"
    echo "2. Top up specific canister"
    echo "3. Exit"
    
    read -p "Choose option (1-3): " choice
    
    case $choice in
        1)
            read -p "Enter cycles amount to add to each canister (e.g., 500000000000 for 500B): " amount
            for canister in "${CANISTERS[@]}"; do
                CANISTER_ID=$(dfx canister id $canister --network $NETWORK 2>/dev/null || echo "")
                if [ -n "$CANISTER_ID" ]; then
                    echo "Adding $amount cycles to $canister..."
                    dfx cycles top-up $amount $CANISTER_ID --network $NETWORK
                fi
            done
            ;;
        2)
            echo "Available canisters:"
            for i in "${!CANISTERS[@]}"; do
                echo "$((i+1)). ${CANISTERS[$i]}"
            done
            read -p "Choose canister (1-${#CANISTERS[@]}): " canister_choice
            read -p "Enter cycles amount: " amount
            
            if [ $canister_choice -ge 1 ] && [ $canister_choice -le ${#CANISTERS[@]} ]; then
                selected_canister=${CANISTERS[$((canister_choice-1))]}
                CANISTER_ID=$(dfx canister id $selected_canister --network $NETWORK 2>/dev/null || echo "")
                if [ -n "$CANISTER_ID" ]; then
                    echo "Adding $amount cycles to $selected_canister..."
                    dfx cycles top-up $amount $CANISTER_ID --network $NETWORK
                else
                    echo -e "${RED}Canister not deployed${NC}"
                fi
            else
                echo -e "${RED}Invalid canister selection${NC}"
            fi
            ;;
        3)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
fi

echo -e "${GREEN}✅ Cycles management completed${NC}"