import { useState, useCallback } from 'react';
import { useActors } from '../context/ActorContext';
import { Principal } from '@dfinity/principal';
import { DAOMetadata, DAOStats, SearchFilters, SortOption, PaginationResult } from '../types/dao';

export const useDAODiscovery = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any, operation: string) => {
    const message = err?.message || String(err);
    console.error(`${operation} failed:`, err);
    setError(message);
    throw new Error(message);
  };

  const getAllPublicDAOs = useCallback(async (
    page: number = 0, 
    pageSize: number = 12
  ): Promise<PaginationResult<DAOMetadata>> => {
    if (!actors?.dao_registry) {
      throw new Error('DAO Registry not available');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_registry.getAllPublicDAOs(BigInt(page), BigInt(pageSize));
      
      return {
        items: result.items.map(item => ({
          dao_id: item.dao_id,
          name: item.name,
          description: item.description,
          creator_principal: item.creator_principal.toText(),
          creation_date: Number(item.creation_date),
          member_count: Number(item.member_count),
          category: item.category,
          is_public: item.is_public,
          dao_canister_id: item.dao_canister_id.toText(),
          website: item.website?.[0],
          logo_url: item.logo_url?.[0],
          logo_asset_id: item.logo_asset_id?.[0],
          logo_type: item.logo_type?.[0],
          token_symbol: item.token_symbol?.[0],
          total_value_locked: Number(item.total_value_locked),
          active_proposals: Number(item.active_proposals),
          last_activity: Number(item.last_activity)
        })),
        total_count: Number(result.total_count),
        page: Number(result.page),
        page_size: Number(result.page_size),
        has_next: result.has_next,
        has_previous: result.has_previous
      };
    } catch (err) {
      handleError(err, 'Get All Public DAOs');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const searchDAOs = useCallback(async (
    query: string,
    filters?: SearchFilters,
    sort?: SortOption,
    page: number = 0,
    pageSize: number = 12
  ): Promise<PaginationResult<DAOMetadata>> => {
    if (!actors?.dao_registry) {
      throw new Error('DAO Registry not available');
    }

    setLoading(true);
    setError(null);
    
    try {
      // Convert filters to Motoko format
      const motkoFilters = filters ? [{
        category: filters.category ? [filters.category] : [],
        min_members: filters.min_members ? [BigInt(filters.min_members)] : [],
        max_members: filters.max_members ? [BigInt(filters.max_members)] : [],
        created_after: filters.created_after ? [BigInt(filters.created_after)] : [],
        created_before: filters.created_before ? [BigInt(filters.created_before)] : [],
        is_public: filters.is_public !== undefined ? [filters.is_public] : []
      }] : [];

      // Convert sort option to Motoko variant
      const motkoSort = sort ? [{ [sort]: null }] : [];

      const result = await actors.dao_registry.searchDAOs(
        query,
        motkoFilters,
        motkoSort,
        BigInt(page),
        BigInt(pageSize)
      );
      
      return {
        items: result.items.map(item => ({
          dao_id: item.dao_id,
          name: item.name,
          description: item.description,
          creator_principal: item.creator_principal.toText(),
          creation_date: Number(item.creation_date),
          member_count: Number(item.member_count),
          category: item.category,
          is_public: item.is_public,
          dao_canister_id: item.dao_canister_id.toText(),
          website: item.website?.[0],
          logo_url: item.logo_url?.[0],
          logo_asset_id: item.logo_asset_id?.[0],
          logo_type: item.logo_type?.[0],
          token_symbol: item.token_symbol?.[0],
          total_value_locked: Number(item.total_value_locked),
          active_proposals: Number(item.active_proposals),
          last_activity: Number(item.last_activity)
        })),
        total_count: Number(result.total_count),
        page: Number(result.page),
        page_size: Number(result.page_size),
        has_next: result.has_next,
        has_previous: result.has_previous
      };
    } catch (err) {
      handleError(err, 'Search DAOs');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const getDAOsByCategory = useCallback(async (
    category: string,
    page: number = 0,
    pageSize: number = 12
  ): Promise<PaginationResult<DAOMetadata>> => {
    if (!actors?.dao_registry) {
      throw new Error('DAO Registry not available');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_registry.getDAOsByCategory(
        category,
        BigInt(page),
        BigInt(pageSize)
      );
      
      return {
        items: result.items.map(item => ({
          dao_id: item.dao_id,
          name: item.name,
          description: item.description,
          creator_principal: item.creator_principal.toText(),
          creation_date: Number(item.creation_date),
          member_count: Number(item.member_count),
          category: item.category,
          is_public: item.is_public,
          dao_canister_id: item.dao_canister_id.toText(),
          website: item.website?.[0],
          logo_url: item.logo_url?.[0],
          logo_asset_id: item.logo_asset_id?.[0],
          logo_type: item.logo_type?.[0],
          token_symbol: item.token_symbol?.[0],
          total_value_locked: Number(item.total_value_locked),
          active_proposals: Number(item.active_proposals),
          last_activity: Number(item.last_activity)
        })),
        total_count: Number(result.total_count),
        page: Number(result.page),
        page_size: Number(result.page_size),
        has_next: result.has_next,
        has_previous: result.has_previous
      };
    } catch (err) {
      handleError(err, 'Get DAOs by Category');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const getDAOsByCreator = useCallback(async (creator: string): Promise<DAOMetadata[]> => {
    if (!actors?.dao_registry) {
      throw new Error('DAO Registry not available');
    }

    setLoading(true);
    setError(null);
    
    try {
      const creatorPrincipal = Principal.fromText(creator);
      const result = await actors.dao_registry.getDAOsByCreator(creatorPrincipal);
      
      return result.map(item => ({
        dao_id: item.dao_id,
        name: item.name,
        description: item.description,
        creator_principal: item.creator_principal.toText(),
        creation_date: Number(item.creation_date),
        member_count: Number(item.member_count),
        category: item.category,
        is_public: item.is_public,
        dao_canister_id: item.dao_canister_id.toText(),
          website: item.website?.[0],
          logo_url: item.logo_url?.[0],
          logo_asset_id: item.logo_asset_id?.[0],
          logo_type: item.logo_type?.[0],
          token_symbol: item.token_symbol?.[0],
        total_value_locked: Number(item.total_value_locked),
        active_proposals: Number(item.active_proposals),
        last_activity: Number(item.last_activity)
      }));
    } catch (err) {
      handleError(err, 'Get DAOs by Creator');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const getTrendingDAOs = useCallback(async (limit: number = 6): Promise<DAOMetadata[]> => {
    if (!actors?.dao_registry) {
      throw new Error('DAO Registry not available');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_registry.getTrendingDAOs(BigInt(limit));
      
      return result.map(item => ({
        dao_id: item.dao_id,
        name: item.name,
        description: item.description,
        creator_principal: item.creator_principal.toText(),
        creation_date: Number(item.creation_date),
        member_count: Number(item.member_count),
        category: item.category,
        is_public: item.is_public,
        dao_canister_id: item.dao_canister_id.toText(),
        website: item.website?.[0],
        logo_url: item.logo_url?.[0],
        token_symbol: item.token_symbol?.[0],
        total_value_locked: Number(item.total_value_locked),
        active_proposals: Number(item.active_proposals),
        last_activity: Number(item.last_activity)
      }));
    } catch (err) {
      handleError(err, 'Get Trending DAOs');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const getDAOStats = useCallback(async (daoId: string): Promise<DAOStats | null> => {
    if (!actors?.dao_registry) {
      throw new Error('DAO Registry not available');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_registry.getDAOStats(daoId);
      
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
    } catch (err) {
      handleError(err, 'Get DAO Stats');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const getSupportedCategories = useCallback(async (): Promise<string[]> => {
    if (!actors?.dao_registry) {
      throw new Error('DAO Registry not available');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_registry.getSupportedCategories();
      return result;
    } catch (err) {
      handleError(err, 'Get Supported Categories');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const getRegistryStats = useCallback(async () => {
    if (!actors?.dao_registry) {
      throw new Error('DAO Registry not available');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_registry.getRegistryStats();
      
      return {
        total_daos: Number(result.total_daos),
        public_daos: Number(result.public_daos),
        categories: result.categories.map(([category, count]) => ({
          category,
          count: Number(count)
        })),
        total_members: Number(result.total_members),
        total_tvl: Number(result.total_tvl)
      };
    } catch (err) {
      handleError(err, 'Get Registry Stats');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  return {
    getAllPublicDAOs,
    searchDAOs,
    getDAOsByCategory,
    getDAOsByCreator,
    getTrendingDAOs,
    getDAOStats,
    getSupportedCategories,
    getRegistryStats,
    loading,
    error
  };
};
