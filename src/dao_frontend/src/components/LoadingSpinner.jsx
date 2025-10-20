import React from 'react';
import { motion } from 'framer-motion';

/**
 * Subtle Loading Spinner Component
 * 
 * A modern, minimal loading animation shown during async operations
 * Uses Framer Motion for smooth animations
 */
const LoadingSpinner = ({ size = 'medium', text = 'Loading...', fullScreen = false }) => {
  const sizes = {
    small: { spinner: 20, text: 'text-sm' },
    medium: { spinner: 40, text: 'text-base' },
    large: { spinner: 60, text: 'text-lg' }
  };

  const spinnerSize = sizes[size].spinner;
  const textSize = sizes[size].text;

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated spinner */}
      <motion.div
        className="relative"
        style={{
          width: spinnerSize,
          height: spinnerSize,
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: '3px solid rgba(99, 102, 241, 0.1)',
            borderTopColor: 'rgb(99, 102, 241)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </motion.div>
      
      {/* Loading text with pulse animation */}
      {text && (
        <motion.p
          className={`${textSize} text-gray-700 dark:text-gray-300 font-medium`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {spinnerContent}
      </motion.div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
