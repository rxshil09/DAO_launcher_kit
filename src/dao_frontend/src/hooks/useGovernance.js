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
      const result = await actors.governance.createProposal(
        title,
        description,
        proposalType,
        votingPeriod ? [toNanoseconds(votingPeriod)] : []
      );
      return result;
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
      return res;
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
      const cfg = await actors.governance.getConfig();
      return cfg;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await actors.governance.getStats();
      return stats;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createProposal, vote, getConfig, getStats, loading, error };
};
