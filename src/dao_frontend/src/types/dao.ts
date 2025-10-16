export interface DAO {
  id: string;
  name: string;
  description: string;
  tokenSymbol: string;
  logo?: string;
  logoUrl?: string; // External URL for logo
  logoAssetId?: string; // Asset ID for uploaded logo
  logoType?: 'upload' | 'url' | 'none'; // Type of logo source
  website?: string; // Optional website URL
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

export interface DAOMetadata {
  dao_id: string;
  name: string;
  description: string;
  creator_principal: string;
  creation_date: number;
  member_count: number;
  category: string;
  is_public: boolean;
  dao_canister_id: string;
  website?: string;
  logo_url?: string;
  logo_asset_id?: string; // Asset ID for uploaded logos
  logo_type?: string; // 'upload' or 'url'
  token_symbol?: string;
  total_value_locked: number;
  active_proposals: number;
  last_activity: number;
}

export interface DAOStats {
  dao_id: string;
  member_count: number;
  total_proposals: number;
  active_proposals: number;
  total_staked: number;
  treasury_balance: number;
  governance_participation: number;
  last_updated: number;
}

export interface SearchFilters {
  category?: string;
  min_members?: number;
  max_members?: number;
  created_after?: number;
  created_before?: number;
  is_public?: boolean;
}

export type SortOption = 'newest' | 'oldest' | 'most_members' | 'most_active' | 'highest_tvl';

export interface PaginationResult<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface DAOContextType {
  daos: DAO[];
  selectedDAO: DAO | null;
  loading: boolean;
  error: string | null;
  fetchDAOs: () => Promise<void>;
  selectDAO: (dao: DAO) => void;
  createDAO: (daoData: Partial<DAO>) => Promise<void>;
  refreshDAOs: () => Promise<void>;
  deleteDAO: (daoId: string) => Promise<void>;
}

export interface DAOFormData {
  daoName: string;
  description: string;
  category: string;
  website: string;
  selectedModules: string[];
  selectedFeatures: Record<string, Record<string, boolean>>;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: string;
  treasuryAllocation: string;
  communityAllocation: string;
  votingPeriod: string;
  quorumThreshold: string;
  proposalThreshold: string;
  fundingGoal: string;
  fundingDuration: string;
  minInvestment: string;
  teamMembers: Array<{
    name: string;
    role: string;
    wallet: string;
  }>;
  termsAccepted: boolean;
  kycRequired: boolean;
}