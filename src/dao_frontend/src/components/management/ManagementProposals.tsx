import React from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Vote,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';
import { DAO } from '../../types/dao';

const ManagementProposals: React.FC = () => {
  const { dao } = useOutletContext<{ dao: DAO }>();

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
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>New Proposal</span>
        </motion.button>
      </div>

      {/* Placeholder Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center"
      >
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2 font-mono">PROPOSALS MANAGEMENT</h3>
        <p className="text-gray-400 mb-6">
          This section will contain detailed proposal management functionality
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 border border-blue-500/30 p-4 rounded-lg">
            <Vote className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-blue-400 font-mono">Create Proposals</p>
          </div>
          <div className="bg-gray-900/50 border border-green-500/30 p-4 rounded-lg">
            <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-mono">Vote on Proposals</p>
          </div>
          <div className="bg-gray-900/50 border border-purple-500/30 p-4 rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-purple-400 font-mono">Track Results</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagementProposals;