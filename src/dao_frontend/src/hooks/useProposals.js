import { useState } from 'react';
import { useActors } from '../context/ActorContext';

export const useProposals = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProposal = async (title, description, category, votingPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const result = await actors.proposals.createProposal(
        title,
        description,
        { textProposal: '' },
        category ? [category] : [],
        votingPeriod ? [BigInt(votingPeriod)] : []
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
      const res = await actors.proposals.vote(
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

  return { createProposal, vote, loading, error };
};
