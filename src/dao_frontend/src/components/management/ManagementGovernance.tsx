import React from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { 
  Vote, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import { DAO } from '../../types/dao';

const ManagementGovernance: React.FC = () => {
  const { dao } = useOutletContext<{ dao: DAO }>();

  const proposals = [
    {
      id: 1,
      title: 'Increase Development Fund Allocation',
      description: 'Proposal to allocate an additional 20% of treasury funds to development initiatives',
      status: 'active',
      votesFor: 1247,
      votesAgainst: 234,
      totalVotes: 1481,
      quorum: 1000,
      timeLeft: '3 days',
      proposer: 'alice.dao'
    },
    {
      id: 2,
      title: 'Update Staking Rewards Structure',
      description: 'Modify the staking rewards to incentivize longer-term commitments',
      status: 'passed',
      votesFor: 2156,
      votesAgainst: 445,
      totalVotes: 2601,
      quorum: 1000,
      timeLeft: 'Ended',
      proposer: 'bob.dao'
    },
    {
      id: 3,
      title: 'Partnership with DeFi Protocol X',
      description: 'Strategic partnership proposal for cross-protocol liquidity sharing',
      status: 'failed',
      votesFor: 567,
      votesAgainst: 1234,
      totalVotes: 1801,
      quorum: 1000,
      timeLeft: 'Ended',
      proposer: 'charlie.dao'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'passed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return Clock;
      case 'passed':
        return CheckCircle;
      case 'failed':
        return XCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 font-mono">GOVERNANCE</h2>
          <p className="text-gray-400">
            Manage proposals and participate in DAO governance
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Create Proposal</span>
        </motion.button>
      </div>

      {/* Governance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-blue-500/30 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Vote className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400 font-mono">TOTAL PROPOSALS</span>
          </div>
          <p className="text-2xl font-bold text-white">{dao.governance.totalProposals}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 border border-green-500/30 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400 font-mono">ACTIVE</span>
          </div>
          <p className="text-2xl font-bold text-white">{dao.governance.activeProposals}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 border border-purple-500/30 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400 font-mono">PARTICIPATION</span>
          </div>
          <p className="text-2xl font-bold text-white">78%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 border border-orange-500/30 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400 font-mono">SUCCESS RATE</span>
          </div>
          <p className="text-2xl font-bold text-white">85%</p>
        </motion.div>
      </div>

      {/* Proposals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6 font-mono">RECENT PROPOSALS</h3>
        
        <div className="space-y-4">
          {proposals.map((proposal, index) => {
            const StatusIcon = getStatusIcon(proposal.status);
            const approvalRate = Math.round((proposal.votesFor / proposal.totalVotes) * 100);
            
            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-6 bg-gray-900/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{proposal.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(proposal.status)}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {proposal.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{proposal.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Proposed by {proposal.proposer}</span>
                      <span>•</span>
                      <span>{proposal.timeLeft}</span>
                    </div>
                  </div>
                </div>

                {/* Voting Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-mono">Approval Rate</span>
                    <span className="text-blue-400 font-bold">{approvalRate}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div 
                      className={`h-2 rounded-full ${
                        proposal.status === 'passed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        proposal.status === 'failed' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                        'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${approvalRate}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.2 }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-green-400">For: {proposal.votesFor.toLocaleString()}</span>
                    <span className="text-red-400">Against: {proposal.votesAgainst.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default ManagementGovernance;