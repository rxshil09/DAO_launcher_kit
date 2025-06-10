import React, { useState } from 'react';
import governanceActorPromise from '../utils/governance'; // Your canister interface

const CreateProposal: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !description) {
      setError('Title and description are required.');
      return;
    }

    try {
      const governanceActor = await governanceActorPromise;
      setLoading(true);
      const id = await governanceActor.create_proposal(title, description) as bigint;

      setProposalId(id.toString()); // Convert BigInt to string for display
    } catch (err) {
      console.error(err);
      setError('Failed to create proposal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Proposal</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <br />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {proposalId && <p>✅ Proposal created with ID: {proposalId}</p>}
    </div>
  );
};

export default CreateProposal;
