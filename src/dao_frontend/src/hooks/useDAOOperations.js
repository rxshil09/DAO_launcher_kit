// Hook to interact with DAO canisters
import { useState } from 'react';
import { useActors } from '../context/ActorContext';
import { useAuth } from '../context/AuthContext';
import { Principal } from '@dfinity/principal';

export const useDAOOperations = () => {
    const actors = useActors();
    const { principal } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const launchDAO = async (daoConfig) => {
        setLoading(true);
        setError(null);
        
        try {
            // Step 1: Initialize the DAO with basic info
            const initialAdmins = daoConfig.teamMembers
                .map(member => member.wallet)
                .filter(wallet => wallet) // Remove empty wallets
                .map(wallet => Principal.fromText(wallet)); // Convert to Principal

            // Add the creator as an admin if not already included
            if (principal) {
                try {
                    const creatorPrincipal = Principal.fromText(principal);
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

            // Initialize the DAO with basic info
            const initResult = await actors.daoBackend.initialize(
                daoConfig.daoName,
                daoConfig.description,
                initialAdmins
            );

            if ('err' in initResult) {
                throw new Error(initResult.err);
            }

            // Step 2: Set up required canister references
            // Retrieve and validate canister IDs from environment variables
            const getCanisterPrincipal = (key) => {
                const id = import.meta.env[key];
                if (!id || typeof id !== 'string' || id.trim() === '') {
                    throw new Error(`Missing ${key}`);
                }
                try {
                    return Principal.fromText(id);
                } catch (err) {
                    throw new Error(`Invalid canister ID for ${key}: ${err.message}`);
                }
            };

            const governanceCanister = getCanisterPrincipal('VITE_GOVERNANCE_CANISTER_ID');
            const stakingCanister = getCanisterPrincipal('VITE_STAKING_CANISTER_ID');
            const treasuryCanister = getCanisterPrincipal('VITE_TREASURY_CANISTER_ID');
            const proposalsCanister = getCanisterPrincipal('VITE_PROPOSALS_CANISTER_ID');

            const canisterRefResult = await actors.daoBackend.setCanisterReferences(
                governanceCanister,
                stakingCanister,
                treasuryCanister,
                proposalsCanister
            );

            if ('err' in canisterRefResult) {
                throw new Error(canisterRefResult.err);
            }

            // Step 3: Register the creator as a user
            const registerResult = await actors.daoBackend.registerUser(
                "DAO Creator", // Default display name
                "DAO Creator and Administrator" // Default bio
            );

            if ('err' in registerResult) {
                throw new Error(registerResult.err);
            }

            // Optional: Register other team members
            for (const member of daoConfig.teamMembers) {
                if (member.wallet) {
                    try {
                        // Use principal.toString() as wallet address might be already a Principal
                        const memberPrincipal = Principal.fromText(member.wallet);
                        await actors.daoBackend.registerUser(
                            member.name,
                            member.role
                        );
                    } catch (err) {
                        console.warn(`Failed to register team member ${member.name}:`, err);
                        // Continue with other members
                    }
                }
            }

            // Step 4: Return the DAO info
            const daoInfo = await actors.daoBackend.getDAOInfo();
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
