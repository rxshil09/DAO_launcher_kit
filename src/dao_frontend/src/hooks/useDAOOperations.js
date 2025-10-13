/**
 * useDAOOperations Hook
 * 
 * Comprehensive hook for DAO lifecycle management and operations.
 * Handles the complete 7-step DAO creation process including:
 * - Initial configuration and admin setup
 * - Canister reference initialization
 * - Module and feature configuration
 * - Team member registration
 * - Global registry integration
 * 
 * @module hooks/useDAOOperations
 * 
 * @returns {Object} DAO operations interface
 * @returns {Function} launchDAO - Main function to create and launch a new DAO
 * @returns {boolean} loading - Loading state during DAO creation
 * @returns {string|null} error - Error message if launch fails
 * 
 * @example
 * ```jsx
 * function LaunchDAOComponent() {
 *   const { launchDAO, loading, error } = useDAOOperations();
 *   
 *   const handleLaunch = async () => {
 *     try {
 *       const daoInfo = await launchDAO({
 *         daoName: "My DAO",
 *         description: "A decentralized organization",
 *         category: "DeFi",
 *         teamMembers: [{name: "Alice", wallet: "...", role: "Admin"}],
 *         tokenName: "MyToken",
 *         tokenSymbol: "MTK",
 *         totalSupply: "1000000",
 *         // ... other config
 *       });
 *       console.log("DAO created:", daoInfo);
 *     } catch (err) {
 *       console.error("Launch failed:", err);
 *     }
 *   };
 * }
 * ```
 * 
 * DAO Creation Process:
 * 1. **Admin Setup**: Extract and validate team member wallets, add creator as admin
 * 2. **Initialize DAO**: Call dao_backend.initialize() with basic info
 * 3. **Set References**: Wire up governance, staking, treasury, proposals canisters
 * 4. **Configure Modules**: Set selected modules and features
 * 5. **Configure Settings**: Set tokenomics, governance, and funding parameters
 * 6. **Register Users**: Auto-register creator and team members
 * 7. **Registry Integration**: Register DAO in global discovery registry
 * 
 * Error Handling:
 * - Validates canister IDs from environment variables
 * - Handles Principal parsing errors for wallet addresses
 * - Continues operation even if optional steps fail (registry, user registration)
 * - Emits DAO_CREATED event on successful completion
 */

// Hook to interact with DAO canisters
import { useState } from 'react';
import { useDAOAPI } from '../utils/daoAPI';
import { useAuth } from '../context/AuthContext';
import { useDAOManagement } from '../context/DAOManagementContext';
import eventBus, { EVENTS } from '../utils/eventBus';
import { Principal } from '@dfinity/principal';

/**
 * Converts seconds to nanoseconds for IC time representation
 * @param {number} seconds - Time in seconds
 * @returns {BigInt} Time in nanoseconds
 */
const toNanoseconds = (seconds) => BigInt(seconds) * 1_000_000_000n;

