
// Hook to interact with DAO canisters
import { useState } from 'react';
import { useDAOAPI } from '../utils/daoAPI';
import { useAuth } from '../context/AuthContext';
import { useDAOManagement } from '../context/DAOManagementContext';
import eventBus, { EVENTS } from '../utils/eventBus';
import { Principal } from '@dfinity/principal';

const toNanoseconds = (seconds) => BigInt(seconds) * 1_000_000_000n;
const toOptionalText = (value) => {
    if (value === undefined || value === null || value === '') {
        return [];
    }
    return [String(value)];
};
const isAlreadyInitializedError = (error) => {
    if (!error) return false;
    const message = typeof error === 'string' ? error : error.message;
    return typeof message === 'string' && message.toLowerCase().includes('dao already initialized');
};
const handleAlreadyInitialized = (error, operationName) => {
    if (isAlreadyInitializedError(error)) {
        console.warn(`${operationName} skipped: DAO already initialized.`);
        return true;
    }
    return false;
};

const normalizeDaoId = (value) => {
    if (value === null || value === undefined) {
        return null;
    }

    if (Array.isArray(value)) {
        return normalizeDaoId(value[0]);
    }

    if (typeof value === 'object') {
        if (value && typeof value.toText === 'function') {
            return value.toText();
        }
        if (value && typeof value.toString === 'function') {
            const stringified = value.toString();
            if (stringified && stringified !== '[object Object]') {
                return stringified;
            }
        }
        return null;
    }

    return String(value);
};

