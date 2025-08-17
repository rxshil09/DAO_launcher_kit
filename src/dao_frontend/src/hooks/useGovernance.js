import { useState } from 'react';
import { useActors } from '../context/ActorContext';

export const useGovernance = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toNanoseconds = (seconds) => BigInt(seconds) * 1_000_000_000n;

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
