import { createContext, useContext, useState, useEffect } from 'react';
import { initializeAgents } from '../config/agent';

const ActorContext = createContext<any>(null);

export const ActorProvider = ({ children }: { children: React.ReactNode }) => {
    const [actors, setActors] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const setup = async () => {
            try {
                const initializedActors = await initializeAgents();
                setActors(initializedActors);
            } catch (error) {
                console.error('Failed to initialize actors:', error);
            } finally {
                setLoading(false);
            }
        };
        setup();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
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