import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, ExternalLink, ArrowRight, Share2, Twitter, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LaunchSuccess = ({ daoData, onClose }) => {
  const navigate = useNavigate();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    console.log('Copied to clipboard:', text);
  };

  const shareOnTwitter = () => {
    const text = `I just launched my DAO "${daoData.name}" on DAOVerse! 🚀`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const daoUrl = `${window.location.origin}/dao/${daoData.id || daoData.name.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-cyan-500/30 rounded-xl p-8 max-w-2xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 relative"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
            <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-2 font-mono"
          >
            DAO Successfully Launched! 🚀
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400"
          >
            Your DAO has been created and is ready for members
          </motion.p>
        </div>

        {/* DAO Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 font-mono">DAO DETAILS</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-mono">Name:</span>
              <span className="text-white font-bold">{daoData.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-mono">Token Symbol:</span>
              <span className="text-cyan-400 font-bold">${daoData.tokenSymbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-mono">Category:</span>
              <span className="text-white font-bold">{daoData.category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-mono">Status:</span>
              <span className="text-green-400 font-bold capitalize">{daoData.status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-mono">Created:</span>
              <span className="text-white font-bold">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-mono">QUICK ACTIONS</h3>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-bold text-white flex items-center justify-center space-x-2 hover:from-cyan-600 hover:to-purple-700 transition-colors shadow-lg"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate(`/dao/${daoData.id}/manage/governance`)}
              className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg font-bold text-white flex items-center justify-center space-x-2 hover:bg-gray-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Create First Proposal</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate(`/dao/${daoData.id}/manage/staking`)}
                className="px-4 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors font-mono"
              >
                Setup Staking
              </button>
              <button
                onClick={() => navigate(`/dao/${daoData.id}/manage/treasury`)}
                className="px-4 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-mono"
              >
                Manage Treasury
              </button>
            </div>
          </div>

          {/* Share Section */}
          <div className="pt-6 border-t border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 font-mono">SHARE YOUR DAO</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={daoUrl}
                readOnly
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(daoUrl)}
                className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={shareOnTwitter}
                className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 font-mono">
              Share this link to invite members to your DAO
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LaunchSuccess;