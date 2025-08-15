
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

            const governanceCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_GOVERNANCE');
            const stakingCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_STAKING');
            const treasuryCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_TREASURY');
            const proposalsCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_PROPOSALS');

            const canisterRefResult = await actors.daoBackend.setCanisterReferences(
                governanceCanisterId,
                stakingCanisterId,
                treasuryCanisterId,
                proposalsCanisterId
            );


            if ('err' in canisterRefResult) {
                throw new Error(canisterRefResult.err);
            }


            // Step 3: Register initial users via admin method
            if (creatorPrincipal) {
                const registerCreator = await actors.daoBackend.adminRegisterUser(
                    creatorPrincipal,
                    "DAO Creator", // Default display name
                    "DAO Creator and Administrator" // Default bio
                );

                if ('err' in registerCreator) {
                    throw new Error(registerCreator.err);
                }
            }


            // Optional: Register other team members
            for (const { wallet, name, role } of daoConfig.teamMembers || []) {
                if (!wallet) continue;

                try {
                    const memberPrincipal = Principal.fromText(wallet);
                    const registerMember = await actors.daoBackend.adminRegisterUser(
                        memberPrincipal,
                        name,
                        role
                    );

                    if ('err' in registerMember) {
                        console.warn(
                            `Failed to register team member ${name}:`,
                            registerMember.err
                        );
                    }
                } catch (err) {
                    console.warn(`Invalid principal for team member ${name}:`, err);
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
