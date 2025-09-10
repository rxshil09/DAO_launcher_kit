import { Principal } from '@dfinity/principal';
import { DAOMetadata, DAOStats, SearchFilters, SortOption, PaginationResult } from '../types/dao';

/**
 * DAO Discovery API Service
 * 
 * This service provides a clean interface for interacting with the DAO registry
 * canister, handling all the type conversions and error handling needed for
 * the frontend to work with the Motoko backend.
 */
export class DAODiscoveryAPI {
  private registryActor: any;

  constructor(registryActor: any) {
    this.registryActor = registryActor;
  }

  /**
   * Convert Motoko DAOMetadata to TypeScript interface
   */
  private convertDAOMetadata(motkoDAO: any): DAOMetadata {
    return {
      dao_id: motkoDAO.dao_id,
      name: motkoDAO.name,
      description: motkoDAO.description,
      creator_principal: motkoDAO.creator_principal.toText(),
      creation_date: Number(motkoDAO.creation_date),
      member_count: Number(motkoDAO.member_count),
      category: motkoDAO.category,
      is_public: motkoDAO.is_public,
      dao_canister_id: motkoDAO.dao_canister_id.toText(),
      website: motkoDAO.website?.[0],
      logo_url: motkoDAO.logo_url?.[0],
      token_symbol: motkoDAO.token_symbol?.[0],
      total_value_locked: Number(motkoDAO.total_value_locked),
      active_proposals: Number(motkoDAO.active_proposals),
      last_activity: Number(motkoDAO.last_activity)
    };
  }

  /**
   * Convert TypeScript SearchFilters to Motoko format
   */
  private convertSearchFilters(filters: SearchFilters): any {
    return {
      category: filters.category ? [filters.category] : [],
      min_members: filters.min_members ? [BigInt(filters.min_members)] : [],
      max_members: filters.max_members ? [BigInt(filters.max_members)] : [],
      created_after: filters.created_after ? [BigInt(filters.created_after)] : [],
      created_before: filters.created_before ? [BigInt(filters.created_before)] : [],
      is_public: filters.is_public !== undefined ? [filters.is_public] : []
    };
  }

  /**
   * Convert TypeScript SortOption to Motoko variant
   */
  private convertSortOption(sort: SortOption): any {
    return { [sort]: null };
  }

  /**
   * Get all public DAOs with pagination
   */
  async getAllPublicDAOs(page: number = 0, pageSize: number = 12): Promise<PaginationResult<DAOMetadata>> {
    try {
      const result = await this.registryActor.getAllPublicDAOs(BigInt(page), BigInt(pageSize));
      
      return {
        items: result.items.map(this.convertDAOMetadata),
        total_count: Number(result.total_count),
        page: Number(result.page),
        page_size: Number(result.page_size),
        has_next: result.has_next,
        has_previous: result.has_previous
      };
    } catch (error) {
      console.error('Failed to get all public DAOs:', error);
      throw new Error(`Failed to fetch DAOs: ${error.message}`);
    }
  }

