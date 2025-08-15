import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { dao_backend } from '../declarations/dao_backend';

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
      if (!dao_backend || !principal) {
        setUserDAOs([]);
        setActiveDAO(null);
        return;
      }

      const response = await dao_backend.getAllUsers();
      let daos = [];

      if (Array.isArray(response)) {
        const currentUser = response.find((u) => {
          try {
            const id = typeof u.id === 'string' ? u.id : u.id?.toText?.();
            return id === principal;
          } catch {
            return false;
          }
        });
        if (currentUser && Array.isArray(currentUser.daos)) {
          daos = currentUser.daos;
        } else if (!currentUser && response.length && response[0].daos === undefined) {
          // If the API returns a direct list of DAOs instead of user profiles
          daos = response;
        }
      }

      setUserDAOs(daos);
      if (daos.length > 0) {
        setActiveDAO((prev) => prev || daos[0]);
      } else {
        setActiveDAO(null);
      }
    } catch (error) {
      console.error('Failed to fetch user DAOs:', error);
      if (process.env.NODE_ENV !== 'production') {
        const launchedDAOs = localStorage.getItem(`daos_${principal}`);
        if (launchedDAOs) {
          const daos = JSON.parse(launchedDAOs);
          setUserDAOs(daos);
          if (daos.length > 0 && !activeDAO) {
            setActiveDAO(daos[0]);
          }
        } else {
          setUserDAOs([]);
          setActiveDAO(null);
        }
      } else {
        setUserDAOs([]);
        setActiveDAO(null);
      }
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
