import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [authClient, setAuthClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const client = await AuthClient.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true
        }
      });
      setAuthClient(client);
      
      const authenticated = await client.isAuthenticated();
      if (authenticated) {
        const identity = client.getIdentity();
        const principalId = identity.getPrincipal().toText();
        setPrincipal(principalId);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!authClient) {
      console.error('Auth client not initialized');
      throw new Error('Auth client not initialized');
    }
    
    try {
      const APP_NAME = "DAOVerse";
      const APP_LOGO = "https://via.placeholder.com/150x150/6366f1/ffffff?text=DAO";
      const MAX_TIME_TO_LIVE = BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000); // 7 days in nanoseconds
      
      return new Promise((resolve, reject) => {
        authClient.login({
          identityProvider: import.meta.env.VITE_DFX_NETWORK === "local" 
            ? `http://localhost:4943/?canisterId=${import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY}` 
            : "https://identity.ic0.app",
          maxTimeToLive: MAX_TIME_TO_LIVE,
          windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
          onSuccess: async () => {
            try {
              const identity = authClient.getIdentity();
              const principalId = identity.getPrincipal().toText();
              setPrincipal(principalId);
              setIsAuthenticated(true);
              resolve();
            } catch (error) {
              console.error('Error after successful login:', error);
              reject(error);
            }
          },
          onError: (error) => {
            console.error('Login failed:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!authClient) return;
    
    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    principal,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};