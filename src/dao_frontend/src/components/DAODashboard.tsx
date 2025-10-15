import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDAOManagement } from '../context/DAOManagementContext';
import { useActors } from '../context/ActorContext';
import { useToast } from '../context/ToastContext';
import { Principal } from '@dfinity/principal';
import DAOCard from './DAOCard';
import { 
  Plus, 
  Search, 
  Filter, 
  Rocket,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const DAODashboard: React.FC = () => {
  const { isAuthenticated, principal, loading: authLoading } = useAuth();
  const { daos, loading, error, fetchDAOs } = useDAOManagement();
  const actors = useActors();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // Ledger balances + approvals
  const [decimals, setDecimals] = useState<number>(8);
  const [balances, setBalances] = useState<{ user: bigint; treasury: bigint; staking: bigint }>({ user: 0n, treasury: 0n, staking: 0n });
  const [approvals, setApprovals] = useState<{ treasuryAmount: string; stakingAmount: string }>({ treasuryAmount: '', stakingAmount: '' });
  const [approving, setApproving] = useState<{ treasury: boolean; staking: boolean }>({ treasury: false, staking: false });
  const [ledgerError, setLedgerError] = useState<string>('');

  const categories = ['All', 'DeFi', 'Gaming', 'Social', 'NFT', 'Infrastructure'];

  const filteredDAOs = daos.filter(dao => {
    const matchesSearch = dao.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dao.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || dao.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalStats = {
    totalDAOs: daos.length,
    totalMembers: daos.reduce((sum, dao) => sum + dao.memberCount, 0),
    totalTVL: daos.reduce((sum, dao) => {
      const value = parseFloat(dao.totalValueLocked.replace(/[$M,K]/g, ''));
      const multiplier = dao.totalValueLocked.includes('M') ? 1000000 : 
                        dao.totalValueLocked.includes('K') ? 1000 : 1;
      return sum + (value * multiplier);
    }, 0),
    activeProposals: daos.reduce((sum, dao) => sum + dao.governance.activeProposals, 0)
  };

  const formatTVL = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  // Redirect to signin if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Auto-refresh DAOs when component mounts or when returning from DAO creation
  React.useEffect(() => {
    if (isAuthenticated && principal) {
      fetchDAOs();
    }
  }, [isAuthenticated, principal]);

  // Helpers for ledger ops
  const toAccount = (ownerText: string) => ({ owner: Principal.fromText(ownerText), subaccount: [] as [] });
  const fmt = (amt: bigint) => {
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
  const parseAmount = (s: string) => {
    if (!s) return 0n;
    const d = typeof decimals === 'number' ? decimals : 8;
    const [i, f = ''] = String(s).split('.');
    const frac = (f + '0'.repeat(d)).slice(0, d);
    return BigInt(i || '0') * (10n ** BigInt(d)) + BigInt(frac || '0');
  };

  const refreshBalances = async () => {
    if (!actors || !actors.ledger || !principal) return;
    setLedgerError('');
    try {
      try {
        const d = await (actors.ledger as any).icrc1_decimals();
        if (typeof d === 'number') setDecimals(d);
      } catch (_) {}

      const userOwner = toAccount(principal);
      const TREAS = (import.meta as any).env.VITE_CANISTER_ID_TREASURY as string | undefined;
      const STAKE = (import.meta as any).env.VITE_CANISTER_ID_STAKING as string | undefined;
      const [u, t, s] = await Promise.all([
        (actors.ledger as any).icrc1_balance_of(userOwner),
        TREAS ? (actors.ledger as any).icrc1_balance_of(toAccount(TREAS)) : Promise.resolve(0n),
        STAKE ? (actors.ledger as any).icrc1_balance_of(toAccount(STAKE)) : Promise.resolve(0n),
      ]);
      setBalances({ user: BigInt(u), treasury: BigInt(t), staking: BigInt(s) });
    } catch (e: any) {
      console.error('Failed to fetch balances', e);
      setLedgerError('Failed to load token balances');
    }
  };

  const approveSpender = async (spenderKey: 'treasury' | 'staking') => {
    if (!actors || !actors.ledger) return;
    const amountStr = approvals[spenderKey + 'Amount' as keyof typeof approvals] as string;
    if (!amountStr) return;
    const amount = parseAmount(amountStr);
    const spenderId = (import.meta as any).env[`VITE_CANISTER_ID_${spenderKey.toUpperCase()}`] as string | undefined;
    if (!spenderId) { setLedgerError(`Missing canister id for ${spenderKey}`); return; }
    setApproving((s) => ({ ...s, [spenderKey]: true }));
    setLedgerError('');
    try {
      const res = await (actors.ledger as any).icrc2_approve({
        spender: { owner: Principal.fromText(spenderId), subaccount: [] },
        amount,
        expires_at: [],
        expected_allowance: [],
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
      });
      if ('Err' in res || 'err' in res) throw new Error(JSON.stringify(res));
      await refreshBalances();
    } catch (e: any) {
      console.error('Approve failed', e);
      setLedgerError(`Approve failed: ${e.message || e}`);
    } finally {
      setApproving((s) => ({ ...s, [spenderKey]: false }));
    }
  };

  useEffect(() => { refreshBalances(); }, [actors, principal]);

  // Listen for storage changes to update DAOs when created in other tabs
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `user_daos_${principal}` && e.newValue) {
        fetchDAOs();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [principal, fetchDAOs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDAOs();
      toast({ type: 'success', message: 'DAOs refreshed successfully!' });
    } catch (err) {
      toast({ type: 'error', message: 'Failed to refresh DAOs' });
    } finally {
      setRefreshing(false);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    toast({ type, message });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-blue-400 font-mono">Loading your DAOs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      
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
                MY DAO PORTFOLIO
              </h1>
              <p className="text-blue-400 font-mono">
                {'>'} Manage your decentralized organizations
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <motion.button
                onClick={handleRefresh}
                disabled={refreshing}
                whileHover={{ scale: refreshing ? 1 : 1.05 }}
                whileTap={{ scale: refreshing ? 1 : 0.95 }}
                className="flex items-center space-x-2 px-4 py-3 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-all font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/launch')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Launch New DAO</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Token Balances */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-gray-900/50 border border-blue-500/30 p-4 rounded-xl">
            <div className="text-sm text-gray-400 font-mono mb-1">MY TOKEN BALANCE</div>
            <div className="text-2xl font-bold">{fmt(balances.user)}</div>
          </div>
          <div className="bg-gray-900/50 border border-green-500/30 p-4 rounded-xl">
            <div className="text-sm text-gray-400 font-mono mb-1">TREASURY BALANCE</div>
            <div className="text-2xl font-bold">{fmt(balances.treasury)}</div>
          </div>
          <div className="bg-gray-900/50 border border-purple-500/30 p-4 rounded-xl">
            <div className="text-sm text-gray-400 font-mono mb-1">STAKING BALANCE</div>
            <div className="text-2xl font-bold">{fmt(balances.staking)}</div>
          </div>
        </motion.div>

        {/* Ledger Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-gray-900/50 border border-blue-500/30 p-6 rounded-xl">
            <h3 className="text-white font-bold mb-3 font-mono">Approve Treasury</h3>
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
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 font-mono"
              >
                {approving.treasury ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-blue-500/30 p-6 rounded-xl">
            <h3 className="text-white font-bold mb-3 font-mono">Approve Staking</h3>
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
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 font-mono"
              >
                {approving.staking ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </motion.div>
        {ledgerError && (
          <div className="mb-8 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-300 font-mono">{ledgerError}</div>
        )}


        {/* Portfolio Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gray-900/50 border border-blue-500/30 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400 font-mono">TOTAL DAOS</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.totalDAOs}</p>
          </div>
          
          <div className="bg-gray-900/50 border border-green-500/30 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400 font-mono">MEMBERS</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.totalMembers.toLocaleString()}</p>
          </div>
          
          <div className="bg-gray-900/50 border border-purple-500/30 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400 font-mono">TOTAL TVL</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatTVL(totalStats.totalTVL)}</p>
          </div>
          
          <div className="bg-gray-900/50 border border-orange-500/30 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-gray-400 font-mono">PROPOSALS</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.activeProposals}</p>
          </div>
        </motion.div>

        {/* Filters and Search */}
        {daos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 border border-gray-700/50 p-6 rounded-xl backdrop-blur-sm mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors font-mono ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
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
                  placeholder="Search DAOs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-mono"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 mb-8 flex items-center"
          >
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400">{error}</span>
          </motion.div>
        )}

        {/* DAO Cards Grid */}
        {filteredDAOs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDAOs.map((dao, index) => (
              <DAOCard key={dao.id} dao={dao} index={index} />
            ))}
          </motion.div>
        ) : daos.length === 0 ? (
          /* Empty State - No DAOs */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Rocket className="w-12 h-12 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 font-mono">
              READY TO LAUNCH YOUR FIRST DAO?
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              Create your decentralized autonomous organization and start building the future of governance.
            </p>
            <motion.button
              onClick={() => navigate('/launch')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold shadow-lg"
            >
              <Rocket className="w-5 h-5" />
              <span>Launch Your First DAO</span>
            </motion.button>
          </motion.div>
        ) : (
          /* No Results State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2 font-mono">NO DAOS FOUND</h3>
            <p className="text-gray-400 font-mono">{'>'} Try adjusting your filters or search terms</p>
            <motion.button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 px-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors font-mono"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}
      </div>

    </div>
  );
};

export default DAODashboard;
