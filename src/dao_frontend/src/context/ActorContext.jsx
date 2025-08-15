import { createContext, useContext, useState, useEffect } from 'react';
import { initializeAgents } from '../config/agent';

const ActorContext = createContext(null);

export const ActorProvider = ({ children }) => {
    const [actors, setActors] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const setup = async () => {
            try {
                const initializedActors = await initializeAgents();
                setActors(initializedActors);
            } catch (err) {
                console.error('Failed to initialize actors:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        setup();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen text-red-600">
            Error: {error}
        </div>;
    }

    return (
        <ActorContext.Provider value={actors}>
            {children}
        </ActorContext.Provider>
    );
};

export const useActors = () => {
    const context = useContext(ActorContext);
    if (!context) {
        throw new Error('useActors must be used within an ActorProvider');
    }
    return context;
};
