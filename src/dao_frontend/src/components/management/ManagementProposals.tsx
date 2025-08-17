import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { DAO } from '../../types/dao';
import { useProposals } from '../../hooks/useProposals';

const ManagementProposals: React.FC = () => {
  const { dao } = useOutletContext<{ dao: DAO }>();
  const { getAllProposals, createProposal } = useProposals();
  const [proposals, setProposals] = useState<any[]>([]);

  const loadProposals = async () => {
    try {
      const res = await getAllProposals();
      setProposals(res);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  useEffect(() => {
    loadProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateProposal = async () => {
    const title = prompt('Proposal title');
    if (!title) return;
    const description = prompt('Proposal description') || '';
    try {
      await createProposal(title, description);
      await loadProposals();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 font-mono">PROPOSALS</h2>
          <p className="text-gray-400">
            Create and manage governance proposals for {dao.name}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateProposal}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>New Proposal</span>
        </motion.button>
      </div>

      {/* Proposals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8"
      >
        <h3 className="text-xl font-bold text-white mb-6 font-mono">EXISTING PROPOSALS</h3>
        {proposals.length === 0 ? (
          <div className="text-center text-gray-400">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p>No proposals found.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {proposals.map((p) => (
              <li
                key={p.id.toString()}
                className="p-6 bg-gray-900/50 rounded-lg border border-gray-700/30"
              >
                <h4 className="text-lg font-semibold text-white">{p.title}</h4>
                <p className="text-gray-400 text-sm">{p.description}</p>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
};

export default ManagementProposals;
