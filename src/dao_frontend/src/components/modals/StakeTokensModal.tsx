import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Clock, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import BaseModal from './BaseModal';
import { useStaking } from '../../hooks/useStaking';

interface StakeTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userBalance?: string;
}

const StakeTokensModal: React.FC<StakeTokensModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userBalance = '0'
}) => {
  const { stake, loading } = useStaking();
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('instant');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stakingPeriods = [
    { 
      value: 'instant', 
      label: 'Flexible Staking', 
      duration: 'No lock period', 
      apr: '5.2%', 
      multiplier: '1.0x',
      description: 'Unstake anytime with no penalties'
    },
    { 
      value: 'locked30', 
      label: '30-Day Lock', 
      duration: '30 days', 
      apr: '8.5%', 
      multiplier: '1.1x',
      description: 'Higher rewards with 30-day commitment'
    },
    { 
      value: 'locked90', 
      label: '90-Day Lock', 
      duration: '90 days', 
      apr: '12.8%', 
      multiplier: '1.3x',
      description: 'Significant rewards for 3-month lock'
    },
    { 
      value: 'locked180', 
      label: '180-Day Lock', 
      duration: '180 days', 
      apr: '20.0%', 
      multiplier: '1.7x',
      description: 'Premium rewards for 6-month commitment'
    },
    { 
      value: 'locked365', 
      label: '365-Day Lock', 
      duration: '365 days', 
      apr: '25.0%', 
      multiplier: '2.0x',
      description: 'Maximum rewards for 1-year lock'
    }
  ];

  const selectedPeriodData = stakingPeriods.find(p => p.value === period);
  const numericAmount = parseFloat(amount) || 0;
  const numericBalance = parseFloat(userBalance) || 0;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!amount || amount.trim() === '') {
      newErrors.amount = 'Amount is required';
    } else if (numericAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (numericAmount > numericBalance) {
      newErrors.amount = 'Amount exceeds available balance';
    } else if (numericAmount < 10) {
      newErrors.amount = 'Minimum stake amount is 10 tokens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await stake(amount, period);
      onSuccess?.();
      onClose();
      // Reset form
      setAmount('');
      setPeriod('instant');
      setErrors({});
    } catch (error) {
      setErrors({ submit: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount('');
      setPeriod('instant');
      setErrors({});
      onClose();
    }
  };

  const calculateRewards = () => {
    if (!selectedPeriodData || numericAmount <= 0) return '0';
    const apr = parseFloat(selectedPeriodData.apr) / 100;
    const yearlyRewards = numericAmount * apr;
    return yearlyRewards.toFixed(2);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="STAKE TOKENS"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Balance Display */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-mono text-sm">AVAILABLE BALANCE</span>
            <span className="text-white font-bold font-mono">{userBalance} tokens</span>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
            STAKE AMOUNT *
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors(prev => ({ ...prev, amount: '' }));
                }
              }}
              placeholder="Enter amount to stake"
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                errors.amount ? 'border-red-500' : 'border-gray-600'
              }`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setAmount(userBalance)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 text-sm font-mono"
              disabled={isSubmitting}
            >
              MAX
            </button>
          </div>
          {errors.amount && (
            <p className="text-red-400 text-sm mt-1 font-mono">{errors.amount}</p>
          )}
        </div>

        {/* Staking Period Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3 font-mono">
            STAKING PERIOD *
          </label>
          <div className="space-y-3">
            {stakingPeriods.map((periodOption) => (
              <motion.label
                key={periodOption.value}
                whileHover={{ scale: 1.01 }}
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  period === periodOption.value
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="period"
                  value={periodOption.value}
                  checked={period === periodOption.value}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold font-mono">{periodOption.label}</h4>
                    <p className="text-gray-400 text-sm">{periodOption.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold font-mono">{periodOption.apr} APR</div>
                    <div className="text-purple-400 text-sm font-mono">{periodOption.multiplier} voting power</div>
                  </div>
                </div>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Rewards Preview */}
        {numericAmount > 0 && selectedPeriodData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold font-mono">ESTIMATED REWARDS</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 font-mono">Annual Rewards</span>
                <p className="text-white font-bold">{calculateRewards()} tokens</p>
              </div>
              <div>
                <span className="text-gray-400 font-mono">Voting Power</span>
                <p className="text-purple-400 font-bold">{(numericAmount * parseFloat(selectedPeriodData.multiplier)).toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Warning for locked periods */}
        {period !== 'instant' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start space-x-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-semibold font-mono text-sm">LOCK PERIOD WARNING</p>
              <p className="text-yellow-300 text-sm mt-1">
                Your tokens will be locked for {selectedPeriodData?.duration}. Early unstaking may incur penalties.
              </p>
            </div>
          </motion.div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400 font-mono text-sm">{errors.submit}</span>
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
            type="submit"
            disabled={isSubmitting || loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all font-semibold font-mono disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>STAKING...</span>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4" />
                <span>STAKE TOKENS</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default StakeTokensModal;