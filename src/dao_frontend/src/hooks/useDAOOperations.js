
// Hook to interact with DAO canisters
import { useState } from 'react';
import { useDAOAPI } from '../utils/daoAPI';
import { useAuth } from '../context/AuthContext';
import { Principal } from '@dfinity/principal';

const toNanoseconds = (seconds) => BigInt(seconds) * 1_000_000_000n;

export const useDAOOperations = () => {
    const daoAPI = useDAOAPI();
    const { principal } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const launchDAO = async (daoConfig) => {
        if (!daoAPI) {
            throw new Error('DAO API not initialized');
        }

        setLoading(true);
        setError(null);
        
        try {
            // Step 1: Prepare initial admins
            const initialAdmins = daoConfig.teamMembers
                .map(member => member.wallet)
                .filter(wallet => wallet) // Remove empty wallets
                .map(wallet => Principal.fromText(wallet)); // Convert to Principal
            
            let creatorPrincipal = null;
            // Add the creator as an admin if not already included
            if (principal) {
                try {
                    creatorPrincipal = Principal.fromText(principal);
                    const exists = initialAdmins.some(
                        admin => admin.toText() === creatorPrincipal.toText()
                    );
                    if (!exists) {
                        initialAdmins.push(creatorPrincipal);
                    }
                } catch (err) {
                    console.warn('Failed to parse authenticated principal:', err);
                }
            }

            // Step 2: Initialize the DAO with basic info
            await daoAPI.initializeDAO(
                daoConfig.daoName,
                daoConfig.description,
                initialAdmins
            );

            // Step 3: Set up canister references (using fallbacks for now)
            const getCanisterPrincipal = (key) => {
                const id = import.meta.env[key];
                if (!id || typeof id !== 'string' || id.trim() === '') {
                    // Return the dao_backend canister ID as fallback
                    return Principal.fromText(import.meta.env.VITE_CANISTER_ID_DAO_BACKEND);
                }
                try {
                    return Principal.fromText(id);
                } catch (err) {
                    // Return the dao_backend canister ID as fallback
                    return Principal.fromText(import.meta.env.VITE_CANISTER_ID_DAO_BACKEND);
                }
            };

            const governanceCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_GOVERNANCE');
            const stakingCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_STAKING');
            const treasuryCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_TREASURY');
            const proposalsCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_PROPOSALS');

            await daoAPI.setCanisterReferences(
                governanceCanisterId,
                stakingCanisterId,
                treasuryCanisterId,
                proposalsCanisterId
            );

            // Step 4: Configure DAO settings
            const moduleFeatures = Object.entries(daoConfig.selectedFeatures || {})
                .map(([moduleId, features]) => ({
                    moduleId,
                    features: Object.entries(features)
                        .filter(([_, selected]) => selected)
                        .map(([featureId]) => featureId)
                }))
                .filter(mf => mf.features.length > 0);

            await daoAPI.setDAOConfig({
                category: daoConfig.category,
                website: daoConfig.website,
                selectedModules: daoConfig.selectedModules,
                moduleFeatures,
                tokenName: daoConfig.tokenName,
                tokenSymbol: daoConfig.tokenSymbol,
                totalSupply: BigInt(daoConfig.totalSupply || 0),
                initialPrice: BigInt(daoConfig.initialPrice || 0),
                votingPeriod: toNanoseconds(daoConfig.votingPeriod || 0),
                quorumThreshold: BigInt(daoConfig.quorumThreshold || 0),
                proposalThreshold: BigInt(daoConfig.proposalThreshold || 0),
                fundingGoal: BigInt(daoConfig.fundingGoal || 0),
                fundingDuration: toNanoseconds(daoConfig.fundingDuration || 0),
                minInvestment: BigInt(daoConfig.minInvestment || 0),
                termsAccepted: daoConfig.termsAccepted,
                kycRequired: daoConfig.kycRequired
            });

            // Step 5: Register initial users via admin method
            if (creatorPrincipal) {
                await daoAPI.adminRegisterUser(
                    creatorPrincipal,
                    "DAO Creator", // Default display name
                    "DAO Creator and Administrator" // Default bio
                );
            }

            // Step 6: Register other team members
            const registrationOperations = (daoConfig.teamMembers || [])
                .filter(member => member.wallet)
                .map(({ wallet, name, role }) => async () => {
                    try {
                        const memberPrincipal = Principal.fromText(wallet);
                        return await daoAPI.adminRegisterUser(memberPrincipal, name, role);
                    } catch (err) {
                        console.warn(`Invalid principal for team member ${name}:`, err);
                        throw err;
                    }
                });

            const registrationResults = await daoAPI.batchCall(registrationOperations);
            if (registrationResults.errorCount > 0) {
                console.warn(`Failed to register ${registrationResults.errorCount} team members`);
            }

            // Step 7: Return the DAO info
            const daoInfo = await daoAPI.getDAOInfo();
            return daoInfo;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        launchDAO,
        loading,
        error
    };
};
