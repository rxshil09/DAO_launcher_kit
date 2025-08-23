import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, AlertTriangle, Loader2, TrendingUp, Coins } from 'lucide-react';
import BaseModal from './BaseModal';
import { useStaking } from '../../hooks/useStaking';

interface ClaimRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  stake: {
    id: bigint;
    amount: bigint;
    stakingPeriod: any;
    stakedAt: bigint;
    rewards: bigint;
    isActive: boolean;
  } | null;
  rewardsData?: {
    totalRewards: bigint;
    claimableRewards: bigint;
    lastClaimedAt?: bigint[];
    apr: number;
  } | null;
}

const ClaimRewardsModal: React.FC<ClaimRewardsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  stake,
  rewardsData
}) => {
  const { claimRewards, loading } = useStaking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!stake) return null;

  const formatStakePeriod = (period: any): string => {
    if ('instant' in period) return 'Flexible Staking';
    if ('locked30' in period) return '30-Day Lock';
    if ('locked90' in period) return '90-Day Lock';
    if ('locked180' in period) return '180-Day Lock';
    if ('locked365' in period) return '365-Day Lock';
    return 'Unknown';
  };

  const formatDate = (time: bigint): string => {
    const millis = Number(time / BigInt(1_000_000));
    return new Date(millis).toLocaleDateString();
  };

  const formatToken = (amount: bigint): string => amount.toString();

  const claimableAmount = rewardsData?.claimableRewards || stake.rewards;
  const totalRewards = rewardsData?.totalRewards || stake.rewards;
  const apr = rewardsData?.apr || 0;
  const lastClaimed = rewardsData?.lastClaimedAt?.[0];

  const canClaim = Number(claimableAmount) > 0;
  const isFlexibleStaking = 'instant' in stake.stakingPeriod;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canClaim) {
      setError('No rewards available to claim');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await claimRewards(stake.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError('');
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="CLAIM REWARDS"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Stake Information */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 font-mono">STAKE DETAILS</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 font-mono">Staking Type</span>
              <p className="text-white font-semibold">{formatStakePeriod(stake.stakingPeriod)}</p>
            </div>
            <div>
              <span className="text-gray-400 font-mono">Staked Amount</span>
              <p className="text-white font-bold">{formatToken(stake.amount)} tokens</p>
            </div>
            <div>
              <span className="text-gray-400 font-mono">Staked Date</span>
              <p className="text-white">{formatDate(stake.stakedAt)}</p>
            </div>
            <div>
              <span className="text-gray-400 font-mono">Current APR</span>
              <p className="text-green-400 font-bold">{apr.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Rewards Summary */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-bold font-mono text-lg">REWARDS SUMMARY</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-mono">Total Rewards Earned</span>
              <span className="text-white font-bold text-lg">{formatToken(totalRewards)} tokens</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-mono">Available to Claim</span>
              <span className="text-green-400 font-bold text-xl">{formatToken(claimableAmount)} tokens</span>
            </div>
            
            {lastClaimed && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono">Last Claimed</span>
                <span className="text-gray-300">{formatDate(lastClaimed)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Claiming Rules */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Coins className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 font-semibold font-mono text-sm">CLAIMING RULES</p>
              <div className="text-blue-300 text-sm mt-1 space-y-1">
                {isFlexibleStaking ? (
                  <p>• Flexible staking allows reward claiming at any time</p>
                ) : (
                  <p>• Locked staking rewards are claimed automatically upon unstaking</p>
                )}
                <p>• Claimed rewards are immediately available in your wallet</p>
                <p>• Claiming does not affect your staked principal amount</p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning for locked staking */}
        {!isFlexibleStaking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start space-x-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-semibold font-mono text-sm">LOCKED STAKING NOTICE</p>
              <p className="text-yellow-300 text-sm mt-1">
                Rewards for locked staking are automatically claimed when you unstake. 
                Manual claiming is only available for flexible staking.
              </p>
            </div>
          </motion.div>
        )}

        {/* No rewards available */}
        {!canClaim && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-center"
          >
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 font-mono">No rewards available to claim at this time</p>
            <p className="text-gray-500 text-sm mt-1">Continue staking to earn more rewards</p>
          </motion.div>
        )}

        {/* Submit Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400 font-mono text-sm">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-semibold font-mono disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loading || !canClaim || !isFlexibleStaking}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all font-semibold font-mono disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>CLAIMING...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>CLAIM REWARDS</span>
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ClaimRewardsModal;