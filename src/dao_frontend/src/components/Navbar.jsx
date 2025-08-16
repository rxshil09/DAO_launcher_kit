import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useDAO } from '../context/DAOContext';
import { 
  Wallet, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Rocket, 
  Settings, 
  Bell,
  ChevronDown,
  Shield,
  Zap,
  TrendingUp,
  Copy,
  ExternalLink,
  Activity,
  DollarSign,
  Award,
  Star,
  Globe,
  Sparkles,
  Image,
  BarChart3,
} from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, principal, userSettings } = useAuth();
  const { hasActiveDAO, activeDAO } = useDAO();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationCount] = useState(3);

  // Base navigation items (always visible)
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Activity },
    { name: 'Launch DAO', href: '/launch', icon: Rocket },
    { name: 'Explore', href: '/explore', icon: Globe },
  ];

  // Use only base navigation - DAO management is handled through dashboard
  const navigation = baseNavigation;

  const isActive = (path) => location.pathname === path;

  const copyPrincipal = () => {
    navigator.clipboard.writeText(principal);
    // You could add a toast notification here
  };

  const userStats = {
    totalInvested: '$12,450',
    activeProjects: 8,
    totalReturns: '+24.5%',
    daoTokens: '1,247'
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl border-b border-cyan-500/20 fixed top-0 left-0 right-0 z-50 shadow-lg shadow-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-20">
            {/* Enhanced Logo - Responsive */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0 }}
                >
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 relative overflow-hidden">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-lg sm:rounded-xl"
                    />
                    <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white relative z-10" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-transparent bg-clip-text font-mono">
                    DAOVerse
                  </span>
                  <span className="text-xs text-cyan-400/70 font-mono -mt-1 hidden sm:block">
                    {'>'} Decentralized Future
                  </span>
                </div>
              </Link>
            </div>

            {/* Active DAO Display & Selector */}
            {hasActiveDAO && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">
                  {activeDAO?.name || 'Active DAO'}
                </span>
              </div>
            )}

            {/* Enhanced Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    isActive(item.href)
                      ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                      : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                  <span className="lg:hidden">{item.name.split(' ')[0]}</span>
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Enhanced User Actions - Responsive */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 lg:space-x-4">
                  {/* Notifications - Responsive */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0 }}
                    className="relative p-2 lg:p-3 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 rounded-xl transition-all border border-transparent hover:border-gray-700/50"
                  >
                    <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                    {notificationCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-xs font-bold text-white">{notificationCount}</span>
                      </motion.div>
                    )}
                  </motion.button>

                  {/* Enhanced Profile Dropdown - Responsive */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0 }}
                      className="flex items-center space-x-2 lg:space-x-3 px-2 lg:px-4 py-2 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-cyan-500/30 rounded-xl hover:border-cyan-400/50 transition-all shadow-lg backdrop-blur-sm"
                    >
                      <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                      </div>
                      <div className="hidden lg:flex flex-col items-start">
                        <span className="text-sm font-medium text-white truncate max-w-24">
                          {userSettings.displayName}
                        </span>
                        <span className="text-xs text-cyan-400 font-mono">Connected</span>
                      </div>
                      <ChevronDown className={`w-3 h-3 lg:w-4 lg:h-4 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    {/* Enhanced Profile Dropdown Menu - Responsive */}
                    <AnimatePresence>
                      {profileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-72 lg:w-80 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden z-50"
                        >
                          {/* Profile Header */}
                          <div className="p-4 lg:p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-gray-700/50">
                            <div className="flex items-center space-x-3 lg:space-x-4">
                              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                <User className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base lg:text-lg font-bold text-white font-mono truncate">{userSettings.displayName}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  <code className="text-xs lg:text-sm text-cyan-400 font-mono bg-gray-800/50 px-2 py-1 rounded truncate">
                                    {principal?.slice(0, 8)}...{principal?.slice(-6)}
                                  </code>
                                  <button
                                    onClick={copyPrincipal}
                                    className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                                  >
                                    <Copy className="w-3 h-3 lg:w-4 lg:h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* User Stats - Responsive Grid */}
                          <div className="p-3 lg:p-4 border-b border-gray-700/50">
                            <h4 className="text-xs lg:text-sm font-semibold text-gray-400 mb-2 lg:mb-3 font-mono">PORTFOLIO OVERVIEW</h4>
                            <div className="grid grid-cols-2 gap-2 lg:gap-3">
                              <div className="bg-gray-800/50 rounded-lg p-2 lg:p-3 border border-gray-700/30">
                                <div className="flex items-center space-x-1 lg:space-x-2 mb-1">
                                  <DollarSign className="w-3 h-3 lg:w-4 lg:h-4 text-green-400" />
                                  <span className="text-xs text-gray-400 font-mono">INVESTED</span>
                                </div>
                                <p className="text-sm lg:text-lg font-bold text-white">{userStats.totalInvested}</p>
                              </div>
                              <div className="bg-gray-800/50 rounded-lg p-2 lg:p-3 border border-gray-700/30">
                                <div className="flex items-center space-x-1 lg:space-x-2 mb-1">
                                  <Activity className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400" />
                                  <span className="text-xs text-gray-400 font-mono">PROJECTS</span>
                                </div>
                                <p className="text-sm lg:text-lg font-bold text-white">{userStats.activeProjects}</p>
                              </div>
                              <div className="bg-gray-800/50 rounded-lg p-2 lg:p-3 border border-gray-700/30">
                                <div className="flex items-center space-x-1 lg:space-x-2 mb-1">
                                  <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-green-400" />
                                  <span className="text-xs text-gray-400 font-mono">RETURNS</span>
                                </div>
                                <p className="text-sm lg:text-lg font-bold text-green-400">{userStats.totalReturns}</p>
                              </div>
                              <div className="bg-gray-800/50 rounded-lg p-2 lg:p-3 border border-gray-700/30">
                                <div className="flex items-center space-x-1 lg:space-x-2 mb-1">
                                  <Award className="w-3 h-3 lg:w-4 lg:h-4 text-purple-400" />
                                  <span className="text-xs text-gray-400 font-mono">TOKENS</span>
                                </div>
                                <p className="text-sm lg:text-lg font-bold text-white">{userStats.daoTokens}</p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            <Link
                              to="/dashboard"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 rounded-lg transition-all group"
                            >
                              <Activity className="w-4 h-4 lg:w-5 lg:h-5" />
                              <span className="font-medium">Dashboard</span>
                              <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                            </Link>
                            
                            <Link
                              to="/settings"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 rounded-lg transition-all w-full group"
                            >
                              <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
                              <span className="font-medium">Settings</span>
                              <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                            </Link>

                            <button className="flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 rounded-lg transition-all w-full group">
                              <Shield className="w-4 h-4 lg:w-5 lg:h-5" />
                              <span className="font-medium">Security</span>
                              <Star className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400 ml-auto" />
                            </button>

                            <div className="border-t border-gray-700/50 my-2"></div>

                            <button
                              onClick={() => {
                                logout();
                                setProfileDropdownOpen(false);
                              }}
                              className="flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all w-full group"
                            >
                              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                              <span className="font-medium">Disconnect</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <Link
                  to="/signin"
                  className="group relative px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-cyan-500/25 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Wallet className="w-4 h-4 lg:w-5 lg:h-5 relative z-10" />
                  <span className="font-semibold relative z-10 hidden sm:inline">Connect Wallet</span>
                  <span className="font-semibold relative z-10 sm:hidden">Connect</span>
                </Link>
              )}
            </div>

            {/* Enhanced Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {isAuthenticated && (
                <button className="relative p-2 text-gray-400 hover:text-cyan-400 transition-colors">
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{notificationCount}</span>
                    </div>
                  )}
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 rounded-lg transition-all"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile menu - OVERLAY INSTEAD OF PUSHING CONTENT */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-cyan-500/20 shadow-lg"
            >
              <div className="px-4 pt-4 pb-6 space-y-3">
                {/* Mobile Navigation Links */}
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive(item.href)
                        ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                        : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 border border-transparent'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {/* Mobile User Section */}
                {isAuthenticated ? (
                  <div className="border-t border-gray-700/50 pt-4 mt-4">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700/30 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {userSettings.displayName}
                        </div>
                        <div className="text-xs text-cyan-400 font-mono">Connected</div>
                      </div>
                      <button
                        onClick={copyPrincipal}
                        className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile Stats - 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                        <div className="text-xs text-gray-400 font-mono mb-1">INVESTED</div>
                        <div className="text-base font-bold text-white">{userStats.totalInvested}</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                        <div className="text-xs text-gray-400 font-mono mb-1">RETURNS</div>
                        <div className="text-base font-bold text-green-400">{userStats.totalReturns}</div>
                      </div>
                    </div>

                    {/* Mobile Settings Link */}
                    <Link
                      to="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 rounded-xl transition-all mb-2"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Disconnect</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg"
                  >
                    <Wallet className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Backdrop for profile dropdown */}
      {profileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
