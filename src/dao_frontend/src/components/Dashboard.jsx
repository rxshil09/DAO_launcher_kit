import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useActors } from '../context/ActorContext';
import { Principal } from '@dfinity/principal';
import { 
  TrendingUp, 
  Wallet, 
  Users, 
  Star, 
  ArrowUpRight, 
  Filter,
  Search,
  Calendar,
  DollarSign,
  Target,
  Award,
  Clock,
  BarChart3,
  Plus,
  ExternalLink,
  Shield,
  Rocket,
  Zap,
  Globe,
  Settings,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { isAuthenticated, principal, loading } = useAuth();
  const actors = useActors();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [decimals, setDecimals] = useState(8);
  const [balances, setBalances] = useState({ user: 0n, treasury: 0n, staking: 0n });
  const [approvals, setApprovals] = useState({ treasuryAmount: '', stakingAmount: '' });
  const [ledgerError, setLedgerError] = useState('');
  const [approving, setApproving] = useState({ treasury: false, staking: false });

  const toAccount = (ownerText) => ({ owner: Principal.fromText(ownerText), subaccount: [] });
  const fmt = (amt) => {
    try {
      const d = typeof decimals === 'number' ? decimals : 8;
      const s = amt.toString();
      const pad = s.padStart(d + 1, '0');
      const intPart = pad.slice(0, -d);
      const frac = pad.slice(-d).replace(/0+$/, '');
      return frac ? `${intPart}.${frac}` : intPart;
    } catch {
      return '0';
    }
  };

  const refreshBalances = async () => {
    if (!actors || !actors.ledger) return;
    setLedgerError('');
    try {
      // decimals
      try {
        const d = await actors.ledger.icrc1_decimals();
        if (typeof d === 'number') setDecimals(d);
      } catch (_) {
        // fallback via metadata (optional)
        try {
          const md = await actors.ledger.icrc1_metadata();
          const dec = md.find(([k]) => k === 'icrc1:decimals');
          if (dec && Array.isArray(dec[1].Nat)) setDecimals(Number(dec[1].Nat));
        } catch (_) {}
      }

      const userOwner = toAccount(principal);
      const treasuryId = import.meta.env.VITE_CANISTER_ID_TREASURY;
      const stakingId = import.meta.env.VITE_CANISTER_ID_STAKING;
      const [u, t, s] = await Promise.all([
        actors.ledger.icrc1_balance_of(userOwner),
        treasuryId ? actors.ledger.icrc1_balance_of(toAccount(treasuryId)) : Promise.resolve(0n),
        stakingId ? actors.ledger.icrc1_balance_of(toAccount(stakingId)) : Promise.resolve(0n)
      ]);
      setBalances({ user: BigInt(u), treasury: BigInt(t), staking: BigInt(s) });
    } catch (e) {
      console.error('Failed to fetch balances', e);
      setLedgerError('Failed to load token balances');
    }
  };

  const parseAmount = (s) => {
    if (!s) return 0n;
    const d = typeof decimals === 'number' ? decimals : 8;
    const [i, f = ''] = String(s).split('.');
    const frac = (f + '0'.repeat(d)).slice(0, d);
    return BigInt(i || '0') * BigInt(10) ** BigInt(d) + BigInt(frac || '0');
  };

  const approveSpender = async (spenderKey) => {
    if (!actors || !actors.ledger) return;
    const amountStr = approvals[spenderKey + 'Amount'];
    if (!amountStr) return;
    const amount = parseAmount(amountStr);
    const spenderId = import.meta.env[`VITE_CANISTER_ID_${spenderKey.toUpperCase()}`];
    if (!spenderId) { setLedgerError(`Missing canister id for ${spenderKey}`); return; }
    setApproving((s) => ({ ...s, [spenderKey]: true }));
    setLedgerError('');
    try {
      const res = await actors.ledger.icrc2_approve({
        spender: { owner: Principal.fromText(spenderId), subaccount: [] },
        amount,
        expires_at: [],
        expected_allowance: [],
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
      });
      if ('err' in res) throw new Error(JSON.stringify(res.err));
      await refreshBalances();
    } catch (e) {
      console.error('Approve failed', e);
      setLedgerError(`Approve failed: ${e.message || e}`);
    } finally {
      setApproving((s) => ({ ...s, [spenderKey]: false }));
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (actors && principal) {
      refreshBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actors, principal]);

  const connectWallet = async () => {
    // Simulate wallet connection
    setWalletConnected(true);
    // In a real app, you would integrate with actual wallet providers
  };

  const categories = ['All', 'DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Social'];

  const projects = [
    {
      id: 1,
      name: 'DeepFinance Protocol',
      category: 'DeFi',
      description: 'Revolutionary cross-chain lending protocol with automated yield optimization',
      raised: '$4.2M',
      target: '$8M',
      participants: 2847,
      progress: 52,
      apy: '24.5%',
      status: 'Live',
      timeLeft: '12 days',
      rating: 4.8,
      tags: ['Cross-chain', 'Yield', 'Lending']
    },
    {
      id: 2,
      name: 'MetaVerse Studios',
      category: 'Gaming',
      description: 'Community-owned gaming ecosystem with Play-to-Earn mechanics',
      raised: '$6.8M',
      target: '$10M',
      participants: 4521,
      progress: 68,
      apy: '18.2%',
      status: 'Live',
      timeLeft: '8 days',
      rating: 4.6,
      tags: ['P2E', 'Metaverse', 'NFT']
    },
    {
      id: 3,
      name: 'ArtChain Marketplace',
      category: 'NFT',
      description: 'Next-generation NFT marketplace with AI-powered discovery',
      raised: '$2.1M',
      target: '$5M',
      participants: 1683,
      progress: 42,
      apy: '31.7%',
      status: 'Live',
      timeLeft: '15 days',
      rating: 4.9,
      tags: ['AI', 'Marketplace', 'Art']
    },
    {
      id: 4,
      name: 'SocialDAO Network',
      category: 'Social',
      description: 'Decentralized social media platform with creator monetization',
      raised: '$1.5M',
      target: '$3M',
      participants: 892,
      progress: 50,
      apy: '22.1%',
      status: 'Upcoming',
      timeLeft: '3 days',
      rating: 4.4,
      tags: ['Social', 'Creator Economy', 'DAO']
    },
    {
      id: 5,
      name: 'ZKScale Infrastructure',
      category: 'Infrastructure',
      description: 'Zero-knowledge scaling solution for next-gen applications',
      raised: '$8.9M',
      target: '$12M',
      participants: 3247,
      progress: 74,
      apy: '16.8%',
      status: 'Live',
      timeLeft: '21 days',
      rating: 4.7,
      tags: ['ZK', 'Scaling', 'Infrastructure']
    },
    {
      id: 6,
      name: 'GreenEnergy DAO',
      category: 'DeFi',
      description: 'Sustainable energy financing through decentralized carbon credits',
      raised: '$3.7M',
      target: '$6M',
      participants: 1456,
      progress: 62,
      apy: '19.3%',
      status: 'Live',
      timeLeft: '18 days',
      rating: 4.5,
      tags: ['Green', 'Carbon', 'Sustainability']
    }
  ];

  const portfolioStats = [
    { label: 'My Token Balance', value: fmt(balances.user), change: '', trend: 'up' },
    { label: 'Treasury Balance', value: fmt(balances.treasury), change: '', trend: 'up' },
    { label: 'Staking Balance', value: fmt(balances.staking), change: '', trend: 'up' },
    { label: 'Decimals', value: String(decimals), change: '', trend: 'up' }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-400 font-mono">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Background Particles */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24 sm:pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-mono">
                WELCOME TO DAOVERSE! 🚀
              </h1>
              <p className="text-cyan-400 font-mono">
                {'>'} Principal: {principal?.slice(0, 12)}...{principal?.slice(-8)}
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {!walletConnected ? (
                <button 
                  onClick={connectWallet}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all font-mono"
                >
                  <Wallet className="w-4 h-4" />
                  <span>CONNECT WALLET</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg font-mono">
                  <Shield className="w-4 h-4" />
                  <span>WALLET CONNECTED</span>
                </div>
              )}
              <button 
                onClick={() => navigate('/launch')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-mono"
              >
                <Rocket className="w-4 h-4" />
                <span>LAUNCH DAO</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-gray-700 transition-colors font-mono">
                <Plus className="w-4 h-4" />
                <span>ADD FUNDS</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Ledger Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-gray-900/50 border border-cyan-500/30 p-6 rounded-xl backdrop-blur-sm">
            <h3 className="text-white font-bold mb-4 font-mono flex items-center"><Wallet className="w-4 h-4 mr-2"/>Approve Treasury</h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                placeholder="Amount"
                value={approvals.treasuryAmount}
                onChange={(e) => setApprovals({ ...approvals, treasuryAmount: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono"
              />
              <button
                onClick={() => approveSpender('treasury')}
                disabled={approving.treasury}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 font-mono"
              >
                {approving.treasury ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-cyan-500/30 p-6 rounded-xl backdrop-blur-sm">
            <h3 className="text-white font-bold mb-4 font-mono flex items-center"><Shield className="w-4 h-4 mr-2"/>Approve Staking</h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                placeholder="Amount"
                value={approvals.stakingAmount}
                onChange={(e) => setApprovals({ ...approvals, stakingAmount: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono"
              />
              <button
                onClick={() => approveSpender('staking')}
                disabled={approving.staking}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 font-mono"
              >
                {approving.staking ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </motion.div>
        {ledgerError && (
          <div className="mb-8 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-300 font-mono">{ledgerError}</div>
        )}

        {/* Portfolio Stats - INSTANT HOVER SCALING */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {portfolioStats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="bg-gray-900/50 border border-cyan-500/30 p-6 rounded-xl backdrop-blur-sm relative overflow-hidden group"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(6, 182, 212, 0.2)"
              }}
              transition={{ duration: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm text-gray-400 mb-1 font-mono">{stat.label}</p>
                  <p className="text-2xl font-bold text-white font-mono">{stat.value}</p>
                </div>
                <div className={`flex items-center space-x-1 text-sm font-mono ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <span>{stat.change}</span>
                  <ArrowUpRight className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 border border-cyan-500/30 p-6 rounded-xl backdrop-blur-sm mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors font-mono ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
              />
            </div>
          </div>
        </motion.div>

        {/* Projects Grid - INSTANT HOVER SCALING */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ 
                scale: 1.02, 
                y: -5,
                boxShadow: "0 25px 50px rgba(139, 92, 246, 0.2)"
              }}
              className="bg-gray-900/50 border border-purple-500/30 rounded-xl backdrop-blur-sm overflow-hidden hover:border-purple-400/50 transition-all group relative"
            >
              {/* Project Header */}
              <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium font-mono ${
                    project.status === 'Live' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm font-medium font-mono">{project.rating}</span>
                </div>
                
                {/* Floating Icons */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="w-16 h-16 bg-gradient-to-r from-cyan-400/30 to-purple-500/30 rounded-full flex items-center justify-center backdrop-blur-sm"
                  >
                    {project.category === 'DeFi' && <DollarSign className="w-8 h-8 text-cyan-400" />}
                    {project.category === 'Gaming' && <Target className="w-8 h-8 text-purple-400" />}
                    {project.category === 'NFT' && <Award className="w-8 h-8 text-pink-400" />}
                    {project.category === 'Social' && <Users className="w-8 h-8 text-green-400" />}
                    {project.category === 'Infrastructure' && <Settings className="w-8 h-8 text-blue-400" />}
                  </motion.div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors font-mono">
                    {project.name}
                  </h3>
                  <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded font-mono">
                    {project.category}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-md border border-cyan-500/30 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-gray-400">PROGRESS</span>
                    <span className="font-medium text-cyan-400">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    ></motion.div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                    <div>
                      <p className="text-gray-400">RAISED</p>
                      <p className="font-semibold text-green-400">{project.raised}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">TARGET</p>
                      <p className="font-semibold text-white">{project.target}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                    <div>
                      <p className="text-gray-400">APY</p>
                      <p className="font-semibold text-green-400">{project.apy}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">TIME LEFT</p>
                      <p className="font-semibold text-orange-400">{project.timeLeft}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm font-mono">
                    <span className="text-gray-400">PARTICIPANTS</span>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-purple-400">{project.participants.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0 }}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all text-sm font-medium font-mono"
                  >
                    INVEST NOW
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0 }}
                    className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm font-mono"
                  >
                    DETAILS
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2 font-mono">NO PROJECTS FOUND</h3>
            <p className="text-gray-400 font-mono">{'>'} Try adjusting your filters or search terms</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
