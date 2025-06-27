import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  Shield
} from 'lucide-react';

const Dashboard = () => {
  const { isAuthenticated, principal } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

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
    { label: 'Total Investment', value: '$12,450', change: '+12.5%', trend: 'up' },
    { label: 'Active Projects', value: '8', change: '+2', trend: 'up' },
    { label: 'Monthly Returns', value: '$287', change: '+8.2%', trend: 'up' },
    { label: 'DAO Tokens', value: '1,247', change: '-3.1%', trend: 'down' }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                &gt; Principal: {principal?.slice(0, 12)}...{principal?.slice(-8)}
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
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-gray-700 transition-colors font-mono">
                <Plus className="w-4 h-4" />
                <span>ADD FUNDS</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {portfolioStats.map((stat, index) => (
            <div key={index} className="bg-gray-900/50 border border-cyan-500/30 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
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
            </div>
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
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors font-mono ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }`}
                >
                  {category}
                </button>
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

        {/* Projects Grid */}
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
              className="bg-gray-900/50 border border-purple-500/30 rounded-xl backdrop-blur-sm overflow-hidden hover:border-purple-400/50 transition-all group"
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
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
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
                  <button className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all text-sm font-medium font-mono">
                    INVEST NOW
                  </button>
                  <button className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm font-mono">
                    DETAILS
                  </button>
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
            <p className="text-gray-400 font-mono">&gt; Try adjusting your filters or search terms</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;