  /**
   * Search DAOs with filters and sorting
   */
  async searchDAOs(
    query: string,
    filters?: SearchFilters,
    sort?: SortOption,
    page: number = 0,
    pageSize: number = 12
  ): Promise<PaginationResult<DAOMetadata>> {
    try {
      const motkoFilters = filters ? [this.convertSearchFilters(filters)] : [];
      const motkoSort = sort ? [this.convertSortOption(sort)] : [];

      const result = await this.registryActor.searchDAOs(
        query,
        motkoFilters,
        motkoSort,
        BigInt(page),
        BigInt(pageSize)
      );
      
      return {
        items: result.items.map(this.convertDAOMetadata),
        total_count: Number(result.total_count),
        page: Number(result.page),
        page_size: Number(result.page_size),
        has_next: result.has_next,
        has_previous: result.has_previous
      };
    } catch (error) {
      console.error('Failed to search DAOs:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Get DAOs by category
   */
  async getDAOsByCategory(
    category: string,
    page: number = 0,
    pageSize: number = 12
  ): Promise<PaginationResult<DAOMetadata>> {
    try {
      const result = await this.registryActor.getDAOsByCategory(
        category,
        BigInt(page),
        BigInt(pageSize)
      );
      
      return {
        items: result.items.map(this.convertDAOMetadata),
        total_count: Number(result.total_count),
        page: Number(result.page),
        page_size: Number(result.page_size),
        has_next: result.has_next,
        has_previous: result.has_previous
      };
    } catch (error) {
      console.error('Failed to get DAOs by category:', error);
      throw new Error(`Failed to fetch DAOs by category: ${error.message}`);
    }
  }

  /**
   * Get DAOs created by a specific user
   */
  async getDAOsByCreator(creator: string): Promise<DAOMetadata[]> {
    try {
      const creatorPrincipal = Principal.fromText(creator);
      const result = await this.registryActor.getDAOsByCreator(creatorPrincipal);
      
      return result.map(this.convertDAOMetadata);
    } catch (error) {
      console.error('Failed to get DAOs by creator:', error);
      throw new Error(`Failed to fetch creator DAOs: ${error.message}`);
    }
  }

  /**
   * Get trending DAOs
   */
  async getTrendingDAOs(limit: number = 6): Promise<DAOMetadata[]> {
    try {
      const result = await this.registryActor.getTrendingDAOs(BigInt(limit));
      
      return result.map(this.convertDAOMetadata);
    } catch (error) {
      console.error('Failed to get trending DAOs:', error);
      throw new Error(`Failed to fetch trending DAOs: ${error.message}`);
    }
  }

  /**
   * Get DAO statistics
   */
  async getDAOStats(daoId: string): Promise<DAOStats | null> {
    try {
      const result = await this.registryActor.getDAOStats(daoId);
      
      if (!result || result.length === 0) {
        return null;
      }

      const stats = result[0];
      return {
        dao_id: stats.dao_id,
        member_count: Number(stats.member_count),
        total_proposals: Number(stats.total_proposals),
        active_proposals: Number(stats.active_proposals),
        total_staked: Number(stats.total_staked),
        treasury_balance: Number(stats.treasury_balance),
        governance_participation: Number(stats.governance_participation),
        last_updated: Number(stats.last_updated)
      };
    } catch (error) {
      console.error('Failed to get DAO stats:', error);
      throw new Error(`Failed to fetch DAO stats: ${error.message}`);
    }
  }

  /**
   * Get supported categories
   */
  async getSupportedCategories(): Promise<string[]> {
    try {
      return await this.registryActor.getSupportedCategories();
    } catch (error) {
      console.error('Failed to get supported categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  /**
   * Get registry statistics
   */
  async getRegistryStats(): Promise<{
    total_daos: number;
    public_daos: number;
    categories: Array<{ category: string; count: number }>;
    total_members: number;
    total_tvl: number;
  }> {
    try {
      const result = await this.registryActor.getRegistryStats();
      
      return {
        total_daos: Number(result.total_daos),
        public_daos: Number(result.public_daos),
        categories: result.categories.map(([category, count]: [string, bigint]) => ({
          category,
          count: Number(count)
        })),
        total_members: Number(result.total_members),
        total_tvl: Number(result.total_tvl)
      };
    } catch (error) {
      console.error('Failed to get registry stats:', error);
      throw new Error(`Failed to fetch registry stats: ${error.message}`);
    }
  }

  /**
   * Register a new DAO (called by DAO canisters)
   */
  async registerDAO(
    name: string,
    description: string,
    category: string,
    isPublic: boolean,
    daoCanisterId: string,
    website?: string,
    logoUrl?: string,
    tokenSymbol?: string
  ): Promise<string> {
    try {
      const result = await this.registryActor.registerDAO(
        name,
        description,
        category,
        isPublic,
        Principal.fromText(daoCanisterId),
        website ? [website] : [],
        logoUrl ? [logoUrl] : [],
        tokenSymbol ? [tokenSymbol] : []
      );
      
      if ('err' in result) {
        throw new Error(result.err);
      }
      
      return result.ok;
    } catch (error) {
      console.error('Failed to register DAO:', error);
      throw new Error(`Failed to register DAO: ${error.message}`);
    }
  }

  /**
   * Update DAO metadata
   */
  async updateDAOMetadata(
    daoId: string,
    updates: {
      name?: string;
      description?: string;
      category?: string;
      is_public?: boolean;
      website?: string;
      logo_url?: string;
    }
  ): Promise<void> {
    try {
      const result = await this.registryActor.updateDAOMetadata(
        daoId,
        updates.name ? [updates.name] : [],
        updates.description ? [updates.description] : [],
        updates.category ? [updates.category] : [],
        updates.is_public !== undefined ? [updates.is_public] : [],
        updates.website ? [updates.website] : [],
        updates.logo_url ? [updates.logo_url] : []
      );
      
      if ('err' in result) {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Failed to update DAO metadata:', error);
      throw new Error(`Failed to update DAO metadata: ${error.message}`);
    }
  }

  /**
   * Update DAO statistics (called by DAO canisters)
   */
  async updateDAOStats(
    daoId: string,
    stats: {
      member_count?: number;
      total_proposals?: number;
      active_proposals?: number;
      total_staked?: number;
      treasury_balance?: number;
      governance_participation?: number;
    }
  ): Promise<void> {
    try {
      const result = await this.registryActor.updateDAOStats(
        daoId,
        stats.member_count ? [BigInt(stats.member_count)] : [],
        stats.total_proposals ? [BigInt(stats.total_proposals)] : [],
        stats.active_proposals ? [BigInt(stats.active_proposals)] : [],
        stats.total_staked ? [BigInt(stats.total_staked)] : [],
        stats.treasury_balance ? [BigInt(stats.treasury_balance)] : [],
        stats.governance_participation ? [stats.governance_participation] : []
      );
      
      if ('err' in result) {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Failed to update DAO stats:', error);
      throw new Error(`Failed to update DAO stats: ${error.message}`);
    }
  }

  /**
   * Health check for the registry
   */
  async healthCheck(): Promise<{ status: string; timestamp: number; total_daos: number }> {
    try {
      const result = await this.registryActor.health();
      
      return {
        status: result.status,
        timestamp: Number(result.timestamp),
        total_daos: Number(result.total_daos)
      };
    } catch (error) {
      console.error('Registry health check failed:', error);
      throw new Error(`Registry health check failed: ${error.message}`);
    }
  }
}

/**
 * Factory function to create DAO Discovery API instance
 */
export const createDAODiscoveryAPI = (registryActor: any): DAODiscoveryAPI => {
  return new DAODiscoveryAPI(registryActor);
};