export const useDAOOperations = () => {
    const daoAPI = useDAOAPI();
    const { principal } = useAuth();
    const { fetchDAOs } = useDAOManagement();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Launch a new DAO with full configuration
     * 
     * @async
     * @param {Object} daoConfig - Complete DAO configuration object
     * @param {string} daoConfig.daoName - Name of the DAO
     * @param {string} daoConfig.description - DAO description/mission statement
     * @param {string} daoConfig.category - DAO category (DeFi, Gaming, Social, etc.)
     * @param {string} daoConfig.website - DAO website URL
     * @param {Array<string>} daoConfig.selectedModules - Enabled modules (governance, treasury, etc.)
     * @param {Object} daoConfig.selectedFeatures - Feature flags for each module
     * @param {string} daoConfig.tokenName - DAO token name
     * @param {string} daoConfig.tokenSymbol - DAO token symbol
     * @param {string} daoConfig.totalSupply - Total token supply
     * @param {string} daoConfig.treasuryAllocation - % allocated to treasury
     * @param {string} daoConfig.communityAllocation - % allocated to community
     * @param {string} daoConfig.votingPeriod - Default voting period in seconds
     * @param {string} daoConfig.quorumThreshold - Minimum voting power for quorum
     * @param {string} daoConfig.proposalThreshold - Minimum stake to create proposal
     * @param {string} daoConfig.fundingGoal - Fundraising goal
     * @param {string} daoConfig.fundingDuration - Fundraising period in seconds
     * @param {string} daoConfig.minInvestment - Minimum investment amount
     * @param {Array<Object>} daoConfig.teamMembers - Initial team members
     * @param {boolean} daoConfig.termsAccepted - Terms and conditions acceptance
     * @param {boolean} daoConfig.kycRequired - Whether KYC is required
     * 
     * @returns {Promise<Object>} DAO information object
     * @throws {Error} If initialization fails at any step
     */
    const launchDAO = async (daoConfig) => {
        if (!daoAPI) {
            throw new Error('DAO API not initialized');
        }

        setLoading(true);
        setError(null);
        
        try {
            // Step 1: Prepare initial admins from team members
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

            // Step 2: Get registry and analytics canister IDs
            const registryCanisterId = import.meta.env.VITE_CANISTER_ID_DAO_REGISTRY;
            const analyticsCanisterId = import.meta.env.VITE_CANISTER_ID_DAO_ANALYTICS;

            console.log('Registry Canister ID:', registryCanisterId);
            console.log('Analytics Canister ID:', analyticsCanisterId);

            // Step 3: Initialize the DAO with basic info, registry, and analytics
            await daoAPI.initializeDAO(
                daoConfig.daoName,
                daoConfig.description,
                initialAdmins,
                registryCanisterId,
                analyticsCanisterId
            );

            // Step 4: Set up canister references
            const getCanisterPrincipal = (key) => {
                const id = import.meta.env[key];
                if (!id || typeof id !== 'string' || id.trim() === '') {
                    throw new Error(`Missing canister ID for ${key}`);
                }
                try {
                    return Principal.fromText(id);
                } catch {
                    throw new Error(`Invalid canister ID for ${key}`);
                }
            };

            let governanceCanisterId, stakingCanisterId, treasuryCanisterId, proposalsCanisterId;
            try {
                governanceCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_GOVERNANCE');
                stakingCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_STAKING');
                treasuryCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_TREASURY');
                proposalsCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_PROPOSALS');
            } catch (err) {
                throw new Error(`Canister configuration error: ${err.message}`);
            }

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
                treasuryAllocation: BigInt(daoConfig.treasuryAllocation || 40),
                communityAllocation: BigInt(daoConfig.communityAllocation || 60),
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
                try {
                    // Check if creator is already registered
                    const existingProfile = await daoAPI.getUserProfile(creatorPrincipal);
                    if (!existingProfile) {
                        await daoAPI.adminRegisterUser(
                            creatorPrincipal,
                            "DAO Creator", // Default display name
                            "DAO Creator and Administrator" // Default bio
                        );
                        console.log('✅ Registered DAO creator');
                    } else {
                        console.log('✅ DAO creator already registered, skipping');
                    }
                } catch (err) {
                    console.warn('Failed to register creator:', err);
                    // Continue with the process even if creator registration fails
                }
            }

            // Step 6: Register other team members
            const registrationOperations = (daoConfig.teamMembers || [])
                .filter(member => member.wallet)
                .map(({ wallet, name, role }) => async () => {
                    try {
                        const memberPrincipal = Principal.fromText(wallet);
                        
                        // Check if user is already registered
                        const existingProfile = await daoAPI.getUserProfile(memberPrincipal);
                        if (!existingProfile) {
                            const result = await daoAPI.adminRegisterUser(memberPrincipal, name, role);
                            console.log(`✅ Registered team member: ${name}`);
                            return result;
                        } else {
                            console.log(`✅ Team member ${name} already registered, skipping`);
                            return { success: true, skipped: true };
                        }
                    } catch (err) {
                        console.warn(`Invalid principal for team member ${name}:`, err);
                        throw err;
                    }
                });

            const registrationResults = await daoAPI.batchCall(registrationOperations);
            if (registrationResults.errorCount > 0) {
                console.warn(`Failed to register ${registrationResults.errorCount} team members`);
            }

            // Step 7: Verify registry registration
            console.log('🔍 Verifying registry registration...');
            const isRegistered = await daoAPI.isRegisteredInRegistry();
            const registryDAOId = await daoAPI.getRegistryDAOId();
            
            if (!isRegistered || !registryDAOId) {
                throw new Error('DAO was not properly registered in the global registry. This is a critical error.');
            }
            
            console.log('✅ DAO registered with registry ID:', registryDAOId);
            
            // Step 8: Get DAO info with registry ID
            const daoInfo = await daoAPI.getDAOInfo();
            daoInfo.registryId = registryDAOId; // Add registry ID to DAO info
            
            // Refresh the DAO list in the management context
            if (fetchDAOs) {
                await fetchDAOs();
            }
            
            // Emit event for other components to listen
            eventBus.emit(EVENTS.DAO_CREATED, {
                daoInfo,
                config: daoConfig,
                creator: principal,
                registryId: registryDAOId
            });
            
            console.log('🎉 DAO launch completed successfully!');
            console.log('Registry ID:', registryDAOId);
            console.log('DAO Info:', daoInfo);
            
            return { ...daoInfo, registryId: registryDAOId };

        } catch (err) {
            console.error('DAO launch failed:', err);
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
