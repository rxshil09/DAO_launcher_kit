import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Star,
  Activity,
  Shield
} from 'lucide-react';
import { DAO } from '../types/dao';

interface DAOCardProps {
  dao: DAO;
  index: number;
}

const DAOCard: React.FC<DAOCardProps> = ({ dao, index }) => {
  const navigate = useNavigate();

  const handleManage = () => {
    navigate(`/dao/${dao.id}/manage/overview`);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'defi':
        return 'from-green-400 to-emerald-500';
      case 'gaming':
        return 'from-purple-400 to-pink-500';
      case 'social':
        return 'from-blue-400 to-cyan-500';
      case 'nft':
        return 'from-orange-400 to-red-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'paused':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        boxShadow: "0 25px 50px rgba(59, 130, 246, 0.15)"
      }}
      className="bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-sm overflow-hidden hover:border-blue-400/50 transition-all group relative"
    >
      {/* Header with Logo and Status */}
      <div className="relative h-48 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(dao.category)} opacity-20`}></div>
        {dao.logo ? (
          <img 
            src={dao.logo} 
            alt={dao.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(dao.category)} flex items-center justify-center`}>
            <Shield className="w-16 h-16 text-white/80" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(dao.status)}`}>
            {dao.status.toUpperCase()}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/30 text-white border border-white/20 backdrop-blur-sm">
            {dao.category}
          </span>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* DAO Name and Token */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate">
            {dao.name}
          </h3>
          <span className="text-sm font-mono text-blue-400 bg-blue-500/20 px-2 py-1 rounded border border-blue-500/30">
            ${dao.tokenSymbol}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {dao.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400 font-mono">MEMBERS</span>
            </div>
            <p className="text-lg font-bold text-white">{dao.memberCount.toLocaleString()}</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400 font-mono">TVL</span>
            </div>
            <p className="text-lg font-bold text-white">{dao.totalValueLocked}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-mono">Active Proposals</span>
            <span className="text-blue-400 font-bold">{dao.governance.activeProposals}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-mono">Staking APR</span>
            <span className="text-green-400 font-bold">{dao.staking.apr}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-mono">Created</span>
            <span className="text-gray-300">
              {dao.createdAt 
                ? new Date(dao.createdAt).toLocaleDateString() 
                : 'N/A'
              }
            </span>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          onClick={handleManage}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg transition-all font-semibold flex items-center justify-center space-x-2 group"
        >
          <span>Manage DAO</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DAOCard;