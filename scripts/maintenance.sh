#!/bin/bash

# DAOVerse Quick Maintenance Access
# This script provides quick access to maintenance operations

echo "🛠️  DAOVerse - Quick Maintenance"
echo "==============================="
echo ""
echo "Choose quick action:"
echo "1) Open maintenance hub (full menu)"
echo "2) Update frontend"
echo "3) Update backend"
echo "4) Check cycles"
echo "5) Create backup"
echo "6) Check system health"
echo ""

read -p "Enter choice (1-6): " choice

case $choice in
    1) ./scripts/maintenance-hub.sh ;;
    2) ./scripts/update-frontend.sh ;;
    3) ./scripts/update-backend.sh ;;
    4) ./scripts/manage-cycles.sh ic ;;
    5) ./scripts/maintenance/backup-state.sh ic ;;
    6) 
        echo "🏥 DAOVerse Health Check"
        echo "======================="
        echo ""
        echo "Frontend: https://7e7p4-jyaaa-aaaao-a4pba-cai.icp0.io/"
        echo ""
        curl -s -o /dev/null -w "Frontend Status: %{http_code}\n" https://7e7p4-jyaaa-aaaao-a4pba-cai.icp0.io/ 2>/dev/null || echo "Frontend Status: Could not reach"
        echo ""
        echo "Canister Status:"
        CANISTERS=("dao_backend" "dao_frontend" "governance" "staking" "treasury" "proposals" "assets")
        for canister in "${CANISTERS[@]}"; do
            if dfx canister status $canister --network ic > /dev/null 2>&1; then
                echo "✅ $canister: Running"
            else
                echo "❌ $canister: Issues detected"
            fi
        done
        ;;
    *) echo "Invalid choice" ;;
esac
