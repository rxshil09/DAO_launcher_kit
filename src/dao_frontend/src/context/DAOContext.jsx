import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Create the DAO Context
const DAOContext = createContext();

// DAO Provider component
export const DAOProvider = ({ children }) => {
  const { isAuthenticated, principal } = useAuth();
  const [activeDAO, setActiveDAO] = useState(null);
  const [userDAOs, setUserDAOs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if user has any DAOs when authenticated
  useEffect(() => {
    if (isAuthenticated && principal) {
      checkUserDAOs();
    } else {
      setActiveDAO(null);
      setUserDAOs([]);
    }
  }, [isAuthenticated, principal]);

  const checkUserDAOs = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual DAO fetching from backend
      // For now, we'll check localStorage for any launched DAOs
      const launchedDAOs = localStorage.getItem(`daos_${principal}`);
      if (launchedDAOs) {
        const daos = JSON.parse(launchedDAOs);
        setUserDAOs(daos);
        // Set the first DAO as active if none is selected
        if (daos.length > 0 && !activeDAO) {
          setActiveDAO(daos[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user DAOs:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectDAO = (dao) => {
    setActiveDAO(dao);
    localStorage.setItem(`activeDAO_${principal}`, JSON.stringify(dao));
  };

  const addUserDAO = (dao) => {
    const updatedDAOs = [...userDAOs, dao];
    setUserDAOs(updatedDAOs);
    setActiveDAO(dao);
    localStorage.setItem(`daos_${principal}`, JSON.stringify(updatedDAOs));
    localStorage.setItem(`activeDAO_${principal}`, JSON.stringify(dao));
  };

  const removeUserDAO = (daoId) => {
    const updatedDAOs = userDAOs.filter(dao => dao.id !== daoId);
    setUserDAOs(updatedDAOs);
    if (activeDAO?.id === daoId) {
      setActiveDAO(updatedDAOs.length > 0 ? updatedDAOs[0] : null);
    }
    localStorage.setItem(`daos_${principal}`, JSON.stringify(updatedDAOs));
  };

  const hasActiveDAO = activeDAO !== null;

  const value = {
    activeDAO,
    userDAOs,
    hasActiveDAO,
    loading,
    selectDAO,
    addUserDAO,
    removeUserDAO,
    checkUserDAOs
  };

  return (
    <DAOContext.Provider value={value}>
      {children}
    </DAOContext.Provider>
  );
};

// Custom hook to use the DAO context
export const useDAO = () => {
  const context = useContext(DAOContext);
  if (context === undefined) {
    throw new Error('useDAO must be used within a DAOProvider');
  }
  return context;
};
