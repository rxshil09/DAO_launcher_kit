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

  const launchDAO = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // ----- Step 1: Initialize DAO -----
      const initialAdmins = formData.teamMembers
        .map((member) => member.wallet)
        .filter(Boolean)
        .map((wallet) => Principal.fromText(wallet));

      // ensure creator is an admin
      let creatorPrincipal = null;
      if (principal) {
        try {
          creatorPrincipal = Principal.fromText(principal);
          const exists = initialAdmins.some(
            (admin) => admin.toText() === creatorPrincipal.toText()
          );
          if (!exists) {
            initialAdmins.push(creatorPrincipal);
          }
        } catch (err) {
          console.warn('Failed to parse authenticated principal:', err);
        }
      }

      const initResult = await actors.daoBackend.initialize(
        formData.daoName,
        formData.description,
        initialAdmins
      );
      if ('err' in initResult) {
        throw new Error(initResult.err);
      }

      // ----- Step 1.5: send DAO configuration -----
      const daoConfig = {
        category: formData.category || '',
        website: formData.website || '',
        selectedModules: formData.selectedModules || [],
        moduleFeatures: Object.entries(formData.selectedFeatures || {}).map(
          ([moduleId, features]) => ({ moduleId, features })
        ),
        tokenName: formData.tokenName || '',
        tokenSymbol: formData.tokenSymbol || '',
        totalSupply: BigInt(formData.totalSupply || 0),
        initialPrice: BigInt(formData.initialPrice || 0),
        votingPeriod: BigInt(formData.votingPeriod || 0),
        quorumThreshold: BigInt(formData.quorumThreshold || 0),
        proposalThreshold: BigInt(formData.proposalThreshold || 0),
        fundingGoal: BigInt(formData.fundingGoal || 0),
        fundingDuration: BigInt(formData.fundingDuration || 0),
        minInvestment: BigInt(formData.minInvestment || 0),
        termsAccepted: Boolean(formData.termsAccepted),
        kycRequired: Boolean(formData.kycRequired),
      };

      const configResult = await actors.daoBackend.setDAOConfig(daoConfig);
      if ('err' in configResult) {
        throw new Error(configResult.err);
      }

      // ----- Step 2: set required canister references -----
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

      const governanceCanisterId = getCanisterPrincipal('VITE_GOVERNANCE_CANISTER_ID');
      const stakingCanisterId = getCanisterPrincipal('VITE_STAKING_CANISTER_ID');
      const treasuryCanisterId = getCanisterPrincipal('VITE_TREASURY_CANISTER_ID');
      const proposalsCanisterId = getCanisterPrincipal('VITE_PROPOSALS_CANISTER_ID');

      const canisterRefResult = await actors.daoBackend.setCanisterReferences(
        governanceCanisterId,
        stakingCanisterId,
        treasuryCanisterId,
        proposalsCanisterId
      );
      if ('err' in canisterRefResult) {
        throw new Error(canisterRefResult.err);
      }

      // ----- Step 3: register users -----
      if (creatorPrincipal) {
        const registerCreator = await actors.daoBackend.adminRegisterUser(
          creatorPrincipal,
          'DAO Creator',
          'DAO Creator and Administrator'
        );
        if ('err' in registerCreator) {
          throw new Error(registerCreator.err);
        }
      }

      for (const member of formData.teamMembers) {
        if (member.wallet) {
          try {
            const memberPrincipal = Principal.fromText(member.wallet);
            const registerRes = await actors.daoBackend.adminRegisterUser(
              memberPrincipal,
              member.name || 'Team Member',
              member.role || ''
            );
            if ('err' in registerRes) {
              console.warn(
                `Failed to register team member ${member.wallet}:`,
                registerRes.err
              );
            }
          } catch (err) {
            console.warn(`Failed to register team member ${member.wallet}:`, err);
          }
        }
      }

      // ----- Step 4: return DAO info -----
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
    error,
  };
};
