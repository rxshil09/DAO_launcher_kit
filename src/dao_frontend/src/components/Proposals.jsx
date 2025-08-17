import React, { useEffect, useState } from 'react';
import { useProposals } from '../hooks/useProposals';
import { useGovernance } from '../hooks/useGovernance';
import ProposalDetail from './ProposalDetail';

const Proposals = () => {
  const {
    createProposal,
    vote,
    getAllProposals,
    getProposalsByCategory,
    getProposalTemplates,
    loading,
    error,
  } = useProposals();
  const {
    getAllProposals: getGovProposals,
    getProposalsByStatus,
    loading: govLoading,
    error: govError,
  } = useGovernance();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [votingPeriod, setVotingPeriod] = useState('');

  const [proposalId, setProposalId] = useState('');
  const [choice, setChoice] = useState('inFavor');
  const [reason, setReason] = useState('');
  const [proposals, setProposals] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [templates, setTemplates] = useState([]);
  const [govProposals, setGovProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadProposals();
    loadTemplates();
    loadGovProposals();
  }, []);

  const loadProposals = async () => {
    const all = await getAllProposals();
    setProposals(all);
  };

  const loadTemplates = async () => {
    const tpls = await getProposalTemplates();
    setTemplates(tpls);
  };

  const loadGovProposals = async () => {
    const gps = await getGovProposals();
    setGovProposals(gps);
  };

  const handleStatusFilter = async (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    if (value) {
      const filtered = await getProposalsByStatus(value);
      setGovProposals(filtered);
    } else {
      loadGovProposals();
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const id = await createProposal(title, description, category, votingPeriod);
      console.log('Created proposal:', id);
      setTitle('');
      setDescription('');
      setCategory('');
      setVotingPeriod('');
    } catch (err) {
      console.error(err);
    }

  };

  const handleVote = async (e) => {
    e.preventDefault();
    try {
      await vote(proposalId, choice, reason);
      console.log('Voted on proposal');
      setProposalId('');
      setReason('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilter = async (e) => {
    const value = e.target.value;
    setCategoryFilter(value);
    if (value) {
      const filtered = await getProposalsByCategory(value);
      setProposals(filtered);
    } else {
      loadProposals();
    }
  };

  const handleCreateFromTemplate = async (template) => {
    await createProposal(
      template.name,
      template.template,
      template.category,
      votingPeriod
    );
    loadProposals();
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">Proposals</h1>
      {(error || govError) && (
        <p className="text-red-500">{error || govError}</p>
      )}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Existing Proposals</h2>
        <input
          className="border p-2 w-full"
          placeholder="Filter by category"
          value={categoryFilter}
          onChange={handleFilter}
        />
        <ul className="space-y-2">
          {proposals.map((p) => (
            <li key={p.id.toString()} className="border p-2 rounded">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm">{p.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Governance Proposals</h2>
        <select
          className="border p-2 w-full"
          value={statusFilter}
          onChange={handleStatusFilter}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="succeeded">Succeeded</option>
          <option value="executed">Executed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <ul className="space-y-2">
          {govProposals.map((p) => (
            <li key={p.id.toString()} className="border p-2 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm">Status: {Object.keys(p.status)[0]}</p>
                </div>
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => setSelectedProposal(p.id)}
                  disabled={govLoading}
                >
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
        {selectedProposal && (
          <ProposalDetail
            proposalId={selectedProposal}
            onClose={() => setSelectedProposal(null)}
          />
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Create from Template</h2>
        <ul className="space-y-2">
          {templates.map((t) => (
            <li key={t.id.toString()} className="border p-2 rounded">
              <h3 className="font-semibold">{t.name}</h3>
              <p className="text-sm">{t.description}</p>
              <button
                className="mt-2 bg-purple-500 text-white px-2 py-1 rounded"
                onClick={() => handleCreateFromTemplate(t)}
              >
                Create
              </button>
            </li>
          ))}
        </ul>
      </div>
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
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Voting Period in seconds (optional)"
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
    </div>
  );
};

export default Proposals;
