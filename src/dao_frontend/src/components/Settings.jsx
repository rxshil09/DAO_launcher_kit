import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useActors } from '../context/ActorContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Lock,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  Settings as SettingsIcon,
  Smartphone,
  Mail,
  Key,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Loader2
} from 'lucide-react';

const Settings = () => {
  const { isAuthenticated, principal, userSettings, logout, loading, userProfile, reloadUserProfile } = useAuth();
  const actors = useActors();
  const daoBackend = actors?.daoBackend;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPrincipal, setShowPrincipal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [lockedFields, setLockedFields] = useState({
    displayName: false,
    email: false,
    bio: false,
    website: false
  });

  const [formData, setFormData] = useState({
    displayName: userSettings?.displayName || '',
    email: '',
    bio: '',
    website: '',
    notifications: {
      email: true,
      push: true,
      proposals: true,
      investments: true
    },
    privacy: {
      showProfile: {
        displayName: true,  // Always true (not editable)
        bio: true,
        website: true
      },
      showInvestments: false,
      showActivity: true
    },
    theme: 'dark'
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, loading, navigate]);

  // Load user settings from backend
  React.useEffect(() => {
    const loadUserProfile = async () => {
      if (!daoBackend || !principal || !isAuthenticated) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        console.log('Loading user settings for:', principal);
        
        // Load user's own settings (full access)
        const settings = await daoBackend.getMySettings();
        console.log('Settings loaded:', settings);

        if (settings && settings.length > 0) {
          const userSettings = settings[0];
          setFormData(prev => ({
            ...prev,
            displayName: userSettings.displayName || '',
            email: userSettings.email[0] || '',
            bio: userSettings.bio || '',
            website: userSettings.website[0] || '',
            privacy: userSettings.privacy
          }));
          setLockedFields(userSettings.lockedFields);
          console.log('Settings loaded successfully');
        } else {
          // Try loading from old profile format (backward compatibility)
          const profile = await daoBackend.getUserProfile(principal);
          if (profile && profile.length > 0) {
            const userProfile = profile[0];
            setFormData(prev => ({
              ...prev,
              displayName: userProfile.displayName || '',
              bio: userProfile.bio || ''
            }));
            console.log('Loaded from legacy profile format');
          }
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [daoBackend, principal, isAuthenticated]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!daoBackend) {
      setSaveMessage('Backend unavailable');
      return;
    }

    // Check if any unlocked fields are being edited for the first time
    const fieldsBeingLocked = [];
    if (!lockedFields.displayName && formData.displayName) fieldsBeingLocked.push('Display Name');
    if (!lockedFields.email && formData.email) fieldsBeingLocked.push('Email');
    if (!lockedFields.bio && formData.bio) fieldsBeingLocked.push('Bio');
    if (!lockedFields.website && formData.website) fieldsBeingLocked.push('Website');

    // Show confirmation dialog if fields will be locked
    if (fieldsBeingLocked.length > 0 && !showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }

    setShowConfirmDialog(false);
    setIsSaving(true);
    try {
      console.log('Saving settings:', formData);

      const result = await daoBackend.updateUserSettings(
        formData.displayName,
        formData.email ? [formData.email] : [],
        formData.bio,
        formData.website ? [formData.website] : [],
        formData.privacy
      );

      console.log('Save result:', result);

      if ('ok' in result) {
        setSaveMessage('✅ Settings saved successfully!');
        
        // Reload settings to get updated lock status
        const updatedSettings = await daoBackend.getMySettings();
        if (updatedSettings && updatedSettings.length > 0) {
          setLockedFields(updatedSettings[0].lockedFields);
        }
        
        // 🔥 RELOAD USER PROFILE to update Navbar display name
        console.log("🔄 Reloading user profile after save...");
        await reloadUserProfile();
        console.log("✅ Profile reloaded - Navbar should update now");
        
        setTimeout(() => setSaveMessage(''), 5000);
      } else {
        setSaveMessage(`❌ ${result.err}`);
        setTimeout(() => setSaveMessage(''), 5000);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage(`Error: ${error.message || 'Failed to save settings'}`);
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const copyPrincipal = () => {
    navigator.clipboard.writeText(principal);
    setSaveMessage('Principal ID copied to clipboard!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Eye }
  ];

  // Component to show lock icon on locked fields
  const FieldLockIcon = ({ locked }) => {
    if (!locked) return null;
    return (
      <div className="absolute right-3 top-3 flex items-center gap-2">
        <Lock className="w-4 h-4 text-yellow-400" />
        <span className="text-xs text-yellow-400">Locked</span>
      </div>
    );
  };

  // Warning banner about locked fields
  const LockedFieldsWarning = () => {
    const hasLockedFields = Object.values(lockedFields).some(locked => locked);
    if (!hasLockedFields) return null;
    
    const lockedFieldNames = Object.entries(lockedFields)
      .filter(([_, locked]) => locked)
      .map(([field, _]) => field.replace(/([A-Z])/g, ' $1').trim())
      .map(field => field.charAt(0).toUpperCase() + field.slice(1));
    
    return (
      <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-yellow-400 font-medium mb-1">Some Fields Are Locked</h4>
            <p className="text-gray-300 text-sm mb-2">
              The following fields have been edited and cannot be changed again:
            </p>
            <p className="text-yellow-200 text-sm font-medium">
              {lockedFieldNames.join(', ')}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              ℹ️ Privacy settings can always be updated
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-400 font-mono">Loading settings...</p>
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
      {/* Background Particles */}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24 sm:pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-mono">Back to Dashboard</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-mono">
                SETTINGS
              </h1>
              <p className="text-cyan-400 font-mono">
                {'>'} Configure your DAO experience
              </p>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-4 rounded-lg border flex items-center ${
                saveMessage.includes('success') 
                  ? 'bg-green-500/20 border-green-500/30 text-green-400'
                  : saveMessage.includes('copied')
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                  : 'bg-red-500/20 border-red-500/30 text-red-400'
              }`}
            >
              {saveMessage.includes('success') ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : saveMessage.includes('copied') ? (
                <Copy className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              <span className="font-mono">{saveMessage}</span>
            </motion.div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-900/50 border border-cyan-500/30 rounded-xl backdrop-blur-sm p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all font-mono ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-gray-900/50 border border-cyan-500/30 rounded-xl backdrop-blur-sm p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6 font-mono">Profile Settings</h2>
                  
                  <LockedFieldsWarning />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">Display Name</label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        disabled={lockedFields.displayName}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                          lockedFields.displayName 
                            ? 'border-yellow-500/30 opacity-60 cursor-not-allowed' 
                            : 'border-gray-600'
                        }`}
                        placeholder="Enter your display name"
                      />
                      <FieldLockIcon locked={lockedFields.displayName} />
                      {!lockedFields.displayName && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Can only be edited once
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">Email (Optional)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={lockedFields.email}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                          lockedFields.email 
                            ? 'border-yellow-500/30 opacity-60 cursor-not-allowed' 
                            : 'border-gray-600'
                        }`}
                        placeholder="your@email.com"
                      />
                      <FieldLockIcon locked={lockedFields.email} />
                      {!lockedFields.email && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Can only be edited once
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={lockedFields.bio}
                      rows={4}
                      className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono resize-none ${
                        lockedFields.bio 
                          ? 'border-yellow-500/30 opacity-60 cursor-not-allowed' 
                          : 'border-gray-600'
                      }`}
                      placeholder="Tell us about yourself..."
                    />
                    <FieldLockIcon locked={lockedFields.bio} />
                    {!lockedFields.bio && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Can only be edited once
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={lockedFields.website}
                      className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono ${
                        lockedFields.website 
                          ? 'border-yellow-500/30 opacity-60 cursor-not-allowed' 
                          : 'border-gray-600'
                      }`}
                      placeholder="https://your-website.com"
                    />
                    <FieldLockIcon locked={lockedFields.website} />
                    {!lockedFields.website && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Can only be edited once
                      </p>
                    )}
                  </div>

                  {/* Principal ID Display */}
                  <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-300 font-mono">Principal ID</label>
                      <button
                        onClick={() => setShowPrincipal(!showPrincipal)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {showPrincipal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 text-cyan-400 font-mono text-sm bg-gray-900/50 px-3 py-2 rounded border">
                        {showPrincipal ? principal : '•'.repeat(principal?.length || 0)}
                      </code>
                      <button
                        onClick={copyPrincipal}
                        className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Info banner about display name visibility */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-200 text-sm font-medium mb-1">Display Name Visibility</p>
                        <p className="text-blue-300/80 text-xs">
                          Your <strong>display name</strong> will always be visible to other DAO members. 
                          You can control the visibility of your bio and website in the <strong>Privacy</strong> tab.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6 font-mono">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white font-mono">Internet Identity</h3>
                          <p className="text-gray-400 text-sm">Your secure blockchain identity</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-green-400 font-mono text-sm">Connected</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white font-mono">Two-Factor Authentication</h3>
                          <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                        </div>
                        <button className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors font-mono">
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white font-mono">Session Management</h3>
                          <p className="text-gray-400 text-sm">Manage your active sessions</p>
                        </div>
                        <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-mono">
                          Sign Out All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6 font-mono">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {Object.entries(formData.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
                        <div>
                          <h3 className="text-white font-semibold font-mono capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {key === 'email' && 'Receive notifications via email'}
                            {key === 'push' && 'Browser push notifications'}
                            {key === 'proposals' && 'New proposal notifications'}
                            {key === 'investments' && 'Investment updates and alerts'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNestedChange('notifications', key, !value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-cyan-500' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6 font-mono">Privacy Settings</h2>
                  
                  {/* Info banner */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-200 text-sm font-medium mb-1">Profile Visibility</p>
                        <p className="text-blue-300/80 text-xs">
                          Your <strong>display name</strong>, <strong>reputation</strong>, and <strong>voting power</strong> are always visible to DAO members. 
                          You can control the visibility of your bio and website below.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Profile Information Section */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white font-mono">Profile Information</h3>
                      
                      {/* Bio toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
                        <div>
                          <h4 className="text-white font-semibold font-mono">Show Bio</h4>
                          <p className="text-gray-400 text-sm">
                            Display your bio on your public profile
                          </p>
                        </div>
                        <button
                          onClick={() => handleNestedChange('privacy', 'showProfile', {
                            ...formData.privacy.showProfile,
                            bio: !formData.privacy.showProfile.bio
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.privacy.showProfile.bio ? 'bg-cyan-500' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.privacy.showProfile.bio ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Website toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
                        <div>
                          <h4 className="text-white font-semibold font-mono">Show Website</h4>
                          <p className="text-gray-400 text-sm">
                            Display your website link on your public profile
                          </p>
                        </div>
                        <button
                          onClick={() => handleNestedChange('privacy', 'showProfile', {
                            ...formData.privacy.showProfile,
                            website: !formData.privacy.showProfile.website
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.privacy.showProfile.website ? 'bg-cyan-500' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.privacy.showProfile.website ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Other Privacy Settings */}
                    <div className="space-y-3 pt-4 border-t border-gray-700">
                      <h3 className="text-lg font-semibold text-white font-mono">Additional Settings</h3>
                      
                      {/* Investments toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
                        <div>
                          <h4 className="text-white font-semibold font-mono">Show Investments</h4>
                          <p className="text-gray-400 text-sm">
                            Display your investment portfolio publicly
                          </p>
                        </div>
                        <button
                          onClick={() => handleNestedChange('privacy', 'showInvestments', !formData.privacy.showInvestments)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.privacy.showInvestments ? 'bg-cyan-500' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.privacy.showInvestments ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Activity toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
                        <div>
                          <h4 className="text-white font-semibold font-mono">Show Activity</h4>
                          <p className="text-gray-400 text-sm">
                            Show your recent DAO activity
                          </p>
                        </div>
                        <button
                          onClick={() => handleNestedChange('privacy', 'showActivity', !formData.privacy.showActivity)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.privacy.showActivity ? 'bg-cyan-500' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.privacy.showActivity ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-700">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 font-mono"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-yellow-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 font-mono">Confirm Save</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    You are about to save your profile information. <strong className="text-yellow-400">These fields cannot be changed after saving:</strong>
                  </p>
                  <ul className="space-y-1 mb-4">
                    {!lockedFields.displayName && formData.displayName && (
                      <li className="text-sm text-gray-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-yellow-400" />
                        Display Name: <strong>{formData.displayName}</strong>
                      </li>
                    )}
                    {!lockedFields.email && formData.email && (
                      <li className="text-sm text-gray-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-yellow-400" />
                        Email: <strong>{formData.email}</strong>
                      </li>
                    )}
                    {!lockedFields.bio && formData.bio && (
                      <li className="text-sm text-gray-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-yellow-400" />
                        Bio: <strong>{formData.bio.substring(0, 50)}...</strong>
                      </li>
                    )}
                    {!lockedFields.website && formData.website && (
                      <li className="text-sm text-gray-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-yellow-400" />
                        Website: <strong>{formData.website}</strong>
                      </li>
                    )}
                  </ul>
                  <p className="text-xs text-gray-400">
                    Are you sure you want to continue?
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all font-mono font-semibold"
                >
                  Yes, Save & Lock
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;