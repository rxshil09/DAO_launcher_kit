import React, { useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignIn() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);

  const login = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: "https://identity.ic0.app",
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal().toText();
        setPrincipal(principal);
        setIsAuthenticated(true);
      },
    });
  };

  const logout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-[length:200%_200%] animate-gradient-x flex items-center justify-center px-4">
      <motion.div
        className="bg-white/10 backdrop-blur-xl text-white p-8 rounded-3xl shadow-2xl w-full max-w-xl border border-white/20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          🌐 Internet Identity Login
        </motion.h1>

        <AnimatePresence custom={isAuthenticated ? 1 : -1} mode="wait">
          {isAuthenticated ? (
            <motion.div
              key="logout"
              custom={1}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center"
            >
              <p className="mb-3 text-lg text-gray-300">You are logged in as:</p>
              <code className="bg-gray-900/80 text-green-400 p-2 rounded-lg font-mono break-all">
                {principal}
              </code>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="mt-6 w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-all font-semibold text-white shadow-lg shadow-red-500/30"
              >
                🔓 Logout
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              custom={-1}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center"
            >
              <p className="text-gray-300 mb-6">
                Click below to securely sign in using Internet Identity.
              </p>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 16px #3b82f6",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={login}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all font-semibold text-white shadow-lg shadow-blue-500/30"
              >
                🔐 Sign In with Internet Identity
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
