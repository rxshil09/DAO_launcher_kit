import React, { useEffect, useState, useCallback } from 'react';
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
import { Principal } from '@dfinity/principal';
import { DAO } from '../../types/dao';
import { useStaking } from '../../hooks/useStaking';
import { useActors } from '../../context/ActorContext';
// @ts-ignore - AuthContext is a .jsx file
import { useAuth } from '../../context/AuthContext';
import type { Stake, StakingPeriod } from '../../declarations/staking/staking.did';
import { StakeTokensModal, UnstakeModal, ClaimRewardsModal } from '../modals';

const ManagementStaking: React.FC = () => {
  const { dao } = useOutletContext<{ dao: DAO }>();
  const { unstake, claimRewards, getStakingRewards } = useStaking();
  const actors = useActors();
  const { principal } = useAuth();

  const [stakingPools, setStakingPools] = useState<any[]>([]);
  const [userStakes, setUserStakes] = useState<Stake[]>([]);
  const [stakingStats, setStakingStats] = useState<any>(null);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showUnstakeModal, setShowUnstakeModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedStake, setSelectedStake] = useState<Stake | null>(null);
  const [selectedStakeRewards, setSelectedStakeRewards] = useState<any>(null);
  const [userBalance] = useState('10000'); // Mock user balance

  // Function to handle stake tokens with auto-scroll
  const handleStakeTokens = () => {
    setShowStakeModal(true);
  };

  const poolConfig: Record<string, { name: string; duration: string; apr: string; multiplier: string }> = {
    instant: { name: 'Flexible Staking', duration: 'No lock', apr: '5.2%', multiplier: '1.0x' },
    locked30: { name: '30-Day Lock', duration: '30 days', apr: '8.5%', multiplier: '1.1x' },
    locked90: { name: '90-Day Lock', duration: '90 days', apr: '12.8%', multiplier: '1.3x' },
    locked180: { name: '180-Day Lock', duration: '180 days', apr: '20.0%', multiplier: '1.7x' },
    locked365: { name: '365-Day Lock', duration: '365 days', apr: '25.0%', multiplier: '2.0x' }
  };

  const getPeriodKey = (period: StakingPeriod): string => {
    if ('instant' in period) return 'instant';
    if ('locked30' in period) return 'locked30';
    if ('locked90' in period) return 'locked90';
    if ('locked180' in period) return 'locked180';
    if ('locked365' in period) return 'locked365';
    return 'unknown';
  };

  const formatStakePeriod = (period: StakingPeriod): string => {
    const key = getPeriodKey(period);
    return poolConfig[key]?.name || key;
  };

  const formatDate = (time: bigint): string => {
    const millis = Number(time / BigInt(1_000_000));
    return new Date(millis).toLocaleDateString();
  };

  const formatToken = (amount: bigint): string => amount.toString();

  const fetchData = useCallback(async () => {
    if (!actors?.staking) return;
    try {
      const principalId = principal ? Principal.fromText(principal) : undefined;
      const [stats, stakes] = await Promise.all([
        actors.staking.getStakingStats(),
        principalId ? actors.staking.getUserStakes(principalId) : Promise.resolve([])
      ]);

      setUserStakes(stakes);
      setStakingStats(stats);

      const computeUserStake = (key: string) =>
        stakes
          .filter((s) => getPeriodKey(s.stakingPeriod) === key)
          .reduce((acc, s) => acc + s.amount, 0n);

      const pools = stats.stakingPeriodDistribution.map(([period, count], index) => {
        const key = getPeriodKey(period);
        const config = poolConfig[key];
        return {
          id: index,
          name: config?.name || key,
          duration: config?.duration || '',
          apr: config?.apr || '',
          totalStaked: count.toString(),
          userStaked: computeUserStake(key).toString(),
          multiplier: config?.multiplier || '',
          status: 'active',
          periodKey: key
        };
      });

      setStakingPools(pools);
    } catch (err) {
      console.error('Failed to fetch staking data', err);
    }
  }, [actors, principal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    <div className=" space-y-8">
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
          onClick={handleStakeTokens}
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
          <p className="text-2xl font-bold text-white">
            {stakingStats ? stakingStats.totalStakedAmount.toString() : dao.staking.totalStaked}
          </p>
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
            <span className="text-sm text-gray-400 font-mono">AVG STAKE</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stakingStats ? stakingStats.averageStakeAmount.toFixed(2) : dao.staking.apr}
          </p>
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
          <p className="text-2xl font-bold text-white">
            {userStakes.reduce((acc, s) => acc + Number(s.amount), 0)}
          </p>
          <p className="text-sm text-purple-400 mt-1">{userStakes.length} active stakes</p>
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

              <button
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
                onClick={handleStakeTokens}
              >
                {pool.userStaked === '0' ? 'Stake Now' : 'Add More'}
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
              key={stake.id.toString()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-6 bg-gray-900/50 rounded-lg border border-gray-700/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">{formatStakePeriod(stake.stakingPeriod)}</h4>
                  <p className="text-blue-400 font-bold">{formatToken(stake.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">{formatToken(stake.rewards)}</p>
                  <p className="text-xs text-gray-400 font-mono">Rewards earned</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-400 font-mono">Start Date</span>
                  <p className="text-white">{formatDate(stake.stakedAt)}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-mono">End Date</span>
                  <p className="text-white">{stake.unlocksAt?.length ? formatDate(stake.unlocksAt[0]) : '-'}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  className="flex-1 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-mono"
                  onClick={async () => {
                    setSelectedStake(stake);
                    try {
                      const rewards = await getStakingRewards(stake.id);
                      setSelectedStakeRewards(rewards);
                    } catch (e) {
                      console.error(e);
                      setSelectedStakeRewards(null);
                    }
                    setShowClaimModal(true);
                  }}
                >
                  Claim Rewards
                </button>
                <button
                  className="flex-1 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-mono"
                  onClick={() => {
                    setSelectedStake(stake);
                    setShowUnstakeModal(true);
                  }}
                >
                  Unstake
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modals */}
      <StakeTokensModal
        isOpen={showStakeModal}
        onClose={() => setShowStakeModal(false)}
        onSuccess={fetchData}
        userBalance={userBalance}
      />

      <UnstakeModal
        isOpen={showUnstakeModal}
        onClose={() => {
          setShowUnstakeModal(false);
          setSelectedStake(null);
        }}
        onSuccess={fetchData}
        stake={selectedStake}
      />

      <ClaimRewardsModal
        isOpen={showClaimModal}
        onClose={() => {
          setShowClaimModal(false);
          setSelectedStake(null);
          setSelectedStakeRewards(null);
        }}
        onSuccess={fetchData}
        stake={selectedStake}
        rewardsData={selectedStakeRewards}
      />
    </div>
  );
};

export default ManagementStaking;