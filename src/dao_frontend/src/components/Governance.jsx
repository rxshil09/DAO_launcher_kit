import React, { useState, useEffect } from 'react';
import { useGovernance } from '../hooks/useGovernance';

const Governance = () => {
  const { createProposal, vote, getConfig, getGovernanceStats, loading, error } =
    useGovernance();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposalType, setProposalType] = useState('textProposal');
  const [votingPeriod, setVotingPeriod] = useState('');
  const [proposalId, setProposalId] = useState('');
  const [choice, setChoice] = useState('inFavor');
  const [reason, setReason] = useState('');
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cfg = await getConfig();
        setConfig(cfg);
        const st = await getGovernanceStats();
        setStats(st);
      } catch (e) {
        // error handled in hook
      }
    };
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createProposal(
      title,
      description,
      { [proposalType]: proposalType === 'textProposal' ? '' : null },
      votingPeriod
    );
    setTitle('');
    setDescription('');
    setProposalType('textProposal');
    setVotingPeriod('');
  };

  const handleVote = async (e) => {
    e.preventDefault();
    await vote(proposalId, choice, reason);
    setProposalId('');
    setReason('');
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">Governance</h1>
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
        <input
          className="border p-2 w-full"
          placeholder="Proposal Type"
          value={proposalType}
          onChange={(e) => setProposalType(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Voting Period (optional)"
          value={votingPeriod}
          onChange={(e) => setVotingPeriod(e.target.value)}
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

      <div>
        <h2 className="text-xl font-semibold">Configuration</h2>
        <pre className="bg-gray-100 p-2 overflow-auto">{config ? JSON.stringify(config, null, 2) : 'No config'}</pre>
      </div>
      <div>
        <h2 className="text-xl font-semibold">Stats</h2>
        <pre className="bg-gray-100 p-2 overflow-auto">{stats ? JSON.stringify(stats, null, 2) : 'No stats'}</pre>
      </div>
    </div>
  );
};

export default Governance;
