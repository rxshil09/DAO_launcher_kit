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
  Loader2,
  AlertCircle,
  RefreshCw,
  Zap,
  Clock,
  Wallet,
  Shield
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
  const [userStats, setUserStats] = useState<{ stakedBalance: bigint; daoCount: number }>({ stakedBalance: 0n, daoCount: 0 });
  const [approvals, setApprovals] = useState<{ treasuryAmount: string; stakingAmount: string }>({ treasuryAmount: '', stakingAmount: '' });
  const [approving, setApproving] = useState<{ treasury: boolean; staking: boolean }>({ treasury: false, staking: false });
  const [ledgerError, setLedgerError] = useState<string>('');
  const [faucetState, setFaucetState] = useState<{
    canClaim: boolean;
    claiming: boolean;
    timeUntilNext: number | null;
    faucetInfo: { enabled: boolean; amount: bigint; cooldownHours: number } | null;
  }>({
    canClaim: false,
    claiming: false,
    timeUntilNext: null,
    faucetInfo: null
  });

  const categories = ['All', 'DeFi', 'Gaming', 'Social', 'NFT', 'Infrastructure'];

  const filteredDAOs = daos.filter(dao => {
    const matchesSearch = dao.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dao.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || dao.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const refreshUserStats = async () => {
    if (!actors || !principal) return;
    try {
      const principalObj = Principal.fromText(principal);
      
      // Fetch user's staked balance from staking canister
      let stakedBalance = 0n;
      if (actors.staking) {
        try {
          const stakes = await (actors.staking as any).getUserStakes(principalObj);
          // Sum up all active stakes
          stakedBalance = stakes.reduce((sum: bigint, stake: any) => {
            return sum + BigInt(stake.amount);
          }, 0n);
        } catch (e) {
          console.log('Could not fetch staked balance:', e);
        }
      }

      // Fetch number of DAOs user is member of from dao_backend
      let daoCount = 0;
      if (actors.daoBackend) {
        try {
          const portfolioStats = await (actors.daoBackend as any).getPortfolioStats(principalObj);
          daoCount = Number(portfolioStats.projects);
        } catch (e) {
          console.log('Could not fetch DAO count:', e);
        }
      }

      setUserStats({ stakedBalance, daoCount });
    } catch (e) {
      console.error('Failed to fetch user stats', e);
    }
  };

  const refreshFaucetState = async () => {
    if (!actors || !actors.treasury) return;
    try {
      const [canClaim, faucetInfo, timeUntilNext] = await Promise.all([
        (actors.treasury as any).canClaimFaucet().catch(() => ({ ok: false })),
        (actors.treasury as any).getFaucetInfo().catch(() => null),
        (actors.treasury as any).getTimeUntilNextClaim().catch(() => null)
      ]);
      
      setFaucetState({
        canClaim: canClaim?.ok || false,
        claiming: false,
        timeUntilNext: timeUntilNext && timeUntilNext.length > 0 ? Number(timeUntilNext[0]) : null,
        faucetInfo
      });
    } catch (e) {
      console.error('Failed to fetch faucet state', e);
    }
  };

  const claimFaucetTokens = async () => {
    if (!actors || !actors.treasury || !faucetState.canClaim) return;
    setFaucetState(s => ({ ...s, claiming: true }));
    setLedgerError('');
    try {
      const res = await (actors.treasury as any).requestTestTokens();
      if ('err' in res) {
        throw new Error(res.err);
      }
      // Refresh balances and faucet state
      await Promise.all([refreshBalances(), refreshFaucetState()]);
      setLedgerError('Successfully claimed 1000 DAO tokens!');
      setTimeout(() => setLedgerError(''), 3000);
    } catch (e: any) {
      console.error('Faucet claim failed:', e);
      setLedgerError(`Faucet claim failed: ${e.message}`);
    } finally {
      setFaucetState(s => ({ ...s, claiming: false }));
    }
  };

  const approveSpender = async (spenderKey: 'treasury' | 'staking') => {
    if (!actors || !actors.ledger) return;
    const amountStr = approvals[spenderKey + 'Amount' as keyof typeof approvals] as string;
    if (!amountStr) return;
    const amount = parseAmount(amountStr);
    
    // Validate amount against user balance
    const amountNum = parseFloat(amountStr);
    const userBalanceNum = parseFloat(fmt(balances.user));
    if (amountNum > userBalanceNum) {
      setLedgerError(`Cannot approve ${amountStr} tokens - you only have ${fmt(balances.user)} tokens available`);
      return;
    }
    if (amountNum <= 0) {
      setLedgerError('Amount must be greater than 0');
      return;
    }
    
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
        fee: [10_000n], // Approval fee (0.0001 tokens)
        memo: [],
        from_subaccount: [],
        created_at_time: [],
      });
      if ('Err' in res || 'err' in res) {
        const error = res.Err || res.err;
        throw new Error(`Approval failed: ${typeof error === 'object' ? Object.keys(error)[0] : error}`);
      }
      await refreshBalances();
      setLedgerError(''); // Clear any previous errors on success
    } catch (e: any) {
      console.error('Approve failed', e);
      setLedgerError(`Approve failed: ${e.message || e}`);
    } finally {
      setApproving((s) => ({ ...s, [spenderKey]: false }));
    }
  };

  useEffect(() => { 
    refreshBalances();
    refreshUserStats();
    refreshFaucetState();
  }, [actors, principal]);

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

        {/* Token Balances - User-Specific */}
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
            <div className="text-sm text-gray-400 font-mono mb-1">MY STAKED BALANCE</div>
            <div className="text-2xl font-bold">{fmt(userStats.stakedBalance)}</div>
          </div>
          <div className="bg-gray-900/50 border border-purple-500/30 p-4 rounded-xl">
            <div className="text-sm text-gray-400 font-mono mb-1">MY DAOs</div>
            <div className="text-2xl font-bold">{userStats.daoCount}</div>
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
            <p className="text-xs text-gray-400 mb-3">
              Approval allows treasury to spend tokens on your behalf. Only the approval fee (0.0001 tokens) is deducted now.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={approvals.treasuryAmount}
                onChange={(e) => setApprovals({ ...approvals, treasuryAmount: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono"
              />
              <button
                onClick={() => approveSpender('treasury')}
                disabled={approving.treasury}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 font-mono disabled:opacity-50"
              >
                {approving.treasury ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-blue-500/30 p-6 rounded-xl">
            <h3 className="text-white font-bold mb-3 font-mono">Approve Staking</h3>
            <p className="text-xs text-gray-400 mb-3">
              Approval allows staking to spend tokens on your behalf. Only the approval fee (0.0001 tokens) is deducted now.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={approvals.stakingAmount}
                onChange={(e) => setApprovals({ ...approvals, stakingAmount: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono"
              />
              <button
                onClick={() => approveSpender('staking')}
                disabled={approving.staking}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 font-mono disabled:opacity-50"
              >
                {approving.staking ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Faucet Section */}
        {faucetState.faucetInfo && faucetState.faucetInfo.enabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-500/50 p-6 rounded-xl backdrop-blur-sm mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold mb-2 font-mono flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400"/>
                  Test Token Faucet
                </h3>
                <p className="text-gray-300 font-mono text-sm mb-1">
                  Get {fmt(faucetState.faucetInfo.amount)} DAO tokens for testing
                </p>
                {!faucetState.canClaim && faucetState.timeUntilNext && faucetState.timeUntilNext > 0 && (
                  <p className="text-gray-400 font-mono text-xs flex items-center">
                    <Clock className="w-3 h-3 mr-1"/>
                    Next claim in: {Math.floor(faucetState.timeUntilNext / 3600)}h {Math.floor((faucetState.timeUntilNext % 3600) / 60)}m
                  </p>
                )}
              </div>
              <button
                onClick={claimFaucetTokens}
                disabled={!faucetState.canClaim || faucetState.claiming}
                className={`px-6 py-3 rounded-lg font-mono font-bold flex items-center space-x-2 transition-all ${
                  faucetState.canClaim && !faucetState.claiming
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {faucetState.claiming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Claiming...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>{faucetState.canClaim ? 'CLAIM TOKENS' : 'CLAIMED'}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {ledgerError && (
          <div className={`mb-8 p-3 rounded font-mono ${
            ledgerError.includes('Successfully') 
              ? 'bg-green-500/10 border border-green-500/30 text-green-300' 
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}>
            {ledgerError}
          </div>
        )}

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
