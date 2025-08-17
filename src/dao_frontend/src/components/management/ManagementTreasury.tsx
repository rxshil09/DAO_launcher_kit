import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  BarChart3,
  Wallet,
  Lock,
  Shield,
  Plus,
  X
} from 'lucide-react';
import { DAO } from '../../types/dao';
import { useTreasury } from '../../hooks/useTreasury';

const ManagementTreasury: React.FC = () => {
  const { dao } = useOutletContext<{ dao: DAO }>();
  const {
    getAuthorizedPrincipals,
    addAuthorizedPrincipal,
    removeAuthorizedPrincipal,
    loading,
    error
  } = useTreasury();

  const [principals, setPrincipals] = useState<string[]>([]);
  const [newPrincipal, setNewPrincipal] = useState('');

  useEffect(() => {
    const fetchPrincipals = async () => {
      try {
        const list = await getAuthorizedPrincipals();
        setPrincipals(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrincipals();
  }, [getAuthorizedPrincipals]);

  const handleAdd = async () => {
    if (!newPrincipal.trim()) return;
    try {
      await addAuthorizedPrincipal(newPrincipal.trim());
      const list = await getAuthorizedPrincipals();
      setPrincipals(list);
      setNewPrincipal('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (principal: string) => {
    try {
      await removeAuthorizedPrincipal(principal);
      const list = await getAuthorizedPrincipals();
      setPrincipals(list);
    } catch (err) {
      console.error(err);
    }
  };

  const treasuryStats = [
    {
      label: 'Total Balance',
      value: dao.treasury.balance,
      change: '+5.2%',
      trend: 'up',
      icon: Wallet,
      color: 'green'
    },
    {
      label: 'Monthly Inflow',
      value: dao.treasury.monthlyInflow,
      change: '+12.8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      label: 'Available Funds',
      value: '$680K',
      change: '-2.1%',
      trend: 'down',
      icon: DollarSign,
      color: 'purple'
    },
    {
      label: 'Locked Funds',
      value: '$170K',
      change: '+8.5%',
      trend: 'up',
      icon: Lock,
      color: 'orange'
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      type: 'inflow',
      description: 'Revenue sharing from protocol fees',
      amount: '+$12,500',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'outflow',
      description: 'Development team payment',
      amount: '-$8,000',
      timestamp: '1 day ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'inflow',
      description: 'Staking rewards distribution',
      amount: '+$3,200',
      timestamp: '2 days ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'outflow',
      description: 'Marketing campaign funding',
      amount: '-$5,500',
      timestamp: '3 days ago',
      status: 'completed'
    }
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
            className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-mono"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Deposit</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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

      {/* Authorized Principals Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 font-mono">
          AUTHORIZED PRINCIPALS
        </h3>

        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newPrincipal}
            onChange={(e) => setNewPrincipal(e.target.value)}
            placeholder="Principal ID"
            className="flex-grow px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white font-mono"
          />
          <button
            onClick={handleAdd}
            disabled={loading}
            className="flex items-center space-x-1 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

        <ul className="space-y-2">
          {principals.map((p) => (
            <li
              key={p}
              className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg border border-gray-700/30"
            >
              <span className="text-white text-sm font-mono break-all">{p}</span>
              <button
                onClick={() => handleRemove(p)}
                disabled={loading}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
          {principals.length === 0 && (
            <li className="text-sm text-gray-400 font-mono">No authorized principals</li>
          )}
        </ul>
      </motion.div>
    </div>
  );
};

export default ManagementTreasury;