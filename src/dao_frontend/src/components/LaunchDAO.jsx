import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BackgroundParticles from './BackgroundParticles';
import { 
  ArrowLeft, 
  ArrowRight, 
  Rocket, 
  Shield, 
  Users, 
  DollarSign, 
  Settings, 
  Eye,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Zap,
  Target,
  TrendingUp,
  Globe,
  Lock,
  Sparkles,
  Plus,
  Minus,
  X,
  FileText,
  Coins,
  Vote,
  Wallet,
  BarChart3,
  Award,
  Clock,
  Loader2,
  LayoutDashboard
} from 'lucide-react';

const LaunchDAO = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Info
    daoName: '',
    description: '',
    category: '',
    website: '',
    
    // Module Selection
    selectedModules: [],
    selectedFeatures: {},
    
    // Tokenomics
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    initialPrice: '',
    
    // Governance
    votingPeriod: '7',
    quorumThreshold: '10',
    proposalThreshold: '1',
    
    // Funding
    fundingGoal: '',
    fundingDuration: '30',
    minInvestment: '',
    
    // Team
    teamMembers: [{ name: '', role: '', wallet: '' }],
    
    // Legal
    termsAccepted: false,
    kycRequired: false
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, loading, navigate]);

  const steps = [
    { id: 1, name: 'Basic Info', icon: FileText },
    { id: 2, name: 'Module Selection', icon: Settings },
    { id: 3, name: 'Tokenomics', icon: Coins },
    { id: 4, name: 'Governance', icon: Vote },
    { id: 5, name: 'Funding', icon: DollarSign },
    { id: 6, name: 'Team', icon: Users },
    { id: 7, name: 'Review', icon: CheckCircle }
  ];

  const categories = [
    'DeFi', 'NFT', 'Gaming', 'Social', 'Infrastructure', 'Investment', 'Community', 'Other'
  ];

  const modules = [
    {
      id: 'governance',
      name: 'Governance',
      description: 'Voting mechanisms and proposal systems',
      icon: Vote,
      color: 'from-blue-500 to-purple-600',
      required: true,
      features: [
        { id: 'token-voting', name: 'Token Weighted Voting', description: 'Traditional token-based voting power' },
        { id: 'quadratic-voting', name: 'Quadratic Voting', description: 'Quadratic voting to prevent whale dominance' },
        { id: 'delegated-voting', name: 'Delegated Voting', description: 'Allow token holders to delegate their votes' }
      ]
    },
    {
      id: 'treasury',
      name: 'Treasury',
      description: 'Fund Management and financial operations',
      icon: Wallet,
      color: 'from-green-500 to-emerald-600',
      required: true,
      features: [
        { id: 'multi-sig', name: 'Multi-Signature Wallet', description: 'Secure treasury with multiple approvers' },
        { id: 'stream-pay', name: 'Streaming Payments', description: 'Continuous payment streams for contributors' },
        { id: 'token-vest', name: 'Token Vesting', description: 'Time-locked token distribution' }
      ]
    },
    {
      id: 'staking',
      name: 'Staking',
      description: 'Token staking and reward distribution',
      icon: Award,
      color: 'from-purple-500 to-pink-600',
      required: false,
      features: [
        { id: 'simple-staking', name: 'Simple Staking', description: 'Basic staking with fixed rewards' },
        { id: 'liquidity-mining', name: 'Liquidity Mining', description: 'Rewards for providing liquidity' },
        { id: 'governance-staking', name: 'Governance Staking', description: 'Stake tokens for voting power' }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Monitoring and reporting tools',
      icon: LayoutDashboard,
      color: 'from-pink-500 to-red-600',
      required: false,
      features: [
        { id: 'analytics-dash', name: 'Analytics Dashboard', description: 'Real-time DAO metrics and KPIs' },
        { id: 'alert-sys', name: 'Alert System', description: 'Automated notifications for key events' },
        { id: 'financial-report', name: 'Financial Reports', description: 'Comprehensive financial reporting' }
      ]
    }
  ];

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.daoName.trim()) newErrors.daoName = 'DAO name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
      
      case 2:
        // Check if required modules are selected
        const requiredModules = modules.filter(m => m.required).map(m => m.id);
        const missingRequired = requiredModules.filter(id => !formData.selectedModules.includes(id));
        
        if (missingRequired.length > 0) {
          missingRequired.forEach(moduleId => {
            const module = modules.find(m => m.id === moduleId);
            newErrors[moduleId] = `${module.name} module is required`;
          });
        }
        break;
      
      case 3:
        if (!formData.tokenName.trim()) newErrors.tokenName = 'Token name is required';
        if (!formData.tokenSymbol.trim()) newErrors.tokenSymbol = 'Token symbol is required';
        if (!formData.totalSupply) newErrors.totalSupply = 'Total supply is required';
        if (!formData.initialPrice) newErrors.initialPrice = 'Initial price is required';
        break;
      
      case 4:
        if (!formData.votingPeriod) newErrors.votingPeriod = 'Voting period is required';
        if (!formData.quorumThreshold) newErrors.quorumThreshold = 'Quorum threshold is required';
        break;
      
      case 5:
        if (!formData.fundingGoal) newErrors.fundingGoal = 'Funding goal is required';
        if (!formData.minInvestment) newErrors.minInvestment = 'Minimum investment is required';
        break;
      
      case 6:
        if (formData.teamMembers.some(member => !member.name.trim() || !member.role.trim())) {
          newErrors.teamMembers = 'All team members must have name and role';
        }
        break;
      
      case 7:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms of service';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleModuleToggle = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    if (module.required) return; // Can't toggle required modules
    
    setFormData(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter(id => id !== moduleId)
        : [...prev.selectedModules, moduleId]
    }));
  };

  const handleFeatureToggle = (moduleId, featureId) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: {
        ...prev.selectedFeatures,
        [moduleId]: {
          ...prev.selectedFeatures[moduleId],
          [featureId]: !prev.selectedFeatures[moduleId]?.[featureId]
        }
      }
    }));
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: '', role: '', wallet: '' }]
    }));
  };

  const removeTeamMember = (index) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const updateTeamMember = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleLaunch = async () => {
    if (validateStep(7)) {
      // Simulate DAO launch
      console.log('Launching DAO with data:', formData);
      // Here you would integrate with your backend/smart contracts
      alert('DAO launched successfully! 🚀');
      navigate('/dashboard');
    }
  };

  // Initialize required modules
  useEffect(() => {
    const requiredModuleIds = modules.filter(m => m.required).map(m => m.id);
    setFormData(prev => ({
      ...prev,
      selectedModules: [...new Set([...prev.selectedModules, ...requiredModuleIds])]
    }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <BackgroundParticles />
        <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-400 font-mono">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!showForm) {
    // Landing Page
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <BackgroundParticles />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24 sm:pt-28">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/25">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-mono">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                LAUNCH YOUR DAO
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              Create a decentralized autonomous organization in minutes with our powerful platform. 
              No coding required - just configure, customize, and launch.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <motion.button
                onClick={() => setShowForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative z-10 flex items-center">
                  <Rocket className="mr-2 w-5 h-5" />
                  START BUILDING
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 rounded-lg font-bold text-lg transition-all duration-300 hover:bg-cyan-400 hover:text-black"
              >
                VIEW EXAMPLES
              </button>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border border-cyan-500/30 rounded-2xl p-12 backdrop-blur-sm"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-mono">
              Ready to Build the Future?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of creators building the next generation of decentralized organizations.
            </p>
            {/* <motion.button
              onClick={() => setShowForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center">
                <Rocket className="mr-2 w-5 h-5" />
                LAUNCH YOUR DAO NOW
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button> */}
          </motion.div>
        </div>
      </div>
    );
  }

  // Form Page
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BackgroundParticles />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24 sm:pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-6">
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-mono">Back</span>
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2 font-mono">
              CREATE YOUR DAO
            </h1>
            <p className="text-cyan-400 font-mono">
              {'>'} Step {currentStep} of {steps.length}
            </p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-gray-900/50 border border-cyan-500/30 rounded-xl backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-300 font-mono">Progress</span>
              <span className="text-sm font-semibold text-cyan-400 font-mono">{currentStep}/7</span>
            </div>
            
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    currentStep >= step.id
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mt-2 transition-all ${
                      currentStep > step.id ? 'bg-cyan-500' : 'bg-gray-700'
                    }`} />
                  )}
                  <span className="text-xs text-gray-400 mt-2 font-mono text-center max-w-16">
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400 font-semibold font-mono">Please fix the following errors:</span>
            </div>
            <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 border border-cyan-500/30 rounded-xl backdrop-blur-sm p-8 mb-8"
        >
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 font-mono">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                  DAO Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.daoName}
                  onChange={(e) => setFormData(prev => ({ ...prev, daoName: e.target.value }))}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                    errors.daoName ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter your DAO name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                    errors.description ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Describe your DAO's mission and goals..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                    errors.category ? 'border-red-500' : 'border-gray-600'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                  placeholder="https://your-dao.com"
                />
              </div>
            </div>
          )}

          {/* Step 2: Module Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 font-mono">Module Selection</h2>
              
              <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                {modules.map((module) => {
                  const isSelected = formData.selectedModules.includes(module.id);
                  const ModuleIcon = module.icon;
                  
                  return (
                    <div key={module.id} className="space-y-3">
                      {/* Module Header */}
                      <div
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                        } ${module.required ? 'opacity-75' : ''}`}
                        onClick={() => !module.required && handleModuleToggle(module.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 bg-gradient-to-r ${module.color} rounded-lg flex items-center justify-center`}>
                              <ModuleIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white font-mono flex items-center">
                                {module.name}
                                {module.required && (
                                  <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30">
                                    Required
                                  </span>
                                )}
                              </h3>
                              <p className="text-gray-400 text-sm">{module.description}</p>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-gray-400'
                          }`}>
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      </div>

                      {/* Module Features */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 space-y-2"
                        >
                          {module.features.map((feature) => {
                            const isFeatureSelected = formData.selectedFeatures[module.id]?.[feature.id];
                            
                            return (
                              <div
                                key={feature.id}
                                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                  isFeatureSelected
                                    ? 'border-purple-500 bg-purple-500/10'
                                    : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                                }`}
                                onClick={() => handleFeatureToggle(module.id, feature.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-white font-semibold font-mono">{feature.name}</h4>
                                    <p className="text-gray-400 text-sm">{feature.description}</p>
                                  </div>
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isFeatureSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-400'
                                  }`}>
                                    {isFeatureSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Tokenomics */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 font-mono">Tokenomics</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                    Token Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tokenName}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                      errors.tokenName ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="e.g., MyDAO Token"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                    Token Symbol <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value.toUpperCase() }))}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                      errors.tokenSymbol ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="e.g., MDT"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                    Total Supply <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.totalSupply}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalSupply: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                      errors.totalSupply ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="1000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                    Initial Price (USD) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.initialPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, initialPrice: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                      errors.initialPrice ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="1.00"
                  />
                </div>
              </div>

              {formData.totalSupply && formData.initialPrice && (
                <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2 font-mono">Market Cap Calculation</h3>
                  <p className="text-white font-mono">
                    Initial Market Cap: ${(parseFloat(formData.totalSupply) * parseFloat(formData.initialPrice)).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Governance */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 font-mono">Governance Parameters</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                    Voting Period (days) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.votingPeriod}
                    onChange={(e) => setFormData(prev => ({ ...prev, votingPeriod: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                      errors.votingPeriod ? 'border-red-500' : 'border-gray-600'
                    }`}
                    min="1"
                    max="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                    Quorum Threshold (%) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quorumThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, quorumThreshold: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                      errors.quorumThreshold ? 'border-red-500' : 'border-gray-600'
                    }`}
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                    Proposal Threshold (% of tokens)
                  </label>
                  <input
                    type="number"
                    value={formData.proposalThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, proposalThreshold: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                    min="0.1"
                    max="10"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Funding */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 font-mono">Funding Configuration</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                    Funding Goal (USD) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.fundingGoal}
                    onChange={(e) => setFormData(prev => ({ ...prev, fundingGoal: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                      errors.fundingGoal ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="100000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                    Funding Duration (days)
                  </label>
                  <input
                    type="number"
                    value={formData.fundingDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, fundingDuration: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                    min="7"
                    max="365"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                    Minimum Investment (USD) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.minInvestment}
                    onChange={(e) => setFormData(prev => ({ ...prev, minInvestment: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                      errors.minInvestment ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Team */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white font-mono">Team Members</h2>
                <button
                  onClick={addTeamMember}
                  className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors font-mono"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white font-mono">Member {index + 1}</h3>
                      {formData.teamMembers.length > 1 && (
                        <button
                          onClick={() => removeTeamMember(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                          Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                          Role <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                          placeholder="CEO"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">Wallet Address</label>
                        <input
                          type="text"
                          value={member.wallet}
                          onChange={(e) => updateTeamMember(index, 'wallet', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                          placeholder="0x..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Review */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 font-mono">Review & Launch</h2>
              
              {/* DAO Summary */}
              <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4 font-mono">DAO Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 font-mono">Name:</span>
                    <span className="text-white ml-2 font-semibold">{formData.daoName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-mono">Category:</span>
                    <span className="text-white ml-2 font-semibold">{formData.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-mono">Token:</span>
                    <span className="text-white ml-2 font-semibold">{formData.tokenName} ({formData.tokenSymbol})</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-mono">Funding Goal:</span>
                    <span className="text-white ml-2 font-semibold">${parseInt(formData.fundingGoal || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Selected Modules */}
              <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4 font-mono">Selected Modules & Features</h3>
                <div className="space-y-3">
                  {formData.selectedModules.map(moduleId => {
                    const module = modules.find(m => m.id === moduleId);
                    const selectedFeatures = Object.entries(formData.selectedFeatures[moduleId] || {})
                      .filter(([_, selected]) => selected)
                      .map(([featureId]) => module.features.find(f => f.id === featureId)?.name)
                      .filter(Boolean);
                    
                    return (
                      <div key={moduleId} className={`p-3 rounded-lg bg-gradient-to-r ${module.color} bg-opacity-20 border border-gray-600`}>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold font-mono">{module.name}</span>
                          {module.required && (
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30">
                              Required
                            </span>
                          )}
                        </div>
                        {selectedFeatures.length > 0 && (
                          <div className="mt-2 text-sm text-gray-300">
                            Features: {selectedFeatures.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legal & Compliance */}
              <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4 font-mono flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Legal & Compliance
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                      className="w-5 h-5 text-cyan-500 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <span className="text-white font-mono">
                      I agree to the Terms of Service and confirm all information is accurate. <span className="text-red-400">*</span>
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.kycRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, kycRequired: e.target.checked }))}
                      className="w-5 h-5 text-cyan-500 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <span className="text-white font-mono">Require KYC verification for investors.</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center"
        >
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-mono"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>

            {currentStep === 7 ? (
              <button
                onClick={handleLaunch}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold font-mono"
              >
                <Rocket className="w-4 h-4" />
                <span>Launch DAO</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold font-mono"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-900 border border-cyan-500/30 rounded-xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white font-mono">DAO Preview</h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info Preview */}
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 font-mono">{formData.daoName || 'Your DAO'}</h3>
                    <p className="text-gray-300 mb-4">{formData.description || 'DAO description will appear here...'}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30">
                        {formData.category || 'Category'}
                      </span>
                      {formData.website && (
                        <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 flex items-center">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Tokenomics Preview */}
                  {formData.tokenName && (
                    <div className="bg-gray-800/50 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-white mb-3 font-mono">Tokenomics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Token:</span>
                          <div className="text-white font-semibold">{formData.tokenName} ({formData.tokenSymbol})</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Supply:</span>
                          <div className="text-white font-semibold">{parseInt(formData.totalSupply || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Price:</span>
                          <div className="text-white font-semibold">${formData.initialPrice}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Market Cap:</span>
                          <div className="text-white font-semibold">
                            ${((parseFloat(formData.totalSupply) || 0) * (parseFloat(formData.initialPrice) || 0)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modules Preview */}
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-3 font-mono">Active Modules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.selectedModules.map(moduleId => {
                        const module = modules.find(m => m.id === moduleId);
                        return (
                          <div key={moduleId} className={`p-3 rounded-lg bg-gradient-to-r ${module.color} bg-opacity-20 border border-gray-600`}>
                            <span className="text-white font-semibold">{module.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Funding Preview */}
                  {formData.fundingGoal && (
                    <div className="bg-gray-800/50 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-white mb-3 font-mono">Funding</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Goal:</span>
                          <div className="text-white font-semibold">${parseInt(formData.fundingGoal).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Duration:</span>
                          <div className="text-white font-semibold">{formData.fundingDuration} days</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Min Investment:</span>
                          <div className="text-white font-semibold">${formData.minInvestment}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LaunchDAO;