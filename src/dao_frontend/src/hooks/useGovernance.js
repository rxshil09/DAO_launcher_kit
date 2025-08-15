import { useState } from 'react';
import { useActors } from '../context/ActorContext';

export const useGovernance = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProposal = async (title, description) => {
    setLoading(true);
    setError(null);
    try {
      const result = await actors.governance.createProposal(title, description);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const vote = async (proposalId, choice, votingPower, reason) => {
    setLoading(true);
    setError(null);
    try {
      const choiceVariant = { [choice]: null };
      const res = await actors.governance.vote(
        BigInt(proposalId),
        choiceVariant,
        BigInt(votingPower),
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