export const useDAOOperations = () => {
    const daoAPI = useDAOAPI();
    const { principal } = useAuth();
    const { fetchDAOs } = useDAOManagement();
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
            const initialAdmins = (daoConfig.teamMembers || [])
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

            // Step 2: Prepare DAO configuration
            const moduleFeatures = Object.entries(daoConfig.selectedFeatures || {})
                .map(([moduleId, features]) => ({
                    moduleId,
                    features: Object.entries(features)
                        .filter(([_, selected]) => selected)
                        .map(([featureId]) => featureId)
                }))
                .filter(mf => mf.features.length > 0);

            const rawLogoUrl =
                daoConfig.logoType === 'url'
                    ? daoConfig.logoSource ?? daoConfig.logoUrl
                    : daoConfig.logoUrl;
            const rawLogoAssetId =
                daoConfig.logoType === 'upload'
                    ? daoConfig.logoSource ?? daoConfig.logoAssetId
                    : daoConfig.logoAssetId;
            const rawLogoType = daoConfig.logoType;

            const config = {
                category: daoConfig.category || 'Other',
                website: daoConfig.website || '',
                logoUrl: toOptionalText(rawLogoUrl),
                logoAssetId: toOptionalText(rawLogoAssetId),
                logoType: toOptionalText(rawLogoType),
                selectedModules: daoConfig.selectedModules || [],
                moduleFeatures,
                tokenName: daoConfig.tokenName || '',
                tokenSymbol: daoConfig.tokenSymbol || '',
                totalSupply: BigInt(daoConfig.totalSupply || 0),
                initialPrice: BigInt(daoConfig.initialPrice || 0),
                treasuryAllocation: BigInt(daoConfig.treasuryAllocation || 40),
                communityAllocation: BigInt(daoConfig.communityAllocation || 60),
                votingPeriod: BigInt(daoConfig.votingPeriod || 0),
                quorumThreshold: BigInt(daoConfig.quorumThreshold || 0),
                proposalThreshold: BigInt(daoConfig.proposalThreshold || 0),
                fundingGoal: BigInt(daoConfig.fundingGoal || 0),
                fundingDuration: BigInt(daoConfig.fundingDuration || 0),
                minInvestment: BigInt(daoConfig.minInvestment || 0),
                termsAccepted: daoConfig.termsAccepted || false,
                kycRequired: daoConfig.kycRequired || false
            };

            // Helper function to get canister principals
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

            // Get all canister principals
            let governanceCanisterId, stakingCanisterId, treasuryCanisterId, proposalsCanisterId, registryId, analyticsId;
            try {
                governanceCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_GOVERNANCE');
                stakingCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_STAKING');
                treasuryCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_TREASURY');
                proposalsCanisterId = getCanisterPrincipal('VITE_CANISTER_ID_PROPOSALS');
                
                // Get registry and analytics IDs (optional)
                try {
                    registryId = getCanisterPrincipal('VITE_CANISTER_ID_DAO_REGISTRY');
                } catch {
                    registryId = null;
                }
                try {
                    analyticsId = getCanisterPrincipal('VITE_CANISTER_ID_DAO_ANALYTICS');
                } catch {
                    analyticsId = null;
                }
            } catch (err) {
                throw new Error(`Canister configuration error: ${err.message}`);
            }

            // Initialize the DAO with all required parameters
            // Optional Principals must be passed as [] (null) or [Principal] (some value)
            try {
                await daoAPI.initializeDAO(
                    daoConfig.daoName,
                    daoConfig.description,
                    initialAdmins,
                    registryId ? [registryId] : [],
                    analyticsId ? [analyticsId] : [],
                    config
                );
            } catch (initError) {
                if (!handleAlreadyInitialized(initError, 'Initialize DAO')) {
                    throw initError;
                }
            }

            try {
                await daoAPI.setCanisterReferences(
                    governanceCanisterId,
                    stakingCanisterId,
                    treasuryCanisterId,
                    proposalsCanisterId
                );
            } catch (referencesError) {
                if (!handleAlreadyInitialized(referencesError, 'Set canister references')) {
                    throw referencesError;
                }
            }

            // Step 4: Configure DAO settings (moduleFeatures already defined earlier)
            let backendDaoId = null;
            try {
                backendDaoId = await daoAPI.setDAOConfig({
                    category: daoConfig.category,
                    website: daoConfig.website,
                    logoUrl: toOptionalText(rawLogoUrl),
                    logoAssetId: toOptionalText(rawLogoAssetId),
                    logoType: toOptionalText(rawLogoType),
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
                
                if (backendDaoId) {
                    daoConfig.id = backendDaoId;
                    daoConfig.dao_id = backendDaoId;
                    daoConfig.registryId = backendDaoId;
                    console.log('Backend returned DAO ID:', backendDaoId);
                }
            } catch (configError) {
                if (!handleAlreadyInitialized(configError, 'Set DAO configuration')) {
                    throw configError;
                }
            }

            // Step 5: Register initial users via admin method
            const daoIdForMembership = normalizeDaoId(
                backendDaoId ||
                daoConfig.dao_id ||
                daoConfig.registryId ||
                daoConfig.id
            );

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
                        console.log('Registered DAO creator');
                    } else {
                        console.log('DAO creator already registered, skipping');
                    }
                } catch (err) {
                    console.warn('Failed to register creator:', err);
                    // Continue with the process even if creator registration fails
                }
            }

            if (creatorPrincipal && daoIdForMembership) {
                try {
                    await daoAPI.addMemberToDAO(daoIdForMembership, creatorPrincipal);
                    console.log('Creator membership ensured');
                } catch (err) {
                    const message = typeof err?.message === 'string' ? err.message.toLowerCase() : '';
                    if (err?.suppressed || message.includes('already a member')) {
                        console.log('Creator already recorded as member, skipping duplicate add');
                    } else {
                        console.warn('Failed to add creator to DAO membership:', err);
                    }
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
                            await daoAPI.adminRegisterUser(memberPrincipal, name, role);
                            console.log(`[team] Registered team member: ${name}`);
                        } else {
                            console.log(`[team] Team member ${name} already registered, skipping`);
                        }

                        if (daoIdForMembership) {
                            try {
                                await daoAPI.addMemberToDAO(daoIdForMembership, memberPrincipal);
                                console.log(`[membership] Added ${name} to DAO membership`);
                            } catch (membershipError) {
                                const membershipMessage = typeof membershipError?.message === 'string'
                                    ? membershipError.message.toLowerCase()
                                    : '';

                                if (membershipError?.suppressed || membershipMessage.includes('already a member')) {
                                    console.log(`[membership] ${name} already recorded as member, skipping`);
                                } else {
                                    throw membershipError;
                                }
                            }
                        } else {
                            console.warn(`DAO ID unavailable, skipped membership add for ${name}`);
                        }

                        return { success: true };
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
            if (daoIdForMembership) {
                if (!daoInfo.dao_id) {
                    daoInfo.dao_id = daoIdForMembership;
                }
                if (!daoInfo.registryId) {
                    daoInfo.registryId = daoIdForMembership;
                }
                if (!daoInfo.id) {
                    daoInfo.id = daoIdForMembership;
                }
            }
            
            // Refresh the DAO list in the management context
            if (fetchDAOs) {
                await fetchDAOs();
            }
            
            // Register with global registry if available
            let registryDaoId = null;
            try {
                registryDaoId = await daoAPI.registerWithRegistry();
                if (registryDaoId) {
                    console.log('DAO registered with global registry, ID:', registryDaoId);
                    daoInfo.registryId = registryDaoId;
                    daoInfo.dao_id = registryDaoId;
                    daoInfo.id = registryDaoId;
                }
            } catch (registryError) {
                console.warn('Failed to register with global registry:', registryError);
                // Don't fail the entire operation if registry registration fails
            }
            
            // Emit event for other components to listen
            eventBus.emit(EVENTS.DAO_CREATED, {
                daoInfo,
                config: daoConfig,
                creator: principal,
                registryId: registryDaoId
            });
            
            return daoInfo;

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
