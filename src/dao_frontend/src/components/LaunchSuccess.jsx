import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LaunchSuccess = ({ daoData, onClose }) => {
  const navigate = useNavigate();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-mono">
            DAO Successfully Launched! 🚀
          </h2>
          <p className="text-gray-400">
            Your DAO has been created and is ready to go
          </p>
        </div>

        <div className="space-y-6">
          {/* DAO Details */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-mono">Name:</span>
              <span className="text-white font-bold">{daoData.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-mono">Members:</span>
              <span className="text-white font-bold">{daoData.stats.totalMembers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-mono">Treasury:</span>
              <span className="text-white font-bold">{daoData.stats.treasuryBalance} tokens</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-bold text-white flex items-center justify-center space-x-2 hover:from-cyan-600 hover:to-purple-700 transition-colors"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/proposals/create')}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg font-bold text-white flex items-center justify-center space-x-2 hover:bg-gray-700 transition-colors"
            >
              <span>Create First Proposal</span>
            </button>
          </div>

          {/* Share Section */}
          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-lg font-bold text-white mb-3 font-mono">Share Your DAO</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={window.location.origin + '/dao/' + daoData.name.toLowerCase()}
                readOnly
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
              <button
                onClick={() => copyToClipboard(window.location.origin + '/dao/' + daoData.name.toLowerCase())}
                className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={window.location.origin + '/dao/' + daoData.name.toLowerCase()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LaunchSuccess;
