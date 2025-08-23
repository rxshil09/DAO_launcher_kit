import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, Unlock, Clock, DollarSign } from 'lucide-react';
import BaseModal from './BaseModal';
import { useStaking } from '../../hooks/useStaking';

interface UnstakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  stake: {
    id: bigint;
    amount: bigint;
    stakingPeriod: any;
    stakedAt: bigint;
    unlocksAt?: bigint[];
    rewards: bigint;
    isActive: boolean;
  } | null;
}

const UnstakeModal: React.FC<UnstakeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  stake
}) => {
  const { unstake, loading } = useStaking();
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

  const isLocked = stake.unlocksAt && stake.unlocksAt.length > 0;
  const unlockDate = isLocked ? stake.unlocksAt[0] : null;
  const isUnlocked = !isLocked || (unlockDate && Number(unlockDate) <= Date.now() * 1_000_000);
  
  const calculatePenalty = (): string => {
    if (isUnlocked || !unlockDate) return '0';
    
    const now = Date.now() * 1_000_000;
    const unlockTime = Number(unlockDate);
    const stakedTime = Number(stake.stakedAt);
    const totalLockPeriod = unlockTime - stakedTime;
    const remainingTime = unlockTime - now;
    
    if (remainingTime <= 0) return '0';
    
    const remainingRatio = remainingTime / totalLockPeriod;
    const penaltyRate = 0.1; // 10% base penalty
    const penalty = Number(stake.amount) * penaltyRate * remainingRatio;
    
    return penalty.toFixed(2);
  };

  const penalty = calculatePenalty();
  const totalReceived = Number(stake.amount) + Number(stake.rewards) - parseFloat(penalty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await unstake(stake.id);
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
      title="UNSTAKE TOKENS"
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
              <span className="text-gray-400 font-mono">Unlock Date</span>
              <p className="text-white">
                {unlockDate ? formatDate(unlockDate) : 'Flexible'}
              </p>
            </div>
            <div>
              <span className="text-gray-400 font-mono">Earned Rewards</span>
              <p className="text-green-400 font-bold">{formatToken(stake.rewards)} tokens</p>
            </div>
            <div>
              <span className="text-gray-400 font-mono">Status</span>
              <p className={`font-semibold ${isUnlocked ? 'text-green-400' : 'text-yellow-400'}`}>
                {isUnlocked ? 'Unlocked' : 'Locked'}
              </p>
            </div>
          </div>
        </div>

        {/* Penalty Warning */}
        {!isUnlocked && parseFloat(penalty) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold font-mono text-sm">EARLY UNSTAKING PENALTY</p>
                <p className="text-red-300 text-sm mt-1">
                  Unstaking before the lock period ends will incur a penalty of <strong>{penalty} tokens</strong>.
                  Consider waiting until {unlockDate ? formatDate(unlockDate) : 'unlock date'} to avoid penalties.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Info */}
        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Unlock className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold font-mono">READY TO UNSTAKE</span>
            </div>
            <p className="text-green-300 text-sm">
              Your tokens are unlocked and ready for withdrawal with no penalties.
            </p>
          </motion.div>
        )}

        {/* Transaction Summary */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h4 className="text-white font-semibold font-mono mb-3">UNSTAKING SUMMARY</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400 font-mono">Original Stake</span>
              <span className="text-white">{formatToken(stake.amount)} tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-mono">Earned Rewards</span>
              <span className="text-green-400">+{formatToken(stake.rewards)} tokens</span>
            </div>
            {parseFloat(penalty) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400 font-mono">Early Unstaking Penalty</span>
                <span className="text-red-400">-{penalty} tokens</span>
              </div>
            )}
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-white font-semibold font-mono">Total Received</span>
                <span className="text-cyan-400 font-bold font-mono">{totalReceived.toFixed(2)} tokens</span>
              </div>
            </div>
          </div>
        </div>

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
            disabled={isSubmitting || loading}
            className={`flex-1 px-6 py-3 rounded-lg transition-all font-semibold font-mono disabled:opacity-50 flex items-center justify-center space-x-2 ${
              parseFloat(penalty) > 0
                ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
            }`}
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>UNSTAKING...</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>{parseFloat(penalty) > 0 ? 'UNSTAKE WITH PENALTY' : 'UNSTAKE TOKENS'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default UnstakeModal;