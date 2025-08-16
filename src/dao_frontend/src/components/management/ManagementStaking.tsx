import React from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { 
  Coins, 
  Plus, 
  Clock, 
  TrendingUp,
  Award,
  Lock,
  Unlock,
  Calendar,
  DollarSign
} from 'lucide-react';
import { DAO } from '../../types/dao';

const ManagementStaking: React.FC = () => {
  const { dao } = useOutletContext<{ dao: DAO }>();

  const stakingPools = [
    {
      id: 1,
      name: 'Flexible Staking',
      duration: 'No lock',
      apr: '5.2%',
      totalStaked: '$245K',
      userStaked: '$1,250',
      multiplier: '1.0x',
      status: 'active'
    },
    {
      id: 2,
      name: '30-Day Lock',
      duration: '30 days',
      apr: '8.5%',
      totalStaked: '$180K',
      userStaked: '$2,500',
      multiplier: '1.1x',
      status: 'active'
    },
    {
      id: 3,
      name: '90-Day Lock',
      duration: '90 days',
      apr: '12.8%',
      totalStaked: '$320K',
      userStaked: '$5,000',
      multiplier: '1.3x',
      status: 'active'
    },
    {
      id: 4,
      name: '365-Day Lock',
      duration: '365 days',
      apr: '25.0%',
      totalStaked: '$455K',
      userStaked: '$0',
      multiplier: '2.0x',
      status: 'active'
    }
  ];

  const userStakes = [
    {
      id: 1,
      amount: '$2,500',
      pool: '30-Day Lock',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-14'),
      rewards: '$45.20',
      status: 'active'
    },
    {
      id: 2,
      amount: '$5,000',
      pool: '90-Day Lock',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-01'),
      rewards: '$128.50',
      status: 'active'
    }
  ];

  const getPoolColor = (index: number) => {
    const colors = ['blue', 'green', 'purple', 'orange'];
    return colors[index % colors.length];
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'green':
        return 'border-green-500/30 bg-green-500/10';
      case 'purple':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'orange':
        return 'border-orange-500/30 bg-orange-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 font-mono">STAKING</h2>
          <p className="text-gray-400">
            Stake your tokens to earn rewards and gain voting power
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Stake Tokens</span>
        </motion.button>
      </div>

      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-purple-500/30 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Coins className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400 font-mono">TOTAL STAKED</span>
          </div>
          <p className="text-2xl font-bold text-white">{dao.staking.totalStaked}</p>
          <p className="text-sm text-green-400 mt-1">+12.5% this month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 border border-green-500/30 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400 font-mono">AVG APR</span>
          </div>
          <p className="text-2xl font-bold text-white">{dao.staking.apr}</p>
          <p className="text-sm text-blue-400 mt-1">Across all pools</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 border border-blue-500/30 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400 font-mono">YOUR STAKE</span>
          </div>
          <p className="text-2xl font-bold text-white">$7,500</p>
          <p className="text-sm text-purple-400 mt-1">2 active stakes</p>
        </motion.div>
      </div>

      {/* Staking Pools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6 font-mono">STAKING POOLS</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stakingPools.map((pool, index) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl border ${getColorClasses(getPoolColor(index))} hover:border-opacity-60 transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">{pool.name}</h4>
                <span className="text-sm font-mono text-gray-400">{pool.multiplier} voting power</span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm font-mono">Duration</span>
                  <span className="text-white font-semibold">{pool.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm font-mono">APR</span>
                  <span className="text-green-400 font-bold">{pool.apr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm font-mono">Total Staked</span>
                  <span className="text-white">{pool.totalStaked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm font-mono">Your Stake</span>
                  <span className="text-blue-400 font-semibold">{pool.userStaked}</span>
                </div>
              </div>

              <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold">
                {pool.userStaked === '$0' ? 'Stake Now' : 'Add More'}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Your Stakes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6 font-mono">YOUR ACTIVE STAKES</h3>
        
        <div className="space-y-4">
          {userStakes.map((stake, index) => (
            <motion.div
              key={stake.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-6 bg-gray-900/50 rounded-lg border border-gray-700/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">{stake.pool}</h4>
                  <p className="text-blue-400 font-bold">{stake.amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">{stake.rewards}</p>
                  <p className="text-xs text-gray-400 font-mono">Rewards earned</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-400 font-mono">Start Date</span>
                  <p className="text-white">{stake.startDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-mono">End Date</span>
                  <p className="text-white">{stake.endDate.toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-mono">
                  Claim Rewards
                </button>
                <button className="flex-1 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-mono">
                  Unstake
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ManagementStaking;