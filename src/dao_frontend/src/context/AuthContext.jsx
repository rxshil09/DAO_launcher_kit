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
  const [displayName, setDisplayName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);



  // Initialize auth client and check authentication status
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Ensure WebCrypto (SubtleCrypto) availability; polyfill if needed
        let cryptoImpl = (typeof window !== 'undefined' && window.crypto && window.crypto.subtle)
          ? window.crypto
          : undefined;
        if (!cryptoImpl) {
          try {
            const { Crypto } = await import('@peculiar/webcrypto');
            cryptoImpl = new Crypto();
            if (typeof globalThis !== 'undefined') {
              // @ts-ignore
              globalThis.crypto = cryptoImpl;
            }
          } catch (e) {
            console.warn('WebCrypto polyfill not available:', e);
          }
        }
        const client = await AuthClient.create({ crypto: cryptoImpl });
        setAuthClient(client);

        // Check if user is already authenticated

        const isAuthenticated = await client.isAuthenticated();
        

        if (isAuthenticated) {
          const currentIdentity = client.getIdentity();
          const principalId = currentIdentity.getPrincipal().toString();
          const displayName = `User ${principalId.slice(0, 8)}`;

          setIsAuthenticated(true);
          setIdentity(currentIdentity);
          setPrincipal(principalId);
          setUserSettings({
            displayName
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
    try {
      setLoading(true);
      // Lazily initialize if not yet available
      let client = authClient;
      if (!client) {
        let cryptoImpl = (typeof window !== 'undefined' && window.crypto && window.crypto.subtle)
          ? window.crypto
          : undefined;
        if (!cryptoImpl) {
          try {
            const { Crypto } = await import('@peculiar/webcrypto');
            cryptoImpl = new Crypto();
            if (typeof globalThis !== 'undefined') {
              // @ts-ignore
              globalThis.crypto = cryptoImpl;
            }
          } catch (e) {
            console.warn('WebCrypto polyfill not available:', e);
          }
        }
        client = await AuthClient.create({ crypto: cryptoImpl });
        setAuthClient(client);
      }
      
      const identityProvider = import.meta.env.VITE_DFX_NETWORK === "ic" 
        ? "https://identity.ic0.app"
        : `http://${import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;


      await client.login({
        identityProvider,
        onSuccess: async () => {
          const currentIdentity = client.getIdentity();
          const principal = currentIdentity.getPrincipal();


          const principalId = principal.toString();
          const displayName = `User ${principalId.slice(0, 8)}`;

          setIsAuthenticated(true);


          setIdentity(currentIdentity);
          setPrincipal(principalId);
          setUserSettings({
            displayName
          });
        },


        onError: (error) => {
          console.error("Login failed:", error);
          setLoading(false);
          throw error;
        },
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load user display name from backend
  const loadUserDisplayName = async (daoBackend) => {
    if (!principal || !daoBackend) {
      return;
    }

    try {
      // Try to get user settings first
      const settings = await daoBackend.getMySettings();
      if (settings && settings.length > 0) {
        const userDisplayName = settings[0].displayName;
        setDisplayName(userDisplayName);
        setUserSettings(prev => ({
          ...prev,
          displayName: userDisplayName
        }));
      } else {
        // Fallback to old profile format
        const profile = await daoBackend.getUserProfile(principal);
        if (profile && profile.length > 0) {
          const userDisplayName = profile[0].displayName;
          setDisplayName(userDisplayName);
          setUserSettings(prev => ({
            ...prev,
            displayName: userDisplayName
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user display name:', error);
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
      setIdentity(null);
      setDisplayName(null);
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
    displayName,
    loading,
    login,
    logout,
    loadUserDisplayName,
    authClient,
    identity
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
