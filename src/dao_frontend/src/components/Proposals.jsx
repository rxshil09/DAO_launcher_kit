import React, { useState } from 'react';
import { useProposals } from '../hooks/useProposals';

const Proposals = () => {
  const { createProposal, vote, loading, error } = useProposals();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [proposalId, setProposalId] = useState('');
  const [choice, setChoice] = useState('inFavor');
  const [votingPower, setVotingPower] = useState('');
  const [reason, setReason] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    await createProposal(title, description);
    setTitle('');
    setDescription('');
  };

  const handleVote = async (e) => {
    e.preventDefault();
    await vote(proposalId, choice, votingPower, reason);
    setProposalId('');
    setVotingPower('');
    setReason('');
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">Proposals</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleCreate} className="space-y-2">
        <h2 className="text-xl font-semibold">Create Proposal</h2>
        <input
          className="border p-2 w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Create
        </button>
      </form>

      <form onSubmit={handleVote} className="space-y-2">
        <h2 className="text-xl font-semibold">Vote on Proposal</h2>
        <input
          className="border p-2 w-full"
          placeholder="Proposal ID"
          value={proposalId}
          onChange={(e) => setProposalId(e.target.value)}
        />
        <select
          className="border p-2 w-full"
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
        >
          <option value="inFavor">In Favor</option>
          <option value="against">Against</option>
          <option value="abstain">Abstain</option>
        </select>
        <input
          className="border p-2 w-full"
          placeholder="Voting Power"
          value={votingPower}
          onChange={(e) => setVotingPower(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Vote
        </button>
      </form>
    </div>
  );
};

export default Proposals;
