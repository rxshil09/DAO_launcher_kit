import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDAODiscovery } from '../hooks/useDAODiscovery';
import BackgroundParticles from './BackgroundParticles';
import ExploreDAOCard from './ExploreDAOCard';
import Toast from './Toast';
import { 
  Search, 
  Filter, 
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Loader2,
  AlertCircle,
  RefreshCw,
  Globe,
  Star,
  BarChart3,
  Calendar,
  ChevronDown,
  X,
  Sparkles
} from 'lucide-react';
import { DAOMetadata, SearchFilters, SortOption } from '../types/dao';

const ExplorePage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    getAllPublicDAOs,
    searchDAOs,
    getDAOsByCategory,
    getTrendingDAOs,
    getSupportedCategories,
    getRegistryStats,
    loading,
    error
  } = useDAODiscovery();
  
  const navigate = useNavigate();
  
  // State management
  const [daos, setDAOs] = useState<DAOMetadata[]>([]);
  const [trendingDAOs, setTrendingDAOs] = useState<DAOMetadata[]>([]);
  const [registryStats, setRegistryStats] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  
  // Advanced filters
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const PAGE_SIZE = 12;

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load categories and registry stats
      const [categoriesData, statsData, trendingData] = await Promise.all([
        getSupportedCategories(),
        getRegistryStats(),
        getTrendingDAOs(6)
      ]);
      
      setCategories(['All', ...categoriesData]);
      setRegistryStats(statsData);
      setTrendingDAOs(trendingData);
      
      // Load initial DAOs
      await loadDAOs();
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showToast('error', 'Failed to load DAO data');
    }
  };

  const loadDAOs = useCallback(async (page = 0, append = false) => {
    try {
      let result;
      
      if (searchQuery.trim()) {
        // Search with query
        result = await searchDAOs(
          searchQuery,
          selectedCategory !== 'All' ? { ...filters, category: selectedCategory } : filters,
          sortOption,
          page,
          PAGE_SIZE
        );
      } else if (selectedCategory !== 'All') {
        // Filter by category
        result = await getDAOsByCategory(selectedCategory, page, PAGE_SIZE);
      } else {
        // Get all public DAOs
        result = await getAllPublicDAOs(page, PAGE_SIZE);
      }

      if (append) {
        setDAOs(prev => [...prev, ...result.items]);
      } else {
        setDAOs(result.items);
      }
      
      setCurrentPage(result.page);
      setTotalPages(Math.ceil(result.total_count / PAGE_SIZE));
      setHasMore(result.has_next);
      
    } catch (err) {
      console.error('Failed to load DAOs:', err);
      showToast('error', 'Failed to load DAOs');
    }
  }, [searchQuery, selectedCategory, sortOption, filters, searchDAOs, getDAOsByCategory, getAllPublicDAOs]);

  // Reload DAOs when filters change
  useEffect(() => {
    setCurrentPage(0);
    loadDAOs(0, false);
  }, [searchQuery, selectedCategory, sortOption, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortOption(sort);
    setCurrentPage(0);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadDAOs(currentPage + 1, true);
    }
  };

  const handleRefresh = async () => {
    setCurrentPage(0);
    await loadDAOs(0, false);
    await loadInitialData();
    showToast('success', 'DAOs refreshed successfully!');
  };

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
  };

  const handleJoinDAO = (dao: DAOMetadata) => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    // Navigate to DAO management page
    navigate(`/dao/${dao.dao_id}/manage/overview`);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Calendar },
    { value: 'oldest', label: 'Oldest First', icon: Calendar },
    { value: 'most_members', label: 'Most Members', icon: Users },
    { value: 'most_active', label: 'Most Active', icon: Activity },
    { value: 'highest_tvl', label: 'Highest TVL', icon: DollarSign }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <BackgroundParticles />
        <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-400 font-mono">Loading explore page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BackgroundParticles />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24 sm:pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-cyan-400 mr-2" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text font-mono">
                EXPLORE DAOS
              </h1>
              <Sparkles className="w-8 h-8 text-purple-400 ml-2" />
            </div>
            <p className="text-gray-400 text-lg font-mono">
              {'>'} Discover and join decentralized autonomous organizations
            </p>
          </div>

          {/* Registry Stats */}
          {registryStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900/50 border border-blue-500/30 p-4 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400 font-mono">TOTAL DAOS</span>
                </div>
                <p className="text-2xl font-bold text-white">{registryStats.total_daos}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900/50 border border-green-500/30 p-4 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400 font-mono">MEMBERS</span>
                </div>
                <p className="text-2xl font-bold text-white">{registryStats.total_members.toLocaleString()}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900/50 border border-purple-500/30 p-4 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-400 font-mono">TOTAL TVL</span>
                </div>
                <p className="text-2xl font-bold text-white">${(registryStats.total_tvl / 1000000).toFixed(1)}M</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900/50 border border-orange-500/30 p-4 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-gray-400 font-mono">PUBLIC</span>
                </div>
                <p className="text-2xl font-bold text-white">{registryStats.public_daos}</p>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Trending DAOs Section */}
        {trendingDAOs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white font-mono">TRENDING DAOS</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingDAOs.map((dao, index) => (
                <ExploreDAOCard
                  key={dao.dao_id}
                  dao={dao}
                  index={index}
                  onJoin={handleJoinDAO}
                  isTrending={true}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 border border-cyan-500/30 p-6 rounded-xl backdrop-blur-sm mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search DAOs..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 6).map((category) => (
                <motion.button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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

            {/* Sort and Filter Controls */}
            <div className="flex items-center space-x-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="appearance-none bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 pr-8 text-white font-mono focus:ring-2 focus:ring-cyan-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors font-mono ${
                  showFilters
                    ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors font-mono"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">Min Members</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.min_members || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        min_members: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">Max Members</label>
                    <input
                      type="number"
                      placeholder="∞"
                      value={filters.max_members || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        max_members: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setFilters({})}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-mono"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

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

        {/* DAOs Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {loading && daos.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 animate-pulse">
                  <div className="h-48 bg-gray-800 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-800 rounded flex-1"></div>
                    <div className="h-8 bg-gray-800 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : daos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {daos.map((dao, index) => (
                  <ExploreDAOCard
                    key={dao.dao_id}
                    dao={dao}
                    index={index}
                    onJoin={handleJoinDAO}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center">
                  <motion.button
                    onClick={handleLoadMore}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold font-mono disabled:opacity-50 flex items-center space-x-2 mx-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More DAOs</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* Pagination Info */}
              <div className="text-center mt-6">
                <p className="text-gray-400 font-mono text-sm">
                  Showing {daos.length} of {totalPages * PAGE_SIZE} DAOs
                  {currentPage > 0 && ` • Page ${currentPage + 1} of ${totalPages}`}
                </p>
              </div>
            </>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 font-mono">
                NO DAOS FOUND
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                {searchQuery 
                  ? `No DAOs match your search for "${searchQuery}"`
                  : 'No DAOs available in this category'
                }
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setFilters({});
                }}
                className="px-6 py-3 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors font-mono"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExplorePage;