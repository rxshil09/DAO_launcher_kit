import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDAOOperations } from "../hooks/useDAOOperations";
import { useDAOManagement } from "../context/DAOManagementContext";
import { useToast } from "../context/ToastContext";
import LaunchSuccess from "./LaunchSuccess";
import { ImageUpload } from "./ImageUpload";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Rocket,
  Users,
  DollarSign,
  Settings,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  Globe,
  Coins,
  Vote,
  Target,
  Calendar,
  FileText,
  Zap,
  Star,
  Plus,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";

const LaunchDAO = () => {
  const { isAuthenticated, principal, loading: authLoading } = useAuth();
  const {
    launchDAO,
    loading: launchLoading,
    error: launchError,
  } = useDAOOperations();
  const { createDAO, loading: managementLoading } = useDAOManagement();
  const toast = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [launchedDAO, setLaunchedDAO] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    daoName: "",
    description: "",
    category: "",
    website: "",
    logoSource: "", // Stores either assetId or external URL
    logoType: "none", // 'none' | 'upload' | 'url'

    // Step 2: Module Selection
    selectedModules: ["governance", "treasury"], // Required modules
    selectedFeatures: {
      governance: {
        "token-voting": true,
        "quadratic-voting": false,
        "delegated-voting": false,
      },
      treasury: {
        "multi-sig": true,
        "automated-distributions": false,
      },
      staking: {
        "flexible-periods": true,
        "reward-compounding": true,
      },
    },

    // Step 3: Tokenomics
    tokenName: "",
    tokenSymbol: "",
    totalSupply: "",
    treasuryAllocation: "40",
    communityAllocation: "60",

    // Step 4: Governance
    votingPeriod: "604800", // 7 days in seconds
    quorumThreshold: "10",
    proposalThreshold: "1",

    // Step 5: Funding
    fundingGoal: "",
    fundingDuration: "2592000", // 30 days in seconds
    minInvestment: "",

    // Step 6: Team
    teamMembers: [
      {
        name: "",
        role: "",
        wallet: "",
      },
    ],

    // Step 7: Legal
    termsAccepted: false,
    kycRequired: false,
  });

  const steps = [
    {
      title: "Basic Info",
      icon: FileText,
      description: "DAO name, description, and category",
    },
    {
      title: "Modules",
      icon: Settings,
      description: "Select DAO functionality modules",
    },
    {
      title: "Tokenomics",
      icon: Coins,
      description: "Token configuration and economics",
    },
    {
      title: "Governance",
      icon: Vote,
      description: "Voting and proposal parameters",
    },
    {
      title: "Funding",
      icon: Target,
      description: "Fundraising goals and parameters",
    },
    { title: "Team", icon: Users, description: "Add team members and roles" },
    {
      title: "Launch",
      icon: Rocket,
      description: "Review and launch your DAO",
    },
  ];

  const modules = [
    {
      id: "governance",
      name: "Governance",
      description: "Voting mechanisms and proposal systems",
      required: true,
      features: [
        {
          id: "token-voting",
          name: "Token Weighted Voting",
          description: "Traditional token-based voting power",
        },
        {
          id: "quadratic-voting",
          name: "Quadratic Voting",
          description: "Quadratic voting to prevent whale dominance",
        },
        {
          id: "delegated-voting",
          name: "Delegated Voting",
          description: "Allow vote delegation to representatives",
        },
      ],
    },
    {
      id: "treasury",
      name: "Treasury",
      description: "Financial management and fund allocation",
      required: true,
      features: [
        {
          id: "multi-sig",
          name: "Multi-Signature Wallet",
          description: "Require multiple approvals for transactions",
        },
        {
          id: "automated-distributions",
          name: "Automated Distributions",
          description: "Automatic reward and payment distributions",
        },
      ],
    },
    {
      id: "staking",
      name: "Staking",
      description: "Token staking and reward mechanisms",
      required: false,
      features: [
        {
          id: "flexible-periods",
          name: "Flexible Staking Periods",
          description: "Multiple staking duration options",
        },
        {
          id: "reward-compounding",
          name: "Reward Compounding",
          description: "Automatic reward reinvestment",
        },
      ],
    },
  ];

  const categories = [
    {
      id: "DeFi",
      name: "DeFi",
      description: "Decentralized Finance protocols and applications",
    },
    {
      id: "Gaming",
      name: "Gaming",
      description: "Gaming ecosystems and play-to-earn platforms",
    },
    {
      id: "Social",
      name: "Social",
      description: "Social networks and community platforms",
    },
    { id: "NFT", name: "NFT", description: "NFT collections and marketplaces" },
    {
      id: "Infrastructure",
      name: "Infrastructure",
      description: "Blockchain infrastructure and tooling",
    },
  ];

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const showToast = (type, message) => {
    toast({ type, message });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleImageSelection = (source) => {
    setFormData((prev) => ({
      ...prev,
      logoSource: source.value,
      logoType: source.type,
    }));
  };

  const handleImageError = (error) => {
    showToast("error", error);
  };

  const handleModuleToggle = (moduleId) => {
    const module = modules.find((m) => m.id === moduleId);
    if (module?.required) return; // Can't toggle required modules

    setFormData((prev) => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter((id) => id !== moduleId)
        : [...prev.selectedModules, moduleId],
    }));
  };

  const handleFeatureToggle = (moduleId, featureId) => {
    setFormData((prev) => ({
      ...prev,
      selectedFeatures: {
        ...prev.selectedFeatures,
        [moduleId]: {
          ...prev.selectedFeatures[moduleId],
          [featureId]: !prev.selectedFeatures[moduleId]?.[featureId],
        },
      },
    }));
  };

  const addTeamMember = () => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: "", role: "", wallet: "" }],
    }));
  };

  const removeTeamMember = (index) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  const updateTeamMember = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Info
        if (!formData.daoName.trim()) {
          newErrors.daoName = "DAO name is required";
        } else if (formData.daoName.length < 3) {
          newErrors.daoName = "DAO name must be at least 3 characters";
        }

        if (!formData.description.trim()) {
          newErrors.description = "Description is required";
        } else if (formData.description.length < 10) {
          newErrors.description = "Description must be at least 10 characters";
        }

        if (!formData.category) {
          newErrors.category = "Please select a category";
        }
        break;

      case 2: // Tokenomics
        if (!formData.tokenName.trim()) {
          newErrors.tokenName = "Token name is required";
        }

        if (!formData.tokenSymbol.trim()) {
          newErrors.tokenSymbol = "Token symbol is required";
        } else if (!/^[A-Z]{2,6}$/.test(formData.tokenSymbol)) {
          newErrors.tokenSymbol = "Symbol must be 2-6 uppercase letters";
        }

        if (!formData.totalSupply || parseInt(formData.totalSupply) <= 0) {
          newErrors.totalSupply = "Total supply must be greater than 0";
        }

        // Validate distribution percentages
        const treasuryPct = parseInt(formData.treasuryAllocation) || 0;
        const communityPct = parseInt(formData.communityAllocation) || 0;
        if (treasuryPct + communityPct !== 100) {
          newErrors.distributionError =
            "Treasury and Community allocations must total 100%";
        }
        break;

      case 4: // Funding
        if (!formData.fundingGoal || parseInt(formData.fundingGoal) <= 0) {
          newErrors.fundingGoal = "Funding goal must be greater than 0";
        }

        if (!formData.minInvestment || parseInt(formData.minInvestment) <= 0) {
          newErrors.minInvestment = "Minimum investment must be greater than 0";
        }
        break;

      case 6: // Legal
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = "You must accept the terms and conditions";
        }
        break;
    }

    return newErrors;
  };

  const nextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      showToast("error", "Please fix the errors before continuing");
      return;
    }

    setErrors({});
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLaunchDAO = async () => {
    // Final validation
    const allErrors = {};
    for (let i = 0; i < steps.length - 1; i++) {
      const stepErrors = validateStep(i);
      Object.assign(allErrors, stepErrors);
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      showToast("error", "Please fix all errors before launching");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create DAO using the management context
      const daoData = {
        name: formData.daoName,
        description: formData.description,
        category: formData.category,
        tokenSymbol: formData.tokenSymbol,
        logoUrl: formData.logoType === "url" ? formData.logoSource : undefined,
        logoAssetId:
          formData.logoType === "upload" ? formData.logoSource : undefined,
        logoType: formData.logoType,
        memberCount: 1,
        totalValueLocked: "$0",
        status: "active",
        governance: {
          totalProposals: 0,
          activeProposals: 0,
        },
        treasury: {
          balance: "$0",
          monthlyInflow: "$0",
        },
        staking: {
          totalStaked: "$0",
          apr: "0%",
        },
      };

      // Create DAO on backend (this is the real deployment)
      const result = await launchDAO(formData);
      console.log("DAO Launch Result:", result);

      // Update daoData with registry information
      daoData.registryId = result.registryId;
      daoData.name = result.name;
      daoData.initialized = result.initialized;

      // Also create in management context for UI
      try {
        await createDAO(daoData);
      } catch (uiError) {
        console.warn(
          "UI DAO creation failed, but backend DAO was created:",
          uiError
        );
        // Continue - backend is more important
      }

      setLaunchedDAO(daoData);
      setShowSuccess(true);
      showToast(
        "success",
        `DAO launched successfully! Registry ID: ${result.registryId}`
      );

      // Navigate to dashboard after showing success
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Failed to launch DAO:", error);
      showToast("error", `Failed to launch DAO: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                DAO Name *
              </label>
              <input
                type="text"
                value={formData.daoName}
                onChange={(e) => handleInputChange("daoName", e.target.value)}
                placeholder="Enter your DAO name"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                  errors.daoName ? "border-red-500" : "border-gray-600"
                }`}
              />
              {errors.daoName && (
                <p className="text-red-400 text-sm mt-1 font-mono">
                  {errors.daoName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your DAO's purpose and goals"
                rows={4}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                  errors.description ? "border-red-500" : "border-gray-600"
                }`}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1 font-mono">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                Category *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleInputChange("category", category.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.category === category.id
                        ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                        : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-400">
                      {category.description}
                    </p>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-red-400 text-sm mt-1 font-mono">
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                Website (Optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://your-dao-website.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
              />
            </div>

            <div>
              <ImageUpload
                onImageSelected={handleImageSelection}
                onError={handleImageError}
                currentValue={formData.logoSource}
                label="Logo Image"
              />
            </div>
          </div>
        );

      case 1: // Module Selection
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-white mb-2 font-mono">
                SELECT DAO MODULES
              </h3>
              <p className="text-gray-400">
                Choose the functionality your DAO will have
              </p>
            </div>

            <div className="space-y-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          formData.selectedModules.includes(module.id)
                            ? "bg-cyan-500 border-cyan-500"
                            : "border-gray-600"
                        }`}
                      >
                        {formData.selectedModules.includes(module.id) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white flex items-center">
                          {module.name}
                          {module.required && (
                            <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                              Required
                            </span>
                          )}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    {!module.required && (
                      <button
                        type="button"
                        onClick={() => handleModuleToggle(module.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          formData.selectedModules.includes(module.id)
                            ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                            : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
                        }`}
                      >
                        {formData.selectedModules.includes(module.id)
                          ? "Remove"
                          : "Add"}
                      </button>
                    )}
                  </div>

                  {formData.selectedModules.includes(module.id) &&
                    module.features && (
                      <div className="space-y-2 pl-9">
                        <h5 className="text-sm font-semibold text-gray-300 font-mono">
                          Features:
                        </h5>
                        {module.features.map((feature) => (
                          <label
                            key={feature.id}
                            className="flex items-center space-x-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={
                                formData.selectedFeatures[module.id]?.[
                                  feature.id
                                ] || false
                              }
                              onChange={() =>
                                handleFeatureToggle(module.id, feature.id)
                              }
                              className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                            />
                            <div>
                              <span className="text-white text-sm">
                                {feature.name}
                              </span>
                              <p className="text-gray-400 text-xs">
                                {feature.description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        );

      case 2: // Tokenomics
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                  Token Name *
                </label>
                <input
                  type="text"
                  value={formData.tokenName}
                  onChange={(e) =>
                    handleInputChange("tokenName", e.target.value)
                  }
                  placeholder="e.g., MyDAO Token"
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                    errors.tokenName ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.tokenName && (
                  <p className="text-red-400 text-sm mt-1 font-mono">
                    {errors.tokenName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                  Token Symbol *
                </label>
                <input
                  type="text"
                  value={formData.tokenSymbol}
                  onChange={(e) =>
                    handleInputChange(
                      "tokenSymbol",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="e.g., MDT"
                  maxLength={6}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                    errors.tokenSymbol ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.tokenSymbol && (
                  <p className="text-red-400 text-sm mt-1 font-mono">
                    {errors.tokenSymbol}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                  Total Supply *
                </label>
                <input
                  type="number"
                  value={formData.totalSupply}
                  onChange={(e) =>
                    handleInputChange("totalSupply", e.target.value)
                  }
                  placeholder="1000000"
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                    errors.totalSupply ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.totalSupply && (
                  <p className="text-red-400 text-sm mt-1 font-mono">
                    {errors.totalSupply}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                  Initial Distribution Strategy *
                </label>
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 -mt-2.5">
                    <div>
                      <label className="text-s text-gray-400 font-mono">
                        Treasury (%)
                      </label>
                      <input
                        type="number"
                        max="100"
                        min="0"
                        value={formData.treasuryAllocation || 40}
                        onChange={(e) =>
                          handleInputChange(
                            "treasuryAllocation",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-s text-gray-400 font-mono">
                        Community (%)
                      </label>
                      <input
                        type="number"
                        max="100"
                        min="0"
                        value={formData.communityAllocation || 60}
                        onChange={(e) =>
                          handleInputChange(
                            "communityAllocation",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm font-mono"
                      />
                    </div>
                  </div>
                  {errors.distributionError && (
                    <p className="text-red-400 text-sm mt-1 font-mono">
                      {errors.distributionError}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="text-l text-gray-300 mt-3 font-mono">
                Token pricing will be determined by market dynamics. Configure
                how tokens are initially distributed in the <b>*Initial Distribution Stratagy*</b> section.
              </div>
              <div className="text-s text-cyan-400 mt-2 font-mono">
                💡 Price discovery happens through trading. Focus on utility
                and community value.
              </div>
            </div>
          </div>
        );

      case 3: // Governance
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                  Voting Period (days)
                </label>
                <select
                  value={Math.floor(parseInt(formData.votingPeriod) / 86400)}
                  onChange={(e) =>
                    handleInputChange(
                      "votingPeriod",
                      (parseInt(e.target.value) * 86400).toString()
                    )
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                >
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                  Quorum Threshold (%)
                </label>
                <input
                  type="number"
                  value={formData.quorumThreshold}
                  onChange={(e) =>
                    handleInputChange("quorumThreshold", e.target.value)
                  }
                  placeholder="10"
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                  Proposal Threshold (%)
                </label>
                <input
                  type="number"
                  value={formData.proposalThreshold}
                  onChange={(e) =>
                    handleInputChange("proposalThreshold", e.target.value)
                  }
                  placeholder="1"
                  min="0.1"
                  max="10"
                  step="0.1"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                />
              </div>
            </div>
          </div>
        );

      case 4: // Funding
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                  Funding Goal (USD) *
                </label>
                <input
                  type="number"
                  value={formData.fundingGoal}
                  onChange={(e) =>
                    handleInputChange("fundingGoal", e.target.value)
                  }
                  placeholder="100000"
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                    errors.fundingGoal ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.fundingGoal && (
                  <p className="text-red-400 text-sm mt-1 font-mono">
                    {errors.fundingGoal}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                  Funding Duration (days)
                </label>
                <select
                  value={Math.floor(parseInt(formData.fundingDuration) / 86400)}
                  onChange={(e) =>
                    handleInputChange(
                      "fundingDuration",
                      (parseInt(e.target.value) * 86400).toString()
                    )
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">
                Minimum Investment (USD) *
              </label>
              <input
                type="number"
                value={formData.minInvestment}
                onChange={(e) =>
                  handleInputChange("minInvestment", e.target.value)
                }
                placeholder="100"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                  errors.minInvestment ? "border-red-500" : "border-gray-600"
                }`}
              />
              {errors.minInvestment && (
                <p className="text-red-400 text-sm mt-1 font-mono">
                  {errors.minInvestment}
                </p>
              )}
            </div>
          </div>
        );

      case 5: // Team
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white font-mono">
                TEAM MEMBERS
              </h3>
              <button
                type="button"
                onClick={addTeamMember}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors font-mono"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold font-mono">
                      Member {index + 1}
                    </h4>
                    {formData.teamMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) =>
                        updateTeamMember(index, "name", e.target.value)
                      }
                      placeholder="Full Name"
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                    />
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) =>
                        updateTeamMember(index, "role", e.target.value)
                      }
                      placeholder="Role/Position"
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                    />
                    <input
                      type="text"
                      value={member.wallet}
                      onChange={(e) =>
                        updateTeamMember(index, "wallet", e.target.value)
                      }
                      placeholder="Principal ID (optional)"
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 6: // Launch
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 font-mono">
                READY TO LAUNCH!
              </h3>
              <p className="text-gray-400 mb-8">
                Review your DAO configuration and launch when ready
              </p>
            </div>

            {/* Configuration Summary */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
              <h4 className="text-lg font-bold text-white font-mono">
                CONFIGURATION SUMMARY
              </h4>

              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h5 className="text-cyan-400 font-semibold mb-2 font-mono">
                    Basic Info
                  </h5>
                  <div className="space-y-1">
                    <p>
                      <span className="text-gray-400">Name:</span>{" "}
                      <span className="text-white">{formData.daoName}</span>
                    </p>
                    <p>
                      <span className="text-gray-400">Category:</span>{" "}
                      <span className="text-white">{formData.category}</span>
                    </p>
                    <p>
                      <span className="text-gray-400">Website:</span>{" "}
                      <span className="text-white">
                        {formData.website || "Not provided"}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="text-cyan-400 font-semibold mb-2 font-mono">
                    Tokenomics
                  </h5>
                  <div className="space-y-1">
                    <p>
                      <span className="text-gray-400">Token:</span>{" "}
                      <span className="text-white">
                        {formData.tokenName} ({formData.tokenSymbol})
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">Supply:</span>{" "}
                      <span className="text-white">
                        {parseInt(formData.totalSupply || 0).toLocaleString()}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">Distribution:</span>{" "}
                      <span className="text-white">
                        Treasury {formData.treasuryAllocation}% / Community{" "}
                        {formData.communityAllocation}%
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="text-cyan-400 font-semibold mb-2 font-mono">
                    Governance
                  </h5>
                  <div className="space-y-1">
                    <p>
                      <span className="text-gray-400">Voting Period:</span>{" "}
                      <span className="text-white">
                        {Math.floor(parseInt(formData.votingPeriod) / 86400)}{" "}
                        days
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">Quorum:</span>{" "}
                      <span className="text-white">
                        {formData.quorumThreshold}%
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">Proposal Threshold:</span>{" "}
                      <span className="text-white">
                        {formData.proposalThreshold}%
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="text-cyan-400 font-semibold mb-2 font-mono">
                    Funding
                  </h5>
                  <div className="space-y-1">
                    <p>
                      <span className="text-gray-400">Goal:</span>{" "}
                      <span className="text-white">
                        ${parseInt(formData.fundingGoal || 0).toLocaleString()}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">Duration:</span>{" "}
                      <span className="text-white">
                        {Math.floor(parseInt(formData.fundingDuration) / 86400)}{" "}
                        days
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">Min Investment:</span>{" "}
                      <span className="text-white">
                        ${formData.minInvestment}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) =>
                    handleInputChange("termsAccepted", e.target.checked)
                  }
                  className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 mt-1"
                />
                <div>
                  <span className="text-white font-semibold">
                    I accept the Terms and Conditions *
                  </span>
                  <p className="text-gray-400 text-sm mt-1">
                    By checking this box, you agree to our Terms of Service and
                    acknowledge that you understand the risks involved in
                    creating and managing a DAO.
                  </p>
                </div>
              </label>
              {errors.termsAccepted && (
                <p className="text-red-400 text-sm mt-2 font-mono">
                  {errors.termsAccepted}
                </p>
              )}
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.kycRequired}
                  onChange={(e) =>
                    handleInputChange("kycRequired", e.target.checked)
                  }
                  className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 mt-1"
                />
                <div>
                  <span className="text-white font-semibold">
                    Require KYC for members
                  </span>
                  <p className="text-gray-400 text-sm mt-1">
                    Enable Know Your Customer (KYC) verification for DAO
                    members. This may be required for certain jurisdictions or
                    investment types.
                  </p>
                </div>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24 sm:pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text mb-4 font-mono">
            CREATE YOUR DAO
          </h1>
          <p className="text-gray-400 text-lg">
            Build the future of decentralized governance
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    index <= currentStep
                      ? "bg-cyan-500 border-cyan-500 text-white"
                      : "border-gray-600 text-gray-400"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs mt-2 text-center font-mono hidden sm:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-gray-900/50 border border-cyan-500/30 rounded-xl backdrop-blur-sm p-8 mb-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 font-mono">
              {steps[currentStep].title.toUpperCase()}
            </h2>
            <p className="text-gray-400">{steps[currentStep].description}</p>
          </div>

          {renderStepContent()}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center"
        >
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep === steps.length - 1 ? (
            <motion.button
              onClick={handleLaunchDAO}
              disabled={isSubmitting || launchLoading || managementLoading}
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed font-mono relative overflow-hidden group"
            >
              {isSubmitting || launchLoading || managementLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>LAUNCHING...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  <span>LAUNCH DAO</span>
                </>
              )}
              {!isSubmitting && (
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
            </motion.button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold font-mono"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Error Display */}
        {(launchError || Object.keys(errors).length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center"
          >
            <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
            <div>
              {launchError && (
                <p className="text-red-400 font-mono">{launchError}</p>
              )}
              {Object.keys(errors).length > 0 && (
                <p className="text-red-400 font-mono">
                  Please fix the errors above before continuing
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && launchedDAO && (
          <LaunchSuccess
            daoData={launchedDAO}
            onClose={() => setShowSuccess(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LaunchDAO;
