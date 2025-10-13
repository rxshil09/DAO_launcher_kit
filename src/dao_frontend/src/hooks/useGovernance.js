/**
 * useGovernance Hook
 * 
 * Manages all governance-related operations including proposal creation,
 * voting, and governance configuration. Integrates with the governance
 * canister for decentralized decision-making.
 * 
 * @module hooks/useGovernance
 * 
 * @returns {Object} Governance operations interface
 * @returns {Function} createProposal - Create a new governance proposal
 * @returns {Function} vote - Cast a vote on a proposal
 * @returns {Function} getConfig - Get governance configuration
 * @returns {Function} getGovernanceStats - Get governance statistics
 * @returns {Function} executeProposal - Execute a passed proposal
 * @returns {Function} getActiveProposals - Get all active proposals
 * @returns {Function} getAllProposals - Get all proposals
 * @returns {Function} getProposal - Get a specific proposal by ID
 * @returns {Function} getProposalVotes - Get all votes for a proposal
 * @returns {Function} getProposalsByStatus - Get proposals filtered by status
 * @returns {Function} getUserVote - Get a specific user's vote on a proposal
 * @returns {Function} updateConfig - Update governance configuration (admin)
 * @returns {boolean} loading - Loading state for operations
 * @returns {string|null} error - Error message if operation fails
 * 
 * @example
 * ```jsx
 * function GovernancePanel() {
 *   const { createProposal, vote, getActiveProposals, loading } = useGovernance();
 *   
 *   const handleCreateProposal = async () => {
 *     const proposalId = await createProposal(
 *       "Increase Treasury Allocation",
 *       "Proposal to allocate more funds to development",
 *       { treasuryTransfer: { recipient, amount, reason } },
 *       604800 // 7 days in seconds
 *     );
 *     console.log("Proposal created:", proposalId);
 *   };
 *   
 *   const handleVote = async (proposalId) => {
 *     await vote(proposalId, "inFavor", "I support this allocation");
 *   };
 * }
 * ```
 * 
 * Proposal Types:
 * - textProposal: Simple text-based proposal
 * - treasuryTransfer: Request treasury funds
 * - parameterChange: Modify DAO parameters
 * - membershipChange: Add/remove members
 * 
 * Vote Choices:
 * - inFavor: Vote for the proposal
 * - against: Vote against the proposal
 * - abstain: Abstain from voting
 */

import { useState } from 'react';
import { useActors } from '../context/ActorContext';

export const useGovernance = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Convert seconds to nanoseconds for IC time representation
   * @private
   */
  const toNanoseconds = (seconds) => BigInt(seconds) * 1_000_000_000n;

  /**
   * Create a new governance proposal
   * 
   * @async
   * @param {string} title - Proposal title
   * @param {string} description - Detailed proposal description
   * @param {Object} proposalType - Proposal type variant (e.g., { textProposal: null })
   * @param {number} [votingPeriod] - Optional voting period in seconds (uses default if not provided)
   * @returns {Promise<number>} Proposal ID
   * @throws {Error} If proposal creation fails
   */
  const createProposal = async (
    title,
    description,
    proposalType,
    votingPeriod
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.governance.createProposal(
        title,
        description,
        proposalType,
        votingPeriod ? [toNanoseconds(votingPeriod)] : []
      );
      if ('err' in res) throw new Error(res.err);
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cast a vote on a proposal
   * 
   * @async
   * @param {number} proposalId - ID of the proposal to vote on
   * @param {string} choice - Vote choice: "inFavor", "against", or "abstain"
   * @param {string} [reason] - Optional reason for the vote
   * @returns {Promise<void>}
   * @throws {Error} If voting fails (already voted, insufficient power, etc.)
   */
  const vote = async (proposalId, choice, reason) => {
    setLoading(true);
    setError(null);
    try {
      const choiceVariant = { [choice]: null };
      const res = await actors.governance.vote(
        BigInt(proposalId),
        choiceVariant,
        reason ? [reason] : []
      );
      if ('err' in res) throw new Error(res.err);
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.governance.getConfig();
      if ('err' in res) throw new Error(res.err);
      return 'ok' in res ? res.ok : res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGovernanceStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.governance.getGovernanceStats();
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const executeProposal = async (proposalId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.governance.executeProposal(BigInt(proposalId));
      if ('err' in res) throw new Error(res.err);
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getActiveProposals = async () => {
    setLoading(true);
    setError(null);
    try {
      return await actors.governance.getActiveProposals();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllProposals = async () => {
    setLoading(true);
    setError(null);
    try {
      return await actors.governance.getAllProposals();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProposal = async (proposalId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.governance.getProposal(BigInt(proposalId));
      return res && res.length ? res[0] : null;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProposalVotes = async (proposalId) => {
    setLoading(true);
    setError(null);
    try {
      return await actors.governance.getProposalVotes(BigInt(proposalId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProposalsByStatus = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const statusVariant = { [status]: null };
      return await actors.governance.getProposalsByStatus(statusVariant);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserVote = async (proposalId, user) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.governance.getUserVote(
        BigInt(proposalId),
        user
      );
      return res && res.length ? res[0] : null;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.governance.updateConfig(newConfig);
      if ('err' in res) throw new Error(res.err);
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProposal,
    vote,
    getConfig,
    getGovernanceStats,
    executeProposal,
    getActiveProposals,
    getAllProposals,
    getProposal,
    getProposalVotes,
    getProposalsByStatus,
    getUserVote,
    updateConfig,
    loading,
    error,
  };
};
