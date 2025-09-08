import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, Loader2, Vote } from 'lucide-react';
import BaseModal from './BaseModal';
import { useProposals } from '../../hooks/useProposals';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createProposal, loading } = useProposals();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    votingPeriod: '7' // days
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'governance', label: 'Governance', description: 'Protocol governance and parameter changes' },
    { value: 'treasury', label: 'Treasury', description: 'Treasury management and fund allocation' },
    { value: 'technical', label: 'Technical', description: 'Technical upgrades and improvements' },
    { value: 'community', label: 'Community', description: 'Community initiatives and events' },
    { value: 'partnership', label: 'Partnership', description: 'Strategic partnerships and collaborations' }
  ];

  const votingPeriods = [
    { value: '3', label: '3 days', description: 'Quick decisions' },
    { value: '7', label: '7 days', description: 'Standard voting period' },
    { value: '14', label: '14 days', description: 'Extended discussion time' },
    { value: '30', label: '30 days', description: 'Major decisions' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Find and scroll to the first error field
      const errorOrder = ['title', 'description', 'category']; // Define priority order
      const firstErrorField = errorOrder.find(field => errors[field]);
      
      if (firstErrorField) {
        // Small delay to ensure errors are rendered
        setTimeout(() => {
          const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }, 100);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const votingPeriodSeconds = parseInt(formData.votingPeriod) * 24 * 60 * 60; // Convert days to seconds
      await createProposal(
        formData.title,
        formData.description,
        formData.category,
        votingPeriodSeconds.toString()
      );
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        votingPeriod: '7'
      });
      setErrors({});
    } catch (error) {
      setErrors({ submit: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        description: '',
        category: '',
        votingPeriod: '7'
      });
      setErrors({});
      onClose();
    }
  };

  const selectedCategory = categories.find(c => c.value === formData.category);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="CREATE PROPOSAL"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
            PROPOSAL TITLE (MUST BE 5 CHARACTERS LONG)
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter a clear, descriptive title "
            maxLength={100}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
              errors.title ? 'border-red-500' : 'border-gray-600'
            }`}
            disabled={isSubmitting}
          />
          <div className="flex justify-between mt-1">
            {errors.title && (
              <p className="text-red-400 text-sm font-mono">{errors.title}</p>
            )}
            <p className="text-gray-500 text-xs font-mono ml-auto">
              {formData.title.length}/100
            </p>
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
            DESCRIPTION  (MUST BE 20 CHARACTERS LONG)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Provide detailed information about your proposal, including rationale and expected outcomes"
            rows={6}
            maxLength={2000}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-600'
            }`}
            disabled={isSubmitting}
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <p className="text-red-400 text-sm font-mono">{errors.description}</p>
            )}
            <p className="text-gray-500 text-xs font-mono ml-auto">
              {formData.description.length}/2000
            </p>
          </div>
        </div>

        {/* Category Selection */}
        <div name="category">
          <label className="block text-sm font-semibold text-gray-300 mb-3 font-mono">
            CATEGORY *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => (
              <motion.label
                key={category.value}
                whileHover={{ scale: 1.01 }}
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.category === category.value
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={formData.category === category.value}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <h4 className="text-white font-semibold font-mono">{category.label}</h4>
                <p className="text-gray-400 text-sm">{category.description}</p>
              </motion.label>
            ))}
          </div>
          {errors.category && (
            <p className="text-red-400 text-sm mt-2 font-mono">{errors.category}</p>
          )}
        </div>

        {/* Voting Period */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
            VOTING PERIOD
          </label>
          <select
            value={formData.votingPeriod}
            onChange={(e) => handleInputChange('votingPeriod', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
            disabled={isSubmitting}
          >
            {votingPeriods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label} - {period.description}
              </option>
            ))}
          </select>
        </div>

        {/* Proposal Preview */}
        {formData.title && formData.description && selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-semibold font-mono">PROPOSAL PREVIEW</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400 font-mono">Title:</span>
                <p className="text-white">{formData.title}</p>
              </div>
              <div>
                <span className="text-gray-400 font-mono">Category:</span>
                <p className="text-cyan-400">{selectedCategory.label}</p>
              </div>
              <div>
                <span className="text-gray-400 font-mono">Voting Period:</span>
                <p className="text-white">{formData.votingPeriod} days</p>
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

        {/* Validation Errors Summary */}
        {Object.keys(errors).filter(key => key !== 'submit').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-semibold font-mono">VALIDATION ERRORS</span>
            </div>
            <div className="space-y-1">
              {Object.entries(errors).filter(([key]) => key !== 'submit').map(([field, error]) => (
                <div key={field} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400 text-sm font-mono">
                    {field.charAt(0).toUpperCase() + field.slice(1)}: {error}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
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
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold font-mono disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>CREATING...</span>
              </>
            ) : (
              <>
                <Vote className="w-4 h-4" />
                <span>CREATE PROPOSAL</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default CreateProposalModal;