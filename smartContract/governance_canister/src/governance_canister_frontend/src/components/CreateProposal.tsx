import React, { useState } from 'react';
import governanceActor from '../utils/governance';

const CreateProposal = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<null | number>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await governanceActor.create_proposal(title, description);
      setResult(Number(res));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Create Proposal</h2>
      <form onSubmit={handleSubmit}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <br />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        <br />
        <button type="submit">Submit</button>
      </form>
      {result !== null && <p>Proposal ID: {result}</p>}
    </div>
  );
};

export default CreateProposal;
