import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { initializeAgents } from "../config/agent";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <ActorContext.Provider value={actors}>{children}</ActorContext.Provider>
  );
};

export const useActors = (): Actors => {
  const context = useContext(ActorContext);
  if (!context) {
    throw new Error("useActors must be used within an ActorProvider");
  }
  return context;
};

