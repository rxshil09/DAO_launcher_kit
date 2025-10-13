/**
 * Standardized API wrapper for DAO backend calls
 * Provides consistent error handling and response formatting
 */

export class DAOAPIWrapper {
    constructor(actors) {
        this.actors = actors;
    }

    /**
     * Wrapper for backend API calls with standardized error handling
     * @param {Function} apiCall - The async function to call
     * @param {string} operationName - Name of the operation for logging
     * @returns {Promise} - Standardized response
     */
    async callAPI(apiCall, operationName) {
        try {
            console.log(`🔄 Calling ${operationName}...`);
            const result = await apiCall();
            
            // Handle Motoko Result type responses
            if (result && typeof result === 'object') {
                if ('err' in result) {
                    const error = new Error(result.err);
                    error.operation = operationName;
                    throw error;
                }
                if ('ok' in result) {
                    console.log(`✅ ${operationName} succeeded`);
                    return result.ok;
                }
            }
            
            // Handle direct responses
            console.log(`✅ ${operationName} succeeded`);
            return result;
        } catch (error) {
            console.error(`❌ ${operationName} failed:`, error);
            error.operation = operationName;
            throw error;
        }
    }

    // DAO Management APIs
    async initializeDAO(name, description, initialAdmins, registryId, analyticsId) {
        // Import Principal if needed
        const { Principal } = await import('@dfinity/principal');
        
        return this.callAPI(
            () => this.actors.daoBackend.initialize(
                name, 
                description, 
                initialAdmins,
                registryId ? [Principal.fromText(registryId)] : [],
                analyticsId ? [Principal.fromText(analyticsId)] : []
            ),
            'Initialize DAO'
        );
    }

    async setCanisterReferences(governance, staking, treasury, proposals) {
        return this.callAPI(
            () => this.actors.daoBackend.setCanisterReferences(governance, staking, treasury, proposals),
            'Set Canister References'
        );
    }

    async getCanisterReferences() {
        return this.callAPI(
            () => this.actors.daoBackend.getCanisterReferences(),
            'Get Canister References'
        );
    }

    async setDAOConfig(config) {
        return this.callAPI(
            () => this.actors.daoBackend.setDAOConfig(config),
            'Set DAO Configuration'
        );
    }

    async getDAOInfo() {
        return this.callAPI(
            () => this.actors.daoBackend.getDAOInfo(),
            'Get DAO Info'
        );
    }

    async getDAOConfig() {
        return this.callAPI(
            () => this.actors.daoBackend.getDAOConfig(),
            'Get DAO Configuration'
        );
    }

    async getDAOStats() {
        return this.callAPI(
            () => this.actors.daoBackend.getDAOStats(),
            'Get DAO Statistics'
        );
    }

    // User Management APIs
    async registerUser(displayName, bio) {
        return this.callAPI(
            () => this.actors.daoBackend.registerUser(displayName, bio),
            'Register User'
        );
    }

    async adminRegisterUser(userPrincipal, displayName, bio) {
        return this.callAPI(
            () => this.actors.daoBackend.adminRegisterUser(userPrincipal, displayName, bio),
            'Admin Register User'
        );
    }

    async updateUserProfile(displayName, bio) {
        return this.callAPI(
            () => this.actors.daoBackend.updateUserProfile(displayName, bio),
            'Update User Profile'
        );
    }

    async getUserProfile(userId) {
        return this.callAPI(
            () => this.actors.daoBackend.getUserProfile(userId),
            'Get User Profile'
        );
    }

    async getAllUsers() {
        return this.callAPI(
            () => this.actors.daoBackend.getAllUsers(),
            'Get All Users'
        );
    }

    // Admin Management APIs
    async addAdmin(newAdmin) {
        return this.callAPI(
            () => this.actors.daoBackend.addAdmin(newAdmin),
            'Add Admin'
        );
    }

    async removeAdmin(adminToRemove) {
        return this.callAPI(
            () => this.actors.daoBackend.removeAdmin(adminToRemove),
            'Remove Admin'
        );
    }

    async checkIsAdmin(principal) {
        return this.callAPI(
            () => this.actors.daoBackend.checkIsAdmin(principal),
            'Check Is Admin'
        );
    }

    // Governance APIs (temporary implementations)
    async getGovernanceStats() {
        return this.callAPI(
            () => this.actors.daoBackend.getGovernanceStats(),
            'Get Governance Statistics'
        );
    }

    async createProposal(title, description, proposalType) {
        return this.callAPI(
            () => this.actors.daoBackend.createProposal(title, description, proposalType),
            'Create Proposal'
        );
    }

    async vote(proposalId, choice, reason) {
        return this.callAPI(
            () => this.actors.daoBackend.vote(proposalId, choice, reason),
            'Cast Vote'
        );
    }

    // Health check
    async healthCheck() {
        return this.callAPI(
            () => this.actors.daoBackend.health(),
            'Health Check'
        );
    }

    // Registry integration
    async registerWithRegistry() {
        return this.callAPI(
            () => this.actors.daoBackend.registerWithRegistry(),
            'Register with Registry'
        );
    }

    async getRegistryDAOId() {
        return this.callAPI(
            () => this.actors.daoBackend.getRegistryDAOId(),
            'Get Registry DAO ID'
        );
    }

    async isRegisteredInRegistry() {
        return this.callAPI(
            () => this.actors.daoBackend.isRegisteredInRegistry(),
            'Check Registry Registration Status'
        );
    }

    async updateRegistryStats() {
        return this.callAPI(
            () => this.actors.daoBackend.updateRegistryStats(),
            'Update Registry Stats'
        );
    }

    async getPublicDAOInfo() {
        return this.callAPI(
            () => this.actors.daoBackend.getPublicDAOInfo(),
            'Get Public DAO Info'
        );
    }

    // Utility method for batch operations
    async batchCall(operations) {
        const results = [];
        const errors = [];

        for (const operation of operations) {
            try {
                const result = await operation();
                results.push({ success: true, result });
            } catch (error) {
                results.push({ success: false, error: error.message });
                errors.push(error);
            }
        }

        return {
            results,
            errors,
            allSucceeded: errors.length === 0,
            successCount: results.filter(r => r.success).length,
            errorCount: errors.length
        };
    }

    // Enhanced error handling with retry logic
    async callAPIWithRetry(apiCall, operationName, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.callAPI(apiCall, operationName);
            } catch (error) {
                lastError = error;
                console.warn(`${operationName} attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    // Wait before retrying (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        
        throw lastError;
    }

    // Validation helpers
    validateDAOConfig(config) {
        const errors = [];
        
        if (!config.category || config.category.trim() === '') {
            errors.push('Category is required');
        }
        
        if (!config.tokenName || config.tokenName.trim() === '') {
            errors.push('Token name is required');
        }
        
        if (!config.tokenSymbol || config.tokenSymbol.trim() === '') {
            errors.push('Token symbol is required');
        }
        
        if (!config.totalSupply || config.totalSupply <= 0) {
            errors.push('Total supply must be greater than 0');
        }
        
        if (!config.termsAccepted) {
            errors.push('Terms and conditions must be accepted');
        }
        
        return errors;
    }
}

/**
 * React hook to use the DAO API wrapper
 */
import { useMemo } from 'react';
import { useActors } from '../context/ActorContext';

export const useDAOAPI = () => {
    const actors = useActors();
    
    const api = useMemo(() => {
        if (!actors) return null;
        return new DAOAPIWrapper(actors);
    }, [actors]);

    return api;
};
