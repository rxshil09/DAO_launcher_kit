import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Shield,
  Zap,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
  Lock,
  Copy,
  Check,
} from "lucide-react";

const SITE_NAV_ID = "site-nav";        // <nav id="site-nav" ...>
const BASE_WIDTH = 520;                // design width the content looks best at
const MIN_PADDING = 24;                // breathing room around the scaled card
const MAX_SCALE_UP = 1.35;             // allow tasteful upscale on big displays

const SignIn = () => {
  const { isAuthenticated, principal, login, logout, loading } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  // ---- Layout refs for perfect-fit scaling ----
  const cardRef = useRef(null);      // the visual card to scale
  const measureRef = useRef(null);   // the inner content measured at scale 1

  const [navHeight, setNavHeight] = useState(64);
  const [scale, setScale] = useState(1);

  // Detect navbar height so the section sits JUST below it
  useLayoutEffect(() => {
    const readNav = () => {
      const nav = document.getElementById(SITE_NAV_ID);
      setNavHeight(nav?.offsetHeight || 64);
    };
    readNav();
    window.addEventListener("resize", readNav);
    return () => window.removeEventListener("resize", readNav);
  }, []);

  // Compute scale to fit the content exactly inside viewport (no scrollbars)
  useEffect(() => {
    if (!measureRef.current) return;

    const ro = new ResizeObserver(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight - navHeight;

      // available viewport inside this section (respect minimal padding)
      const availW = Math.max(vw - MIN_PADDING * 2, 300);
      const availH = Math.max(vh - MIN_PADDING * 2, 360);

      // natural (unscaled) content dimensions
      const el = measureRef.current;
      // Ensure we read the intrinsic size (treat the card as scale=1 for measuring)
      const naturalW = el.scrollWidth;
      const naturalH = el.scrollHeight;

      // Compute the scale required to contain the content fully without overflow,
      // and also avoid underflow (let it scale up, bounded by MAX_SCALE_UP)
      const neededScale = Math.min(availW / naturalW, availH / naturalH);
      const bounded = Math.max(0.5, Math.min(neededScale, MAX_SCALE_UP));
      setScale(bounded);
    });

    const observe = () => {
      if (measureRef.current) {
        ro.observe(measureRef.current);
      }
    };

    const handleResize = () => {
      ro.disconnect();
      observe();
    };

    observe();
    window.addEventListener("resize", handleResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [navHeight]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login();
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Failed to connect with Internet Identity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!principal) return;
    try {
      await navigator.clipboard.writeText(principal);
      setCopied(true);
      toast({ type: 'success', message: 'Principal ID copied to clipboard!' });
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      // Fallback for older browsers or permission issues
      const textArea = document.createElement('textarea');
      textArea.value = principal;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast({ type: 'success', message: 'Principal ID copied to clipboard!' });
        setTimeout(() => setCopied(false), 1200);
      } catch (err) {
        toast({ type: 'error', message: 'Failed to copy to clipboard' });
      }
      document.body.removeChild(textArea);
    }
  };

  const slideVariants = {
    initial: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: (d) => ({ x: d < 0 ? 300 : -300, opacity: 0, transition: { duration: 0.4 } }),
  };

  // ---------- Loading (no scrollbars) ----------
  if (loading) {
    return (
      <section
        style={{ height: `calc(100vh - ${navHeight}px)`, marginTop: navHeight }}
        className="relative w-full overflow-hidden bg-black text-white"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none" />
        <div className="relative h-full w-full flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mr-3" />
          <p className="text-cyan-400 font-mono">Initializing authentication...</p>
        </div>
      </section>
    );
  }

  return (
    <section
    style={{ position: "fixed", top: navHeight, left: 0, right: 0, bottom: 0 }}
    className="text-white overflow-hidden"
  >
  <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
      <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
        {/* Scale wrapper ensures perfect-fit */}
        <div
          ref={cardRef}
          style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
          className="relative"
        >
          {/* Measure the content at natural size (scale 1). We set a base width so typography wraps predictably */}
          <div ref={measureRef} style={{ width: BASE_WIDTH }}>
            <motion.div
              className="bg-gray-900/60 backdrop-blur-xl border border-cyan-500/30 text-white rounded-3xl shadow-2xl relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              {/* accents */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-t-3xl" />

              {/* CARD CONTENT — unchanged (plus copy button) */}
              <div className="relative z-10 p-6 sm:p-7">
                <motion.div className="text-center mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                    <Shield className="w-7 h-7 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full animate-ping opacity-20" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text mb-2 font-mono">
                    INTERNET IDENTITY
                  </h1>
                  <p className="text-cyan-400 text-sm font-mono flex items-center justify-center">
                    <Globe className="w-4 h-4 mr-1" />
                    {"›"} Secure blockchain authentication
                  </p>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
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
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25, type: "spring" }}>
                            <CheckCircle className="w-8 h-8 text-green-400" />
                          </motion.div>
                          <div className="absolute inset-0 bg-green-400/20 rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-semibold mb-2 font-mono">CONNECTION ESTABLISHED!</h2>
                        <p className="text-cyan-400 text-sm mb-3 font-mono">{"›"} Identity verified successfully</p>

                        <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-3 mb-4 flex items-center justify-between">
                          <div className="pr-2">
                            <p className="text-xs text-gray-400 mb-1 font-mono">PRINCIPAL ID</p>
                            <code className="text-cyan-400 font-mono text-xs break-all">{principal}</code>
                          </div>
                          <button
                            onClick={handleCopy}
                            className="ml-2 p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition"
                            title="Copy to clipboard"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-cyan-300" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0 }}
                          onClick={() => navigate("/dashboard")}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 transition-all font-semibold text-white shadow-lg flex items-center justify-center space-x-2 font-mono relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
                            "DISCONNECT IDENTITY"
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
                      <div className="space-y-3 mb-1">
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

                      <div className="text-center p-3 bg-gray-800/20 rounded-lg border border-cyan-500/20">
                        <Lock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                        <p className="text-cyan-200 text-sm font-mono">
                          {"›"} Connect securely using Internet Identity to access your DAO dashboard and participate in governance.
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0 }}
                        onClick={handleLogin}
                        disabled={isLoading || loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 transition-all font-semibold text-white shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2 font-mono relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
                        {"›"} By connecting, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      </div>

      {/* Centering layer; no scrollbars on this container either */}
    </section>
  );
};

export default SignIn;
