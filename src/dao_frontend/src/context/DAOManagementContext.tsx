import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DAO, DAOContextType } from '../types/dao';

const DAOManagementContext = createContext<DAOContextType | undefined>(undefined);

// Mock data for demonstration
const mockDAOs: DAO[] = [
  {
    id: 'defi-protocol-1',
    name: 'DeFi Protocol Alpha',
    description: 'A revolutionary decentralized finance protocol focused on yield optimization and automated market making strategies.',
    tokenSymbol: 'DPA',
    logo: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400',
    memberCount: 1247,
    totalValueLocked: '$2.4M',
    createdAt: new Date('2024-01-15'),
    category: 'DeFi',
    status: 'active',
    governance: {
      totalProposals: 23,
      activeProposals: 3
    },
    treasury: {
      balance: '$850K',
      monthlyInflow: '+$45K'
    },
    staking: {
      totalStaked: '$1.2M',
      apr: '18.5%'
    }
  },
  {
    id: 'gaming-dao-2',
    name: 'MetaVerse Gaming DAO',
    description: 'Community-owned gaming ecosystem with play-to-earn mechanics and NFT integration for the next generation of gamers.',
    tokenSymbol: 'MVG',
    logo: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400',
    memberCount: 3456,
    totalValueLocked: '$5.7M',
    createdAt: new Date('2024-02-20'),
    category: 'Gaming',
    status: 'active',
    governance: {
      totalProposals: 45,
      activeProposals: 7
    },
    treasury: {
      balance: '$2.1M',
      monthlyInflow: '+$120K'
    },
    staking: {
      totalStaked: '$3.6M',
      apr: '22.3%'
    }
  },
  {
    id: 'social-dao-3',
    name: 'Creator Economy DAO',
    description: 'Empowering content creators through decentralized governance and fair revenue sharing mechanisms.',
    tokenSymbol: 'CED',
    logo: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
    memberCount: 892,
    totalValueLocked: '$1.8M',
    createdAt: new Date('2024-03-10'),
    category: 'Social',
    status: 'active',
    governance: {
      totalProposals: 12,
      activeProposals: 2
    },
    treasury: {
      balance: '$650K',
      monthlyInflow: '+$28K'
    },
    staking: {
      totalStaked: '$1.1M',
      apr: '15.7%'
    }
  }
];

interface DAOManagementProviderProps {
  children: ReactNode;
}

export const DAOManagementProvider: React.FC<DAOManagementProviderProps> = ({ children }) => {
  const [daos, setDAOs] = useState<DAO[]>([]);
  const [selectedDAO, setSelectedDAO] = useState<DAO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDAOs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDAOs(mockDAOs);
    } catch (err) {
      setError('Failed to fetch DAOs');
    } finally {
      setLoading(false);
    }
  };

  const selectDAO = (dao: DAO) => {
    setSelectedDAO(dao);
  };

  const createDAO = async (daoData: Partial<DAO>) => {
    setLoading(true);
    try {
      // Simulate DAO creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newDAO: DAO = {
        id: `dao-${Date.now()}`,
        name: daoData.name || 'New DAO',
        description: daoData.description || 'A new decentralized autonomous organization',
        tokenSymbol: daoData.tokenSymbol || 'NEW',
        memberCount: 1,
        totalValueLocked: '$0',
        createdAt: new Date(),
        category: daoData.category || 'Other',
        status: 'active',
        governance: {
          totalProposals: 0,
          activeProposals: 0
        },
        treasury: {
          balance: '$0',
          monthlyInflow: '$0'
        },
        staking: {
          totalStaked: '$0',
          apr: '0%'
        },
        ...daoData
      };
      setDAOs(prev => [...prev, newDAO]);
      setSelectedDAO(newDAO);
    } catch (err) {
      setError('Failed to create DAO');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDAOs();
  }, []);

  const value: DAOContextType = {
    daos,
    selectedDAO,
    loading,
    error,
    fetchDAOs,
    selectDAO,
    createDAO
  };

  return (
    <DAOManagementContext.Provider value={value}>
      {children}
    </DAOManagementContext.Provider>
  );
};

export const useDAOManagement = (): DAOContextType => {
  const context = useContext(DAOManagementContext);
  if (context === undefined) {
    throw new Error('useDAOManagement must be used within a DAOManagementProvider');
  }
  return context;
};