import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

const Toast = React.forwardRef(({ type, message, onClose }, ref) => {
  useEffect(() => {
    const duration = type === 'error' ? 7000 : 5000; // Show errors longer
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, type]);

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
        return 'bg-green-800/60 border-green-500/30 text-green-200';
      case 'error':
        return 'bg-red-800/60 border-red-500/30 text-red-200';
      case 'warning':
        return 'bg-yellow-800/60 border-yellow-500/30 text-yellow-200';
      case 'info':
        return 'bg-blue-800/60 border-blue-500/30 text-blue-200';
      default:
        return 'bg-gray-800/60 border-gray-500/30 text-gray-200';
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
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={`relative p-4 rounded-lg border ${getToastStyles()} min-w-[300px] max-w-[400px] backdrop-blur-sm shadow-lg pointer-events-auto`}
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
  );
});

export default Toast;
