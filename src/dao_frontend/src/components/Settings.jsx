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
  const { isAuthenticated, principal, userSettings, logout, loading } = useAuth();
  const actors = useActors();
  const daoBackend = actors?.daoBackend;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPrincipal, setShowPrincipal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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
      showProfile: true,
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

    setIsSaving(true);
    try {
      const result = await daoBackend.updateUserProfile(
        formData.displayName,
        formData.bio
      );

      if ('ok' in result) {
        setSaveMessage('Settings saved successfully!');
      } else {
        setSaveMessage(`Failed to save settings: ${result.err}`);
      }
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save settings');
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

  if (loading) {
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
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">Display Name</label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                        placeholder="Enter your display name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">Email (Optional)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white font-mono"
                      placeholder="https://your-website.com"
                    />
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
                  
                  <div className="space-y-4">
                    {Object.entries(formData.privacy).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
                        <div>
                          <h3 className="text-white font-semibold font-mono capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {key === 'showProfile' && 'Make your profile visible to other users'}
                            {key === 'showInvestments' && 'Display your investment portfolio publicly'}
                            {key === 'showActivity' && 'Show your recent DAO activity'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNestedChange('privacy', key, !value)}
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
      </div>
    </div>
  );
};

export default Settings;