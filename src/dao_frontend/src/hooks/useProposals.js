/**
 * useProposals Hook
 * 
 * Manages proposal-related operations including creation, voting, filtering,
 * and template management. Works closely with governance canister for voting mechanics.
 * 
 * @module hooks/useProposals
 * 
 * @returns {Object} Proposal operations interface
 * @returns {Function} createProposal - Create a new proposal
 * @returns {Function} vote - Vote on a proposal
 * @returns {Function} getAllProposals - Get all proposals
 * @returns {Function} getProposalsByCategory - Filter proposals by category
 * @returns {Function} getProposalTemplates - Get available proposal templates
 * @returns {boolean} loading - Loading state for operations
 * @returns {string|null} error - Error message if operation fails
 * 
 * @example
 * ```jsx
 * function ProposalCreator() {
 *   const { createProposal, vote, getProposalTemplates } = useProposals();
 *   
 *   const handleCreate = async () => {
 *     const proposalId = await createProposal(
 *       "Increase Staking Rewards",
 *       "Proposal to increase APR from 25% to 30%",
 *       "treasury",
 *       86400 // 24 hours in seconds
 *     );
 *   };
 *   
 *   const handleVote = async (proposalId) => {
 *     await vote(proposalId, "approve", "Great idea!");
 *   };
 * }
 * ```
 * 
 * Vote Choices:
 * - approve: Support the proposal
 * - reject: Oppose the proposal
 * - abstain: Neutral stance
 * 
 * Common Categories:
 * - treasury: Financial decisions
 * - governance: Rule changes
 * - technical: System upgrades
 * - community: Social initiatives
 */

import { useState } from 'react';
import { useActors } from '../context/ActorContext';

export const useProposals = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toNanoseconds = (seconds) => BigInt(seconds) * 1_000_000_000n;

  /**
   * Create a new proposal
   * 
   * @async
   * @param {string} title - Proposal title
   * @param {string} description - Detailed proposal description
   * @param {string} category - Proposal category (treasury, governance, technical, community)
   * @param {number} votingPeriod - Voting period in seconds
   * @returns {Promise<number>} Proposal ID
   * @throws {Error} If creation fails
   */
  const createProposal = async (title, description, category, votingPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.proposals.createProposal(
        title,
        description,
        { textProposal: '' },
        category ? [category] : [],
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
   * Get all proposals
   * 
   * @async
   * @returns {Promise<Array>} Array of all proposals
   * @throws {Error} If retrieval fails
   */
  const getAllProposals = async () => {
    setLoading(true);
    setError(null);
    try {
      return await actors.proposals.getAllProposals();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get proposals filtered by category
   * 
   * @async
   * @param {string} category - Category to filter by
   * @returns {Promise<Array>} Array of matching proposals
   * @throws {Error} If retrieval fails
   */
  const getProposalsByCategory = async (category) => {
    setLoading(true);
    setError(null);
    try {
      return await actors.proposals.getProposalsByCategory(category);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get available proposal templates
   * 
   * @async
   * @returns {Promise<Array>} Array of proposal templates with pre-configured settings
   * @throws {Error} If retrieval fails
   */
  const getProposalTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      return await actors.proposals.getProposalTemplates();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vote on a proposal
   * 
   * @async
   * @param {number} proposalId - ID of the proposal to vote on
   * @param {string} choice - Vote choice ("approve", "reject", "abstain")
   * @param {string} reason - Optional reason for the vote
   * @returns {Promise<void>}
   * @throws {Error} If voting fails (already voted, voting closed, etc.)
   */
  const vote = async (proposalId, choice, reason) => {
    setLoading(true);
    setError(null);
    try {
      const choiceVariant = { [choice]: null };
      const res = await actors.proposals.vote(
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

  return {
    createProposal,
    vote,
    getAllProposals,
    getProposalsByCategory,
    getProposalTemplates,
    loading,
    error,
  };
};
