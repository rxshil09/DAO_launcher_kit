import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, type === 'error' ? 7000 : 5000); // Show errors longer

    return () => clearTimeout(timer);
  }, [onClose]);

  const variants = {
    initial: {
      opacity: 0,
      y: -20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  };

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return AlertCircle;
    }
  };

  const Icon = getIcon();

  return (
    <AnimatePresence>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${getToastStyles()} min-w-[300px] max-w-[400px] backdrop-blur-sm shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5" />
            <p className="font-mono text-sm leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-current hover:text-white transition-colors ml-4 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
