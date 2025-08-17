import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Lock,
} from 'lucide-react';
import { DAO } from '../../types/dao';
import { useTreasury } from '../../hooks/useTreasury';

const ManagementTreasury: React.FC = () => {
  const { dao } = useOutletContext<{ dao: DAO }>();
  const {
    deposit,
    withdraw,
    getBalance,
    getTreasuryStats,
    getRecentTransactions,
  } = useTreasury();

  const [balance, setBalance] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const bal = await getBalance();
      setBalance(bal);
      const s = await getTreasuryStats();
      setStats(s);
      const txs = await getRecentTransactions(5);
      const formatted = txs.map((tx: any) => {
        const isInflow =
          'deposit' in tx.transactionType || 'stakingReward' in tx.transactionType;
        return {
          id: Number(tx.id),
          type: isInflow ? 'inflow' : 'outflow',
          description: tx.description,
          amount: `${isInflow ? '+' : '-'}${tx.amount.toString()}`,
          timestamp: new Date(
            Number(tx.timestamp / BigInt(1_000_000))
          ).toLocaleString(),
          status: Object.keys(tx.status)[0],
        };
      });
      setRecentTransactions(formatted);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeposit = async () => {
    const amount = prompt('Enter deposit amount');
    if (!amount) return;
    const description = prompt('Enter description') || '';
    try {
      await deposit(amount, description);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleWithdraw = async () => {
    const recipient = prompt('Enter recipient principal');
    const amount = prompt('Enter withdrawal amount');
    if (!recipient || !amount) return;
    const description = prompt('Enter description') || '';
    try {
      await withdraw(recipient, amount, description);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const treasuryStats = [
    {
      label: 'Total Balance',
      value: balance ? balance.total.toString() : dao.treasury.balance,
      change: '+0%',
      trend: 'up',
      icon: Wallet,
      color: 'green',
    },
    {
      label: 'Total Deposits',
      value: stats ? stats.totalDeposits.toString() : dao.treasury.monthlyInflow,
      change: '+0%',
      trend: 'up',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      label: 'Available Funds',
      value: balance ? balance.available.toString() : '$0',
      change: '+0%',
      trend: 'down',
      icon: DollarSign,
      color: 'purple',
    },
    {
      label: 'Locked Funds',
      value: balance ? balance.locked.toString() : '$0',
      change: '+0%',
      trend: 'up',
      icon: Lock,
      color: 'orange',
    },
  ];

  const allocation = [
    { category: 'Development', percentage: 40, amount: '$340K', color: 'blue' },
    { category: 'Marketing', percentage: 25, amount: '$212K', color: 'green' },
    { category: 'Operations', percentage: 20, amount: '$170K', color: 'purple' },
    { category: 'Reserves', percentage: 15, amount: '$128K', color: 'orange' }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-500/30 text-blue-400';
      case 'green':
        return 'border-green-500/30 text-green-400';
      case 'purple':
        return 'border-purple-500/30 text-purple-400';
      case 'orange':
        return 'border-orange-500/30 text-orange-400';
      default:
        return 'border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 font-mono">TREASURY</h2>
          <p className="text-gray-400">
            Monitor and manage DAO financial resources
          </p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeposit}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-mono"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Deposit</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWithdraw}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-mono"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Withdraw</span>
          </motion.button>
        </div>
      </div>

      {/* Treasury Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {treasuryStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`bg-gray-800/50 border ${getColorClasses(stat.color)} p-6 rounded-xl backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-6 h-6 ${getColorClasses(stat.color).split(' ')[1]}`} />
              <div className={`flex items-center space-x-1 text-sm ${
                stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>{stat.change}</span>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400 font-mono">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white font-mono">RECENT TRANSACTIONS</h3>
              <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-mono">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/30"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'inflow' 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-red-500/20 border border-red-500/30'
                    }`}>
                      {transaction.type === 'inflow' ? (
                        <ArrowUpRight className={`w-5 h-5 ${transaction.type === 'inflow' ? 'text-green-400' : 'text-red-400'}`} />
                      ) : (
                        <ArrowDownLeft className={`w-5 h-5 ${transaction.type === 'inflow' ? 'text-green-400' : 'text-red-400'}`} />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{transaction.description}</p>
                      <p className="text-gray-400 text-sm font-mono">{transaction.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'inflow' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.amount}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">{transaction.status}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Treasury Allocation */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 font-mono">FUND ALLOCATION</h3>
            
            <div className="space-y-4">
              {allocation.map((item, index) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-mono">{item.category}</span>
                    <span className="text-white font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div 
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        item.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        item.color === 'green' ? 'from-green-500 to-green-600' :
                        item.color === 'purple' ? 'from-purple-500 to-purple-600' :
                        'from-orange-500 to-orange-600'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.2 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{item.amount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ManagementTreasury;