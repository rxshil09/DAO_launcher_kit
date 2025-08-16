import { useState } from 'react';
import { useActors } from '../context/ActorContext';

export const useProposals = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toNanoseconds = (seconds) => BigInt(seconds) * 1_000_000_000n;

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

  const getTrendingProposals = async (limit) => {
    setLoading(true);
    setError(null);
    try {
      return await actors.proposals.getTrendingProposals(BigInt(limit));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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

  const addTemplate = async (
    name,
    description,
    category,
    requiredFields,
    template
  ) => {
    setLoading(true);
    setError(null);
    try {
      return await actors.proposals.addTemplate(
        name,
        description,
        category,
        requiredFields,
        template
      );
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
    getTrendingProposals,
    getProposalTemplates,
    addTemplate,
    loading,
    error,
  };
};
