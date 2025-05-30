import React, { useState, useCallback } from 'react';
import { Shield, Globe, ChevronRight, Zap } from 'lucide-react';
import ModuleSelector from './ModuleSelector';
import NetworkSelector from './NetworkSelector';
import ProgressStepper from './ProgressStepper';
import TokenConfiguration from './TokenConfiguration';
import DeploymentStatus from './DeploymentStatus';
import { useDAOConfig } from '../hooks/useDAOConfig';
import { validateModuleSelection } from '../utils/validation';
import icpService from '../services/icpService';

const moduleTypes = {
  governance: {
    name: 'Governance',
    description: 'Voting mechanisms and proposal systems',
    modules: [
      { id: 'token-weighted', name: 'Token-Weighted Voting', description: 'Traditional token-based voting power' },
      { id: 'quadratic', name: 'Quadratic Voting', description: 'Quadratic voting to prevent whale dominance' },
      { id: 'delegated', name: 'Delegated Voting', description: 'Allow token holders to delegate their votes' }
    ]
  },
  treasury: {
    name: 'Treasury',
    description: 'Fund management and financial operations',
    modules: [
      { id: 'multisig', name: 'Multi-Signature Wallet', description: 'Secure treasury with multiple approvers' },
      { id: 'streaming', name: 'Streaming Payments', description: 'Continuous payment streams for contributors' },
      { id: 'vesting', name: 'Token Vesting', description: 'Time-locked token distribution' }
    ]
  },
  staking: {
    name: 'Staking',
    description: 'Token staking and reward mechanisms',
    modules: [
      { id: 'simple-staking', name: 'Simple Staking', description: 'Basic staking with fixed rewards' },
      { id: 'liquidity-mining', name: 'Liquidity Mining', description: 'Rewards for providing liquidity' },
      { id: 'governance-staking', name: 'Governance Staking', description: 'Stake tokens for voting power' }
    ]
  },
  analytics: {
    name: 'Analytics',
    description: 'Monitoring and reporting tools',
    modules: [
      { id: 'dashboard', name: 'Analytics Dashboard', description: 'Real-time DAO metrics and KPIs' },
      { id: 'notifications', name: 'Alert System', description: 'Automated notifications for key events' },
      { id: 'reports', name: 'Financial Reports', description: 'Comprehensive financial reporting' }
    ]
  }
};

const steps = [
  { id: 1, name: 'Basic Info', description: 'DAO name and description' },
  { id: 2, name: 'Network', description: 'Choose blockchain network' },
  { id: 3, name: 'Modules', description: 'Select DAO modules' },
  { id: 4, name: 'Token Setup', description: 'Configure governance token' },
  { id: 5, name: 'Review', description: 'Review and deploy' }
];

