import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricsCounterProps {
  label: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
  format?: 'number' | 'currency' | 'percentage';
  delay?: number;
}

const MetricsCounter: React.FC<MetricsCounterProps> = ({
  label,
  value,
  change = 0,
  icon: Icon,
  color,
  format = 'number',
  delay = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
        setIsAnimating(false);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        if (val >= 1000000) {
          return `$${(val / 1000000).toFixed(1)}M`;
        } else if (val >= 1000) {
          return `$${(val / 1000).toFixed(1)}K`;
        }
        return `$${val.toFixed(0)}`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'border-blue-500/30 text-blue-400';
      case 'green':
        return 'border-green-500/30 text-green-400';
      case 'purple':
        return 'border-purple-500/30 text-purple-400';
      case 'orange':
        return 'border-orange-500/30 text-orange-400';
      case 'red':
        return 'border-red-500/30 text-red-400';
      case 'cyan':
        return 'border-cyan-500/30 text-cyan-400';
      default:
        return 'border-gray-500/30 text-gray-400';
    }
  };

  const getBackgroundGradient = () => {
    switch (color) {
      case 'blue':
        return 'from-blue-500/5 to-blue-600/5';
      case 'green':
        return 'from-green-500/5 to-green-600/5';
      case 'purple':
        return 'from-purple-500/5 to-purple-600/5';
      case 'orange':
        return 'from-orange-500/5 to-orange-600/5';
      case 'red':
        return 'from-red-500/5 to-red-600/5';
      case 'cyan':
        return 'from-cyan-500/5 to-cyan-600/5';
      default:
        return 'from-gray-500/5 to-gray-600/5';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: `0 20px 40px rgba(59, 130, 246, 0.15)`
      }}
      className={`bg-gray-900/50 border ${getColorClasses()} rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group`}
    >
      {/* Animated background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Icon className={`w-8 h-8 ${getColorClasses().split(' ')[1]}`} />
          {change !== 0 && (
            <div className={`flex items-center space-x-1 text-sm ${
              change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-mono">
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="mb-2">
          <motion.p 
            className="text-3xl font-bold text-white font-mono"
            animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {formatValue(displayValue)}
          </motion.p>
        </div>
        
        <p className="text-sm text-gray-400 font-mono uppercase tracking-wide">
          {label}
        </p>
      </div>

      {/* Pulse effect during animation */}
      {isAnimating && (
        <div className={`absolute inset-0 border-2 ${getColorClasses().split(' ')[0]} rounded-xl animate-pulse opacity-50`}></div>
      )}
    </motion.div>
  );
};

export default MetricsCounter;