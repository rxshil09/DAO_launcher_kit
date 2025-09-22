import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BackgroundParticles from './BackgroundParticles';
import { Wallet, Shield, Zap, ArrowRight, Loader2, CheckCircle, AlertCircle, Globe, Lock } from 'lucide-react';

const SignIn = () => {
  const { isAuthenticated, principal, login, logout, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login();
      // Navigate to dashboard after successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error);
      setError('Failed to connect with Internet Identity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    initial: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.4 },
    }),
  };

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="bg-black text-white pt-16 min-h-screen">
        <BackgroundParticles />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-400 font-mono">Initializing authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white relative overflow-hidden pt-20 pb-10 min-h-screen">
      {/* Background Particles */}
      <BackgroundParticles />

      <div className="flex items-center justify-center px-4 z-10">
        <motion.div
          className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 text-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden my-8"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated border */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-t-3xl"></div>
          
          <div className="relative z-10">
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 relative">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text mb-2 font-mono">
                INTERNET IDENTITY
              </h1>
              <p className="text-cyan-400 text-sm font-mono flex items-center justify-center">
                <Globe className="w-4 h-4 mr-1" />
                {'>'} Secure blockchain authentication
              </p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center"
              >
                <AlertCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </motion.div>
            )}

            <AnimatePresence custom={isAuthenticated ? 1 : -1} mode="wait">
              {isAuthenticated ? (
                <motion.div
                  key="authenticated"
                  custom={1}
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-4"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </motion.div>
                      <div className="absolute inset-0 bg-green-400/20 rounded-full animate-pulse"></div>
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-2 font-mono">CONNECTION ESTABLISHED!</h2>
                    <p className="text-cyan-400 text-sm mb-3 font-mono">{'>'} Identity verified successfully</p>
                    
                    <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-400 mb-1 font-mono">PRINCIPAL ID</p>
                      <code className="text-cyan-400 font-mono text-xs break-all">
                        {principal}
                      </code>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0 }}
                      onClick={() => navigate('/dashboard')}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 transition-all font-semibold text-white shadow-lg flex items-center justify-center space-x-2 font-mono relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <span className="relative z-10">ENTER DAOVERSE</span>
                      <ArrowRight className="w-4 h-4 relative z-10" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0 }}
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all font-semibold text-red-300 disabled:opacity-50 font-mono"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          DISCONNECTING...
                        </div>
                      ) : (
                        'DISCONNECT IDENTITY'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="unauthenticated"
                  custom={-1}
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-4"
                >
                  {/* Enhanced Features */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-cyan-500/20">
                      <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-sm text-cyan-100 font-mono">End-to-end encryption</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-purple-500/20">
                      <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-sm text-cyan-100 font-mono">Lightning fast transactions</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-pink-500/20">
                      <Wallet className="w-4 h-4 text-pink-400 flex-shrink-0" />
                      <span className="text-sm text-cyan-100 font-mono">No seed phrases needed</span>
                    </div>
                  </div>

                  <div className="text-center mb-4 p-3 bg-gray-800/20 rounded-lg border border-cyan-500/20">
                    <Lock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                    <p className="text-cyan-200 text-sm font-mono">
                      {'>'} Connect securely using Internet Identity to access your DAO dashboard and participate in governance.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0 }}
                    onClick={handleLogin}
                    disabled={isLoading || loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 transition-all font-semibold text-white shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2 font-mono relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                        <span className="relative z-10">CONNECTING...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">CONNECT IDENTITY</span>
                      </>
                    )}
                  </motion.button>

                  <p className="text-xs text-center text-cyan-300 font-mono">
                    {'>'} By connecting, you agree to our Terms of Service and Privacy Policy
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
