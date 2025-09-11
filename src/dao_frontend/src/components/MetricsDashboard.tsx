import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';
import BackgroundParticles from './BackgroundParticles';
import MetricsCounter from './analytics/MetricsCounter';
import TrendChart from './analytics/TrendChart';
import CategoryChart from './analytics/CategoryChart';
import ActivityHeatmap from './analytics/ActivityHeatmap';
import LeaderboardCard from './analytics/LeaderboardCard';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Vote, 
  Activity,
  Globe,
  Zap,
  Target,
  Award,
  Calendar,
  PieChart,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Shield,
  Coins
} from 'lucide-react';

const MetricsDashboard: React.FC = () => {
  const {
    getPlatformMetrics,
    getTimeSeriesData,
    getGrowthMetrics,
    getGovernanceStats,
    getTreasuryAnalytics,
    getTopDAOs,
    loading,
    error
  } = useAnalytics();

  const [platformMetrics, setPlatformMetrics] = useState<any>(null);
  const [growthMetrics, setGrowthMetrics] = useState<any>(null);
  const [governanceStats, setGovernanceStats] = useState<any>(null);
  const [treasuryAnalytics, setTreasuryAnalytics] = useState<any>(null);
  const [topDAOs, setTopDAOs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({});
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const timeframes = [
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' },
    { value: '365', label: '1 Year' }
  ];

  const loadData = async () => {
    try {
      const [metrics, growth, governance, treasury, topDaos] = await Promise.all([
        getPlatformMetrics(),
        getGrowthMetrics(parseInt(selectedTimeframe)),
        getGovernanceStats(),
        getTreasuryAnalytics(),
        getTopDAOs(10)
      ]);

      setPlatformMetrics(metrics);
      setGrowthMetrics(growth);
      setGovernanceStats(governance);
      setTreasuryAnalytics(treasury);
      setTopDAOs(topDaos);

      // Load chart data
      const [daoGrowthData, userGrowthData, tvlData, proposalData] = await Promise.all([
        getTimeSeriesData('dao_creations', 'daily', parseInt(selectedTimeframe)),
        getTimeSeriesData('user_registrations', 'daily', parseInt(selectedTimeframe)),
        getTimeSeriesData('treasury_volume', 'daily', parseInt(selectedTimeframe)),
        getTimeSeriesData('proposals_created', 'daily', parseInt(selectedTimeframe))
      ]);

      setChartData({
        daoGrowth: daoGrowthData,
        userGrowth: userGrowthData,
        tvl: tvlData,
        proposals: proposalData
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTimeframe]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BackgroundParticles />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24 sm:pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-cyan-400 mr-2" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text font-mono">
                PLATFORM METRICS
              </h1>
              <Sparkles className="w-8 h-8 text-purple-400 ml-2" />
            </div>
            <p className="text-gray-400 text-lg font-mono mb-6">
              {'>'} Real-time analytics and insights for the DAO ecosystem
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-mono">Live Data</span>
              </div>
              <div className="text-sm text-gray-400 font-mono">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2 bg-gray-900/50 border border-gray-700 rounded-lg p-1">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.value}
                  onClick={() => setSelectedTimeframe(timeframe.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors font-mono ${
                    selectedTimeframe === timeframe.value
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-cyan-400'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Platform Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <MetricsCounter
            label="Total DAOs"
            value={platformMetrics?.total_daos || 0}
            change={growthMetrics?.dao_growth_rate || 0}
            icon={Shield}
            color="blue"
            delay={0}
          />
          <MetricsCounter
            label="Total Members"
            value={platformMetrics?.total_users || 0}
            change={growthMetrics?.user_growth_rate || 0}
            icon={Users}
            color="green"
            delay={0.1}
          />
          <MetricsCounter
            label="Total Value Locked"
            value={platformMetrics?.total_tvl || 0}
            change={growthMetrics?.tvl_growth_rate || 0}
            icon={DollarSign}
            color="purple"
            format="currency"
            delay={0.2}
          />
          <MetricsCounter
            label="Total Proposals"
            value={platformMetrics?.total_proposals || 0}
            change={growthMetrics?.proposal_growth_rate || 0}
            icon={Vote}
            color="orange"
            delay={0.3}
          />
        </motion.div>

        {/* 24h Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12"
        >
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400 font-mono">ACTIVE DAOS 24H</span>
            </div>
            <p className="text-xl font-bold text-white">{platformMetrics?.active_daos_24h || 0}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400 font-mono">ACTIVE USERS 24H</span>
            </div>
            <p className="text-xl font-bold text-white">{platformMetrics?.active_users_24h || 0}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Vote className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400 font-mono">PROPOSALS 24H</span>
            </div>
            <p className="text-xl font-bold text-white">{platformMetrics?.proposals_created_24h || 0}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400 font-mono">VOTES 24H</span>
            </div>
            <p className="text-xl font-bold text-white">{platformMetrics?.votes_cast_24h || 0}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400 font-mono">VOLUME 24H</span>
            </div>
            <p className="text-xl font-bold text-white">
              {formatCurrency(platformMetrics?.treasury_volume_24h || 0)}
            </p>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* DAO Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white font-mono">DAO GROWTH</h3>
              </div>
              <div className="text-sm text-gray-400 font-mono">
                {formatPercentage(growthMetrics?.dao_growth_rate || 0)} vs previous period
              </div>
            </div>
            <TrendChart
              data={chartData.daoGrowth || []}
              color="blue"
              height={200}
            />
          </motion.div>

          {/* User Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-white font-mono">USER GROWTH</h3>
              </div>
              <div className="text-sm text-gray-400 font-mono">
                {formatPercentage(growthMetrics?.user_growth_rate || 0)} vs previous period
              </div>
            </div>
            <TrendChart
              data={chartData.userGrowth || []}
              color="green"
              height={200}
            />
          </motion.div>

          {/* TVL Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white font-mono">TVL TRENDS</h3>
              </div>
              <div className="text-sm text-gray-400 font-mono">
                {formatPercentage(growthMetrics?.tvl_growth_rate || 0)} vs previous period
              </div>
            </div>
            <TrendChart
              data={chartData.tvl || []}
              color="purple"
              height={200}
              format="currency"
            />
          </motion.div>

          {/* Proposal Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Vote className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white font-mono">PROPOSAL ACTIVITY</h3>
              </div>
              <div className="text-sm text-gray-400 font-mono">
                {formatPercentage(growthMetrics?.proposal_growth_rate || 0)} vs previous period
              </div>
            </div>
            <TrendChart
              data={chartData.proposals || []}
              color="orange"
              height={200}
            />
          </motion.div>
        </div>

        {/* Governance & Treasury Analytics */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Governance Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Vote className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white font-mono">GOVERNANCE</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm font-mono">Total Proposals</span>
                <span className="text-white font-bold">{governanceStats?.total_proposals || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm font-mono">Active Proposals</span>
                <span className="text-blue-400 font-bold">{governanceStats?.active_proposals || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm font-mono">Avg Participation</span>
                <span className="text-green-400 font-bold">
                  {((governanceStats?.average_voting_participation || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm font-mono">Success Rate</span>
                <span className="text-purple-400 font-bold">85%</span>
              </div>
            </div>
          </motion.div>

          {/* Treasury Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2 mb-6">
              <DollarSign className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-white font-mono">TREASURY</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm font-mono">Total Deposits</span>
                <span className="text-white font-bold">
                  {formatCurrency(treasuryAnalytics?.total_deposits || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm font-mono">Net Flow 24h</span>
                <span className={`font-bold ${
                  (treasuryAnalytics?.net_flow_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(treasuryAnalytics?.net_flow_24h || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm font-mono">Avg DAO Treasury</span>
                <span className="text-purple-400 font-bold">
                  {formatCurrency(treasuryAnalytics?.average_dao_treasury || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm font-mono">Growth Rate</span>
                <span className="text-cyan-400 font-bold">
                  {formatPercentage(treasuryAnalytics?.treasury_growth_rate || 0)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Top DAOs Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Award className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-bold text-white font-mono">TOP DAOS</h3>
            </div>
            
            <div className="space-y-3">
              {topDAOs.slice(0, 5).map(([daoId, score], index) => (
                <LeaderboardCard
                  key={daoId}
                  rank={index + 1}
                  name={daoId}
                  score={score}
                  delay={1.0 + index * 0.1}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-8 backdrop-blur-sm mb-12"
        >
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-bold text-white font-mono">DAO ECOSYSTEM DISTRIBUTION</h3>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <CategoryChart />
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white font-mono">Category Insights</h4>
              <div className="space-y-3">
                {[
                  { category: 'DeFi', count: 45, percentage: 35, color: 'green' },
                  { category: 'Gaming', count: 32, percentage: 25, color: 'purple' },
                  { category: 'Social', count: 28, percentage: 22, color: 'blue' },
                  { category: 'NFT', count: 15, percentage: 12, color: 'orange' },
                  { category: 'Other', count: 8, percentage: 6, color: 'gray' }
                ].map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-${item.color}-400`}></div>
                      <span className="text-gray-300 font-mono">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">{item.count}</span>
                      <span className="text-gray-400 text-sm ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-8 backdrop-blur-sm mb-12"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-bold text-white font-mono">ACTIVITY HEATMAP</h3>
          </div>
          <ActivityHeatmap data={chartData.daoGrowth || []} />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border border-cyan-500/30 rounded-xl p-8 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <Rocket className="w-8 h-8 text-cyan-400 mr-2" />
            <h3 className="text-2xl font-bold text-white font-mono">
              JOIN THE{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                ECOSYSTEM
              </span>
            </h3>
            <Sparkles className="w-8 h-8 text-purple-400 ml-2" />
          </div>
          <p className="text-gray-400 mb-6 font-mono">
            {'>'} Explore DAOs, participate in governance, and shape the future of decentralized organizations
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/explore"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg transition-all font-semibold"
            >
              <Globe className="w-4 h-4" />
              <span>Explore DAOs</span>
            </a>
            <a
              href="/launch"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all font-semibold"
            >
              <Zap className="w-4 h-4" />
              <span>Launch DAO</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MetricsDashboard;