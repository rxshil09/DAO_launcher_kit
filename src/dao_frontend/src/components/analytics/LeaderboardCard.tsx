import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal, Award, Trophy } from 'lucide-react';

interface LeaderboardCardProps {
  rank: number;
  name: string;
  score: number;
  delay?: number;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  rank,
  name,
  score,
  delay = 0
}) => {
  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return Crown;
      case 2:
        return Trophy;
      case 3:
        return Medal;
      default:
        return Award;
    }
  };

  const getRankColor = () => {
    switch (rank) {
      case 1:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 2:
        return 'text-gray-300 bg-gray-500/20 border-gray-500/30';
      case 3:
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default:
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const RankIcon = getRankIcon();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, x: 4 }}
      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all group"
    >
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${getRankColor()}`}>
          {rank <= 3 ? (
            <RankIcon className="w-4 h-4" />
          ) : (
            <span className="text-sm font-bold font-mono">#{rank}</span>
          )}
        </div>
        <div>
          <p className="text-white font-semibold font-mono text-sm truncate max-w-24">
            {name.length > 12 ? `${name.slice(0, 12)}...` : name}
          </p>
          <p className="text-gray-400 text-xs font-mono">
            Score: {score.toFixed(1)}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <div className={`text-sm font-bold ${
          rank === 1 ? 'text-yellow-400' :
          rank === 2 ? 'text-gray-300' :
          rank === 3 ? 'text-orange-400' :
          'text-blue-400'
        }`}>
          #{rank}
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
    </motion.div>
  );
};

export default LeaderboardCard;