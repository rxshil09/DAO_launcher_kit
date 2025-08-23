import React, { useEffect, useState } from 'react';
import { useGovernance } from '../hooks/useGovernance';
import { useAuth } from '../context/AuthContext';

const ProposalDetail = ({ proposalId, onClose }) => {
  const {
    getProposal,
    getProposalVotes,
    executeProposal,
    getUserVote,
    loading,
    error,
  } = useGovernance();
  const { principal } = useAuth();
  const [proposal, setProposal] = useState(null);
  const [votes, setVotes] = useState([]);
  const [userVote, setUserVote] = useState(null);

  useEffect(() => {
    const load = async () => {
      const p = await getProposal(proposalId);
      setProposal(p);
      const v = await getProposalVotes(proposalId);
      setVotes(v);
      if (principal) {
        const uv = await getUserVote(proposalId, principal);
        setUserVote(uv);
      }
    };
    load();
  }, [proposalId, principal]);

  const handleExecute = async () => {
    try {
      await executeProposal(proposalId);
    } catch (e) {
      console.error(e);
    }
  };

  const voteSummary = votes.reduce(
    (acc, v) => {
      const key = Object.keys(v.choice)[0];
      acc[key] = (acc[key] || 0n) + v.votingPower;
      return acc;
    },
    { inFavor: 0n, against: 0n, abstain: 0n }
  );

  return (
    <div className="border p-4 rounded mt-4">
      {error && <p className="text-red-500">{error}</p>}
      {proposal ? (
        <>
          <h3 className="text-xl font-semibold">{proposal.title}</h3>
          <p className="mb-2">{proposal.description}</p>
          <p className="mb-2">Status: {Object.keys(proposal.status)[0]}</p>
          <div className="mb-2">
            <p>Votes in Favor: {voteSummary.inFavor.toString()}</p>
            <p>Votes Against: {voteSummary.against.toString()}</p>
            <p>Votes Abstain: {voteSummary.abstain.toString()}</p>
          </div>
          <div className="mb-2">
            {userVote ? (
              <p>
                Your Vote: {Object.keys(userVote.choice)[0]}
              </p>
            ) : (
              <p>You have not voted.</p>
            )}
          </div>
          {Object.keys(proposal.status)[0] === 'succeeded' && (
            <button
              onClick={handleExecute}
              className="bg-purple-500 text-white px-2 py-1 rounded mr-2"
              disabled={loading}
            >
              Execute
            </button>
          )}
          <button onClick={onClose} className="bg-gray-300 px-2 py-1 rounded">
            Close
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProposalDetail;
