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

type Actors = Awaited<ReturnType<typeof initializeAgents>>;

const ActorContext = createContext<Actors | null>(null);

interface ActorProviderProps {
  children: ReactNode;
}

export const ActorProvider = ({ children }: ActorProviderProps) => {
  const [actors, setActors] = useState<Actors | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { identity } = useAuth();

  useEffect(() => {
    const setup = async () => {
      setLoading(true);
      try {
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
  }, [identity]);

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

export const useActors = () => {
  const context = useContext(ActorContext);
  // Don't throw error during loading phase, allow null context
  return context;
};

