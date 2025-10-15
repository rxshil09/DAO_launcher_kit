import React, { useEffect, useState } from 'react';
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
  Target,
  Activity,
} from 'lucide-react';
import { DAO } from '../../types/dao';
import { useProposals } from '../../hooks/useProposals';
import { useGovernance } from '../../hooks/useGovernance';
import { CreateProposalModal } from '../modals';

const ManagementGovernance: React.FC = () => {
  const { dao } = useOutletContext<{ dao: DAO }>();
  const { getAllProposals, vote } = useProposals();
  const {
    getActiveProposals,
    loading: activeLoading,
    error: activeError,
  } = useGovernance();
  const [proposals, setProposals] = useState<any[]>([]);
  const [activeProposals, setActiveProposals] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Function to handle create proposal with auto-scroll
  const handleCreateProposal = () => {
    // Open the modal
    setShowCreateModal(true);
  };

  const loadProposals = async () => {
    try {
      const res = await getAllProposals();
      setProposals(res);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  const loadActiveProposals = async () => {
    try {
      const res = await getActiveProposals();
      setActiveProposals(res);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  useEffect(() => {
    loadProposals();
    loadActiveProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleVote = async (id: bigint, choice: 'inFavor' | 'against' | 'abstain') => {
    try {
      await vote(id, choice);
      await loadProposals();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  const parseStatus = (status: any) => Object.keys(status)[0];

  const formatTimeLeft = (deadline: bigint) => {
    const diff = Number(deadline / 1_000_000n) - Date.now();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'pending':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'succeeded':
      case 'executed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'pending':
        return Clock;
      case 'succeeded':
      case 'executed':
        return CheckCircle;
      case 'failed':
      case 'cancelled':
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
          onClick={handleCreateProposal}
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

      {/* Active Proposals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white font-mono">ACTIVE PROPOSALS</h3>
          <button
            onClick={loadActiveProposals}
            className="px-3 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600 text-gray-200"
            disabled={activeLoading}
          >
            Refresh
          </button>
        </div>
        {activeError && <p className="text-red-400 mb-4">{activeError}</p>}
        {activeLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : activeProposals.length === 0 ? (
          <p className="text-gray-400">No active proposals</p>
        ) : (
          <div className="space-y-4">
            {activeProposals.map((proposal) => {
              const timeLeft = formatTimeLeft(proposal.votingDeadline);
              return (
                <div
                  key={proposal.id.toString()}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-white">{proposal.title}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor('active')}`}
                    >
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{proposal.description}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{timeLeft}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleVote(proposal.id, 'inFavor')}
                        className="px-3 py-1 text-xs rounded bg-green-600 text-white"
                      >
                        Vote For
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 'against')}
                        className="px-3 py-1 text-xs rounded bg-red-600 text-white"
                      >
                        Vote Against
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Proposals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6 font-mono">RECENT PROPOSALS</h3>
        
        <div className="space-y-4">
          {proposals.map((proposal, index) => {
            const status = parseStatus(proposal.status);
            const StatusIcon = getStatusIcon(status);
            const votesFor = Number(proposal.votesInFavor);
            const votesAgainst = Number(proposal.votesAgainst);
            const totalVotes = votesFor + votesAgainst;
            const approvalRate =
              totalVotes > 0 ? Math.round((votesFor / totalVotes) * 100) : 0;
            const timeLeft = formatTimeLeft(proposal.votingDeadline);
            
            return (
              <motion.div
                key={proposal.id.toString()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-6 bg-gray-900/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{proposal.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{proposal.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Proposed by {proposal.proposer.toString()}</span>
                      <span>•</span>
                      <span>{timeLeft}</span>
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
                        status === 'succeeded' || status === 'executed'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : status === 'failed' || status === 'cancelled'
                            ? 'bg-gradient-to-r from-red-500 to-pink-500'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${approvalRate}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.2 }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-green-400">For: {votesFor.toLocaleString()}</span>
                    <span className="text-red-400">Against: {votesAgainst.toLocaleString()}</span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => handleVote(proposal.id, 'inFavor')}
                      className="px-3 py-1 text-xs rounded bg-green-600 text-white"
                    >
                      Vote For
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 'against')}
                      className="px-3 py-1 text-xs rounded bg-red-600 text-white"
                    >
                      Vote Against
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Modals */}
      <CreateProposalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadProposals();
          loadActiveProposals();
        }}
      />
    </div>
  );
};

export default ManagementGovernance;