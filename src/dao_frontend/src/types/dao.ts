export interface DAO {
  id: string;
  name: string;
  description: string;
  tokenSymbol: string;
  logo?: string;
  memberCount: number;
  totalValueLocked: string;
  createdAt: Date;
  category: string;
  status: 'active' | 'pending' | 'paused';
  governance: {
    totalProposals: number;
    activeProposals: number;
  };
  treasury: {
    balance: string;
    monthlyInflow: string;
  };
  staking: {
    totalStaked: string;
    apr: string;
  };
}

export interface DAOContextType {
  daos: DAO[];
  selectedDAO: DAO | null;
  loading: boolean;
  error: string | null;
  fetchDAOs: () => Promise<void>;
  selectDAO: (dao: DAO) => void;
  createDAO: (daoData: Partial<DAO>) => Promise<void>;
}