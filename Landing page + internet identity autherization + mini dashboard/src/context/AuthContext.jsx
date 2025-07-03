import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap the app and provide auth state
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [userSettings, setUserSettings] = useState({
    displayName: 'Anonymous User'
  });
  const [loading, setLoading] = useState(true);
  const [authClient, setAuthClient] = useState(null);

  // Initialize auth client and check authentication status
  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);

        // Check if user is already authenticated
        const isAuthenticated = await client.isAuthenticated();
        
        if (isAuthenticated) {
          const identity = client.getIdentity();
          const principalId = identity.getPrincipal().toString();
          
          setIsAuthenticated(true);
          setPrincipal(principalId);
          setUserSettings({
            displayName: `User ${principalId.slice(0, 8)}`
          });
        }
      } catch (error) {
        console.error('Failed to initialize auth client:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function with Internet Identity using popup
  const login = async () => {
    if (!authClient) {
      throw new Error('Auth client not initialized');
    }

    try {
      setLoading(true);
      
      await new Promise((resolve, reject) => {
        authClient.login({
          // Always use the live Internet Identity service
          identityProvider: "https://identity.ic0.app",
          // Configure to use popup window instead of redirect
          windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
          onSuccess: resolve,
          onError: reject,
        });
      });

      const identity = authClient.getIdentity();
      const principalId = identity.getPrincipal().toString();
      
      setIsAuthenticated(true);
      setPrincipal(principalId);
      
      // Create user settings with display name derived from principal
      const newUserSettings = {
        displayName: `User ${principalId.slice(0, 8)}`
      };
      setUserSettings(newUserSettings);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    if (!authClient) {
      return;
    }

    try {
      setLoading(true);
      await authClient.logout();
      
      setIsAuthenticated(false);
      setPrincipal(null);
      setUserSettings({
        displayName: 'Anonymous User'
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Auth context value
  const value = {
    isAuthenticated,
    principal,
    userSettings,
    loading,
    login,
    logout,
    authClient
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;