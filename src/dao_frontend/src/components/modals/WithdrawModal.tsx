import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, AlertTriangle, Loader2, DollarSign, User } from 'lucide-react';
import BaseModal from './BaseModal';
import { useTreasury } from '../../hooks/useTreasury';
import { Principal } from '@dfinity/principal';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  availableBalance?: string;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  availableBalance = '0'
}) => {
  const { withdraw, loading } = useTreasury();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const numericBalance = parseFloat(availableBalance) || 0;

  const withdrawReasons = [
    'Development milestone payment',
    'Marketing campaign funding',
    'Team compensation',
    'Community event expenses',
    'Infrastructure costs',
    'Partnership payment',
    'Emergency fund withdrawal',
    'Other (specify below)'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate recipient
    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else {
      try {
        Principal.fromText(recipient.trim());
      } catch {
        newErrors.recipient = 'Invalid principal ID format';
      }
    }

    // Validate amount
    if (!amount || amount.trim() === '') {
      newErrors.amount = 'Amount is required';
    } else if (numericAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (numericAmount > numericBalance) {
      newErrors.amount = 'Amount exceeds available treasury balance';
    }

    // Validate description
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
      await withdraw(recipient.trim(), amount, description);
      onSuccess?.();
      onClose();
      // Reset form
      setRecipient('');
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
      setRecipient('');
      setAmount('');
      setDescription('');
      setErrors({});
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'recipient':
        setRecipient(value);
        break;
      case 'amount':
        setAmount(value);
        break;
      case 'description':
        setDescription(value);
        break;
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const remainingBalance = numericBalance - numericAmount;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="WITHDRAW FROM TREASURY"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Balance Display */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-mono text-sm">AVAILABLE TREASURY BALANCE</span>
            <span className="text-white font-bold font-mono">{availableBalance} tokens</span>
          </div>
        </div>

        {/* Recipient Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
            RECIPIENT PRINCIPAL ID *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              placeholder="Enter recipient's principal ID"
              className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                errors.recipient ? 'border-red-500' : 'border-gray-600'
              }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.recipient && (
            <p className="text-red-400 text-sm mt-1 font-mono">{errors.recipient}</p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
            WITHDRAWAL AMOUNT *
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Enter amount to withdraw"
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                errors.amount ? 'border-red-500' : 'border-gray-600'
              }`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setAmount(availableBalance)}
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
            WITHDRAWAL REASON *
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
            {withdrawReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          
          {description === 'Other (specify below)' && (
            <textarea
              value={description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Please specify the reason for this withdrawal"
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
        {numericAmount > 0 && recipient && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
          >
            <h4 className="text-white font-semibold font-mono mb-3">TRANSACTION PREVIEW</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400 font-mono">Withdrawal Amount</span>
                <span className="text-red-400 font-bold">-{numericAmount.toLocaleString()} tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-mono">Remaining Treasury Balance</span>
                <span className="text-white font-bold">{remainingBalance.toLocaleString()} tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-mono">Recipient</span>
                <span className="text-cyan-400 font-mono text-xs break-all">
                  {recipient.slice(0, 8)}...{recipient.slice(-6)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Authorization Warning */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start space-x-3"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-semibold font-mono text-sm">AUTHORIZATION REQUIRED</p>
            <p className="text-yellow-300 text-sm mt-1">
              Treasury withdrawals require proper authorization. Ensure you have the necessary permissions to perform this action.
            </p>
          </div>
        </motion.div>

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
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg transition-all font-semibold font-mono disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>WITHDRAWING...</span>
              </>
            ) : (
              <>
                <ArrowDownLeft className="w-4 h-4" />
                <span>WITHDRAW TOKENS</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default WithdrawModal;