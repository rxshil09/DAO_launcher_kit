import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDAOManagement } from '../context/DAOManagementContext';
import { 
  ArrowLeft,
  Settings,
  BarChart3,
  Vote,
  Coins,
  DollarSign,
  FileText,
  Image,
  Users,
  TrendingUp,
  Activity,
  Shield,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useLogoImage } from '../hooks/useLogoImage';

const DAOManagement: React.FC = () => {
  const { daoId } = useParams<{ daoId: string }>();
  const { daos, loading, selectDAO, selectedDAO } = useDAOManagement();
  const navigate = useNavigate();
  const location = useLocation();
  const [dao, setDAO] = useState(selectedDAO);
  const {
    imageUrl: headerLogoUrl,
    handleImageError: handleHeaderLogoError,
  } = useLogoImage({
    logoType: dao?.logoType,
    logoAssetId: dao?.logoAssetId,
    logoUrl: dao?.logoUrl,
    legacyLogo: dao?.logo,
  });

  // TODO: Filter tabs based on dao.selectedModules from backend config
  // For now, showing all tabs. Should fetch DAO config and filter based on enabled modules
  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3, path: 'overview' },
    { id: 'governance', name: 'Governance', icon: Vote, path: 'governance' },
    { id: 'staking', name: 'Staking', icon: Coins, path: 'staking' },
    { id: 'treasury', name: 'Treasury', icon: DollarSign, path: 'treasury' },
    { id: 'proposals', name: 'Proposals', icon: FileText, path: 'proposals' },
    { id: 'assets', name: 'Assets', icon: Image, path: 'assets' },
    { id: 'admins', name: 'Admins', icon: Users, path: 'admins' }
  ];

  useEffect(() => {
    if (daoId && daos.length > 0) {
      const foundDAO = daos.find(d => d.id === daoId);
      if (foundDAO) {
        setDAO(foundDAO);
        selectDAO(foundDAO);
      } else {
        navigate('/dashboard');
      }
    }
  }, [daoId, daos, selectDAO, navigate]);

  const getCurrentTab = () => {
    const pathSegments = location.pathname.split('/');
    const currentSection = pathSegments[pathSegments.length - 1];
    return tabs.find(tab => tab.path === currentSection) || tabs[0];
  };

  const currentTab = getCurrentTab();

  if (loading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-blue-400 font-mono">Loading DAO management...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dao) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2 font-mono">DAO NOT FOUND</h2>
            <p className="text-gray-400 mb-6">The requested DAO could not be found.</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24 sm:pt-28">
        {/* Header with Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm mb-6">
            <Link 
              to="/dashboard" 
              className="text-gray-400 hover:text-blue-400 transition-colors font-mono"
            >
              Dashboard
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-blue-400 font-mono">{dao.name}</span>
            <span className="text-gray-600">/</span>
            <span className="text-white font-mono">{currentTab.name}</span>
          </div>

          {/* DAO Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
               <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                 {headerLogoUrl ? (
                   <img
                     src={headerLogoUrl}
                     alt={dao.name}
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       e.currentTarget.style.display = 'none';
                       handleHeaderLogoError();
                     }}
                   />
                 ) : (
                   <Shield className="w-8 h-8 text-white" />
                 )}
               </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-mono">{dao.name}</h1>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-blue-400 font-mono">${dao.tokenSymbol}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{dao.memberCount.toLocaleString()} members</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-green-400">{dao.totalValueLocked} TVL</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-sm mb-8 overflow-hidden"
        >
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = currentTab.id === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={`/dao/${daoId}/manage/${tab.path}`}
                  className={`relative flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-blue-400 bg-blue-500/10 border-b-2 border-blue-400'
                      : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-mono">{tab.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-sm p-8"
        >
          <Outlet context={{ dao }} />
        </motion.div>
      </div>
    </div>
  );
};

export default DAOManagement;
