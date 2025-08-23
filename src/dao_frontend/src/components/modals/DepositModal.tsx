import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, AlertTriangle, Loader2, TrendingUp } from 'lucide-react';
import BaseModal from './BaseModal';
import { useTreasury } from '../../hooks/useTreasury';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userBalance?: string;
  currentTreasuryBalance?: string;
}

const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userBalance = '0',
  currentTreasuryBalance = '0'
}) => {
  const { deposit, loading } = useTreasury();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const numericBalance = parseFloat(userBalance) || 0;
  const numericTreasuryBalance = parseFloat(currentTreasuryBalance) || 0;

  const depositReasons = [
    'Initial funding contribution',
    'Monthly treasury allocation',
    'Project milestone payment',
    'Community event funding',
    'Development grant',
    'Marketing budget',
    'Emergency fund contribution',
    'Other (specify below)'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!amount || amount.trim() === '') {
      newErrors.amount = 'Amount is required';
    } else if (numericAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (numericAmount > numericBalance) {
      newErrors.amount = 'Amount exceeds available balance';
    } else if (numericAmount < 1) {
      newErrors.amount = 'Minimum deposit amount is 1 token';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
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
      await deposit(amount, description);
      onSuccess?.();
      onClose();
      // Reset form
      setAmount('');
      setDescription('');
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
      setDescription('');
      setErrors({});
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'amount') {
      setAmount(value);
    } else if (field === 'description') {
      setDescription(value);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const newTreasuryBalance = numericTreasuryBalance + numericAmount;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="DEPOSIT TO TREASURY"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 font-mono text-sm">YOUR BALANCE</span>
            </div>
            <span className="text-white font-bold font-mono">{userBalance} tokens</span>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 font-mono text-sm">TREASURY BALANCE</span>
            </div>
            <span className="text-white font-bold font-mono">{currentTreasuryBalance} tokens</span>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
            DEPOSIT AMOUNT *
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Enter amount to deposit"
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

        {/* Description/Reason */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
            DEPOSIT REASON *
          </label>
          <select
            value={description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono mb-3 ${
              errors.description ? 'border-red-500' : 'border-gray-600'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Select a reason...</option>
            {depositReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          
          {description === 'Other (specify below)' && (
            <textarea
              value={description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Please specify the reason for this deposit"
              rows={3}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              }`}
              disabled={isSubmitting}
            />
          )}
          
          {errors.description && (
            <p className="text-red-400 text-sm mt-1 font-mono">{errors.description}</p>
          )}
        </div>

        {/* Transaction Preview */}
        {numericAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold font-mono">TRANSACTION PREVIEW</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 font-mono">Deposit Amount</span>
                <p className="text-white font-bold">{numericAmount.toLocaleString()} tokens</p>
              </div>
              <div>
                <span className="text-gray-400 font-mono">New Treasury Balance</span>
                <p className="text-green-400 font-bold">{newTreasuryBalance.toLocaleString()} tokens</p>
              </div>
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
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all font-semibold font-mono disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>DEPOSITING...</span>
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                <span>DEPOSIT TOKENS</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default DepositModal;