export default function DAOLauncherApp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedModules, setSelectedModules] = useState({});
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  
  const { config, errors, updateConfig, updateTokenConfig, validateConfig } = useDAOConfig();

  const handleModuleToggle = useCallback((category, moduleId) => {
    setSelectedModules(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [moduleId]: !prev[category]?.[moduleId]
      }
    }));
  }, []);

  const handleNetworkSelect = useCallback((networkId) => {
    updateConfig({ network: networkId });
  }, [updateConfig]);

  const handleDeploy = async () => {
    if (!validateConfig()) {
      return;
    }

    setDeploymentStatus('deploying');
    setDeploymentProgress(0);

    try {
      // Simulate deployment progress
      const progressSteps = [10, 30, 50, 70, 90, 100];
      
      for (const progress of progressSteps) {
        setDeploymentProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Deploy DAO using ICP service
      const deploymentResult = await icpService.createDAOCanister({
        ...config,
        modules: selectedModules
      });

      if (deploymentResult.success) {
        setDeploymentStatus('success');
        console.log('DAO deployed successfully:', deploymentResult);
      } else {
        throw new Error('Deployment failed');
      }
    } catch (error) {
      console.error('Deployment error:', error);
      setDeploymentStatus('error');
    }
  };

  const isStepComplete = useCallback((stepId) => {
    switch (stepId) {
      case 1:
        return config.name && config.description;
      case 2:
        return config.network;
      case 3:
        return !validateModuleSelection(selectedModules);
      case 4:
        return config.tokenConfig.name && config.tokenConfig.symbol && config.tokenConfig.totalSupply;
      default:
        return false;
    }
  }, [config, selectedModules]);

  const canProceedToNext = useCallback(() => {
    return isStepComplete(currentStep);
  }, [currentStep, isStepComplete]);

  const handleStepClick = useCallback((stepId) => {
    // Allow clicking on completed steps or the next step
    if (stepId <= currentStep || isStepComplete(currentStep)) {
      setCurrentStep(stepId);
    }
  }, [currentStep, isStepComplete]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DAO Name
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                placeholder="Enter your DAO name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={config.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                rows={4}
                className={`input-field ${errors.description ? 'border-red-300' : ''}`}
                placeholder="Describe your DAO's purpose and goals"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <NetworkSelector 
            selectedNetwork={config.network}
            onNetworkSelect={handleNetworkSelect}
          />
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Modules</h3>
            <ModuleSelector
              modules={moduleTypes}
              selectedModules={selectedModules}
              onModuleToggle={handleModuleToggle}
            />
            {validateModuleSelection(selectedModules) && (
              <p className="text-sm text-red-600">{validateModuleSelection(selectedModules)}</p>
            )}
          </div>
        );

      case 4:
        return (
          <TokenConfiguration
            tokenConfig={config.tokenConfig}
            onTokenConfigUpdate={updateTokenConfig}
            errors={errors}
          />
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Configuration</h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600"><span className="font-medium">Name:</span> {config.name}</p>
                  <p className="text-gray-600"><span className="font-medium">Description:</span> {config.description}</p>
                  <p className="text-gray-600"><span className="font-medium">Network:</span> {config.network.toUpperCase()}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Selected Modules</h4>
                {Object.entries(selectedModules).map(([category, modules]) => {
                  const selectedInCategory = Object.entries(modules).filter(([_, selected]) => selected);
                  if (selectedInCategory.length === 0) return null;
                  
                  return (
                    <div key={category} className="ml-4 mb-2">
                      <p className="font-medium text-gray-800">{moduleTypes[category].name}:</p>
                      {selectedInCategory.map(([moduleId, _]) => {
                        const module = moduleTypes[category].modules.find(m => m.id === moduleId);
                        return (
                          <p key={moduleId} className="text-gray-600 ml-4 text-sm">• {module?.name}</p>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Token Configuration</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600"><span className="font-medium">Name:</span> {config.tokenConfig.name}</p>
                  <p className="text-gray-600"><span className="font-medium">Symbol:</span> {config.tokenConfig.symbol}</p>
                  <p className="text-gray-600"><span className="font-medium">Total Supply:</span> {config.tokenConfig.totalSupply}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Deployment Information</h4>
              <p className="text-sm text-blue-800">
                Your DAO will be deployed to the Internet Computer blockchain. 
                The deployment process may take a few minutes to complete.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DAO Launcher Kit</h1>
                <p className="text-sm text-gray-600">Modular DAO Creation Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Internet Computer</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Progress Steps */}
          <div className="lg:col-span-1">
            <ProgressStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              isStepComplete={isStepComplete}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card min-h-[600px]">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {steps.find(s => s.id === currentStep)?.name}
                </h2>
                <p className="text-gray-600">
                  {steps.find(s => s.id === currentStep)?.description}
                </p>
              </div>

              <div className="flex-1">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex space-x-3">
                  {currentStep < 5 ? (
                    <button
                      onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                      disabled={!canProceedToNext()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleDeploy}
                      disabled={!canProceedToNext() || deploymentStatus === 'deploying'}
                      className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                    >
                      <span>Deploy DAO</span>
                      <Zap className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Status Modal */}
      <DeploymentStatus
        status={deploymentStatus}
        progress={deploymentProgress}
        onClose={() => {
          setDeploymentStatus(null);
          setDeploymentProgress(0);
          if (deploymentStatus === 'success') {
            // Reset form or redirect to DAO dashboard
            setCurrentStep(1);
            setSelectedModules({});
            updateConfig({
              name: '',
              description: '',
              network: 'icp',
              tokenConfig: { name: '', symbol: '', totalSupply: '' }
            });
          }
        }}
      />
    </div>
  );
}