import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '@declarations/dao_backend/dao_backend.did.js';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap the app and provide auth state

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userSettings, setUserSettings] = useState({
    displayName: 'Anonymous User'
  });
  const [displayName, setDisplayName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Loading state for login process
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(true);



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

      setIsLoggingIn(true); // Start loading

      await client.login({
        identityProvider,
        onSuccess: async () => {
          const currentIdentity = client.getIdentity();
          const principal = currentIdentity.getPrincipal();
          const principalId = principal.toString();

          try {
            // Create actor to call backend
            const canisterId = import.meta.env.VITE_CANISTER_ID_DAO_BACKEND;
            const agent = new HttpAgent({
              identity: currentIdentity,
              host: import.meta.env.VITE_DFX_NETWORK === "ic" 
                ? "https://ic0.app"
                : `http://localhost:4943`
            });

            // Fetch root key for local development
            if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
              await agent.fetchRootKey();
            }

            const actor = Actor.createActor(idlFactory, {
              agent,
              canisterId
            });

            // Call getOrCreateUserProfile (auto-registration)
            console.log('Auto-registering/loading user profile...');
            const profile = await actor.getOrCreateUserProfile();
            console.log('Profile loaded:', profile);

            // Check if user has seen welcome popup
            const seenWelcome = await actor.hasUserSeenWelcome(principal);
            console.log('Has seen welcome:', seenWelcome);

            // Set all state
            setIsAuthenticated(true);
            setIdentity(currentIdentity);
            setPrincipal(principalId);
            setUserProfile(profile);
            setHasSeenWelcome(seenWelcome);

            // Set display name (use profile name or fallback to partial principal)
            const name = profile.displayName || `${principalId.slice(0, 5)}...${principalId.slice(-5)}`;
            setDisplayName(profile.displayName || '');
            setUserSettings({
              displayName: name
            });

            // Show welcome popup if conditions met
            if (!seenWelcome && !profile.displayName) {
              setShowWelcomePopup(true);
            }

            setIsLoggingIn(false); // End loading

          } catch (error) {
            console.error('Error during auto-registration:', error);
            // Fallback to basic authentication without profile
            setIsAuthenticated(true);
            setIdentity(currentIdentity);
            setPrincipal(principalId);
            setUserSettings({
              displayName: `${principalId.slice(0, 5)}...${principalId.slice(-5)}`
            });
            setIsLoggingIn(false); // End loading
          }
        },


        onError: (error) => {
          console.error("Login failed:", error);
          setIsLoggingIn(false); // End loading on error
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

  // Dismiss welcome popup permanently
  const dismissWelcomePopup = async () => {
    try {
      if (!identity) {
        console.warn('No identity available to dismiss welcome popup');
        return;
      }

      // Create actor to call backend
      const canisterId = import.meta.env.VITE_CANISTER_ID_DAO_BACKEND;
      const agent = new HttpAgent({
        identity: identity,
        host: import.meta.env.VITE_DFX_NETWORK === "ic" 
          ? "https://ic0.app"
          : `http://localhost:4943`
      });

      // Fetch root key for local development
      if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
        await agent.fetchRootKey();
      }

      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId
      });

      // Mark as seen in backend
      await actor.markWelcomeAsSeen();
      console.log('Welcome popup marked as seen');

      // Update local state
      setHasSeenWelcome(true);
      setShowWelcomePopup(false);
    } catch (error) {
      console.error('Error dismissing welcome popup:', error);
      // Still close popup locally even if backend call fails
      setShowWelcomePopup(false);
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
      setUserProfile(null);
      setHasSeenWelcome(true);
      setShowWelcomePopup(false);
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

  // Function to reload user profile (call after updating settings)
  const reloadUserProfile = async () => {
    if (!isAuthenticated || !authClient) {
      console.log("Not authenticated, skipping profile reload");
      return;
    }

    try {
      console.log("🔄 Reloading user profile...");
      const currentIdentity = authClient.getIdentity();
      const principal = currentIdentity.getPrincipal();
      const principalId = principal.toString();

      // Create actor to call backend
      const canisterId = import.meta.env.VITE_CANISTER_ID_DAO_BACKEND;
      const agent = new HttpAgent({
        identity: currentIdentity,
        host: import.meta.env.VITE_DFX_NETWORK === "ic" 
          ? "https://ic0.app"
          : `http://localhost:4943`
      });

      // Fetch root key for local development
      if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
        await agent.fetchRootKey();
      }

      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId
      });

      // Get fresh profile data
      const profile = await actor.getOrCreateUserProfile();
      console.log("✅ Profile reloaded:", profile);

      // Update all states
      setUserProfile(profile);
      const name = profile.displayName || `${principalId.slice(0, 5)}...${principalId.slice(-5)}`;
      setDisplayName(profile.displayName || '');
      setUserSettings({
        displayName: name,
        email: profile.email || '',
        bio: profile.bio || '',
        website: profile.website || '',
        notifications: profile.notifications || false,
        showBio: profile.showBio || false,
        showWebsite: profile.showWebsite || false
      });

      return profile;
    } catch (error) {
      console.error('❌ Error reloading profile:', error);
      return null;
    }
  };

  // Auth context value
  const value = {
    isAuthenticated,
    principal,
    userProfile,
    userSettings,
    displayName,
    loading,
    isLoggingIn, // Add login loading state
    login,
    logout,
    reloadUserProfile, // Add reload function
    dismissWelcomePopup,
    showWelcomePopup,
    hasSeenWelcome,
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
