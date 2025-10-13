/**
 * ActorContext - Centralized Canister Actor Management
 * 
 * This context provides authenticated actor instances for all backend canisters.
 * It handles the initialization, caching, and re-initialization of actors when
 * the user's authentication state changes.
 * 
 * Architecture:
 * - Initializes actors on mount and when identity changes
 * - Provides loading and error states for graceful UI handling
 * - Caches actor instances to avoid redundant initialization
 * - Handles both authenticated and anonymous access patterns
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const actors = useActors();
 *   
 *   const createProposal = async () => {
 *     const result = await actors.governance.createProposal(...);
 *   };
 * }
 * ```
 * 
 * @module ActorContext
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { initializeAgents } from "../config/agent";
// @ts-ignore - AuthContext is a .jsx file, ignore TypeScript error
import { useAuth } from "./AuthContext";

/**
 * Type representing all initialized canister actors
 * Includes: daoBackend, governance, staking, treasury, proposals, assets, daoRegistry, daoAnalytics
 */
type Actors = Awaited<ReturnType<typeof initializeAgents>>;

/**
 * React Context for sharing actor instances across the application
 */
const ActorContext = createContext<Actors | null>(null);

/**
 * Props for ActorProvider component
 */
interface ActorProviderProps {
  /** Child components that need access to actors */
  children: ReactNode;
}

/**
 * ActorProvider Component
 * 
 * Manages the lifecycle of canister actor instances:
 * 1. Initializes actors when the component mounts
 * 2. Re-initializes actors when user identity changes (login/logout)
 * 3. Provides loading state while actors are being initialized
 * 4. Handles and displays initialization errors
 * 
 * @component
 * @param {ActorProviderProps} props - Component props
 * @returns {JSX.Element} Provider component with loading/error states
 */
export const ActorProvider = ({ children }: ActorProviderProps) => {
  // State: Actor instances, loading status, and error messages
  const [actors, setActors] = useState<Actors | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get current user identity from AuthContext
  const { identity } = useAuth();

  /**
   * Effect: Initialize actors when identity changes
   * 
   * Triggers on:
   * - Initial component mount
   * - User login (identity changes from null to Identity)
   * - User logout (identity changes from Identity to null)
   * 
   * Process:
   * 1. Set loading state to true
   * 2. Call initializeAgents with current identity
   * 3. Store initialized actors in state
   * 4. Handle any initialization errors
   * 5. Set loading to false when complete
   */
  useEffect(() => {
    const setup = async () => {
      setLoading(true);
      try {
        // Initialize all canister actors with current identity
        const initializedActors = await initializeAgents(identity);
        setActors(initializedActors);
      } catch (err) {
        console.error("Failed to initialize actors:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    setup();
  }, [identity]); // Re-run when identity changes

  return (
    <ActorContext.Provider value={actors}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-screen text-red-600 p-4 text-center">
          <h1 className="text-xl font-bold mb-2">Configuration Error</h1>
          <p className="mb-2">{error}</p>
          <p>Please verify your environment configuration and canister IDs.</p>
        </div>
      ) : (
        children
      )}
    </ActorContext.Provider>
  );
};

/**
 * useActors Hook
 * 
 * Custom hook to access canister actor instances from ActorContext.
 * Returns null during initialization - components should handle this case.
 * 
 * @returns {Actors | null} Object containing all canister actors or null if not initialized
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const actors = useActors();
 *   
 *   if (!actors) {
 *     return <div>Loading...</div>;
 *   }
 *   
 *   // Use actors for canister calls
 *   const handleCreateProposal = async () => {
 *     const result = await actors.governance.createProposal(...);
 *   };
 * }
 * ```
 * 
 * Available Actors:
 * - actors.daoBackend - Main DAO coordinator
 * - actors.governance - Governance and voting
 * - actors.staking - Token staking
 * - actors.treasury - Treasury management
 * - actors.proposals - Proposal operations
 * - actors.assets - File storage
 * - actors.daoRegistry - DAO discovery
 * - actors.daoAnalytics - Platform analytics
 */
export const useActors = () => {
  const context = useContext(ActorContext);
  // Don't throw error during loading phase, allow null context
  // Components using this hook should check for null and handle loading state
  return context;
};

