import { useState, useCallback } from 'react';
import { useActors } from '../context/ActorContext';

export const useAnalytics = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any, operation: string) => {
    const message = err?.message || String(err);
    console.error(`${operation} failed:`, err);
    setError(message);
    throw new Error(message);
  };

  const getPlatformMetrics = useCallback(async () => {
    if (!actors?.dao_analytics) {
      // Return mock data if analytics not available
      return {
        total_daos: 128,
        total_users: 15420,
        total_proposals: 342,
        total_votes: 1847,
        total_tvl: 12500000,
        active_daos_24h: 23,
        active_users_24h: 456,
        proposals_created_24h: 8,
        votes_cast_24h: 67,
        treasury_volume_24h: 125000,
        last_updated: Date.now()
      };
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_analytics.getPlatformMetrics();
      
      return {
        total_daos: Number(result.total_daos),
        total_users: Number(result.total_users),
        total_proposals: Number(result.total_proposals),
        total_votes: Number(result.total_votes),
        total_tvl: Number(result.total_tvl),
        active_daos_24h: Number(result.active_daos_24h),
        active_users_24h: Number(result.active_users_24h),
        proposals_created_24h: Number(result.proposals_created_24h),
        votes_cast_24h: Number(result.votes_cast_24h),
        treasury_volume_24h: Number(result.treasury_volume_24h),
        last_updated: Number(result.last_updated)
      };
    } catch (err) {
      handleError(err, 'Get Platform Metrics');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const getTimeSeriesData = useCallback(async (
    metric: string,
    timeframe: string,
    days: number
  ) => {
    if (!actors?.dao_analytics) {
      // Return mock data
      const mockData = [];
      const now = Date.now();
      for (let i = days - 1; i >= 0; i--) {
        const timestamp = now - (i * 24 * 60 * 60 * 1000);
        const value = Math.floor(Math.random() * 50) + (days - i) * 2;
        mockData.push({ timestamp, value });
      }
      return mockData;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_analytics.getTimeSeriesData(
        metric,
        timeframe,
        BigInt(days)
      );
      
      return result.map(item => ({
        timestamp: Number(item.timestamp),
        value: Number(item.value)
      }));
    } catch (err) {
      handleError(err, 'Get Time Series Data');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const getGrowthMetrics = useCallback(async (days: number) => {
    if (!actors?.dao_analytics) {
      // Return mock data
      return {
        dao_growth_rate: 12.5,
        user_growth_rate: 18.3,
        tvl_growth_rate: 24.7,
        proposal_growth_rate: 8.9,
        period_days: days
      };
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_analytics.getGrowthMetrics(BigInt(days));
      
      return {
        dao_growth_rate: Number(result.dao_growth_rate),
        user_growth_rate: Number(result.user_growth_rate),
        tvl_growth_rate: Number(result.tvl_growth_rate),
        proposal_growth_rate: Number(result.proposal_growth_rate),
        period_days: Number(result.period_days)
      };
    } catch (err) {
      handleError(err, 'Get Growth Metrics');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const getGovernanceStats = useCallback(async () => {
    if (!actors?.dao_analytics) {
      // Return mock data
      return {
        total_proposals: 342,
        active_proposals: 23,
        passed_proposals: 287,
        failed_proposals: 32,
        average_voting_participation: 0.78,
        average_proposal_duration: 7.0,
        most_active_governance_dao: 'DeFi Protocol Alpha',
        governance_activity_trend: 15.2
      };
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_analytics.getGovernanceStats();
      
      return {
        total_proposals: Number(result.total_proposals),
        active_proposals: Number(result.active_proposals),
        passed_proposals: Number(result.passed_proposals),
        failed_proposals: Number(result.failed_proposals),
        average_voting_participation: Number(result.average_voting_participation),
        average_proposal_duration: Number(result.average_proposal_duration),
        most_active_governance_dao: result.most_active_governance_dao?.[0],
        governance_activity_trend: Number(result.governance_activity_trend)
      };
    } catch (err) {
      handleError(err, 'Get Governance Stats');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const getTreasuryAnalytics = useCallback(async () => {
    if (!actors?.dao_analytics) {
      // Return mock data
      return {
        total_tvl: 12500000,
        total_deposits: 15200000,
        total_withdrawals: 2700000,
        net_flow_24h: 125000,
        average_dao_treasury: 97656,
        largest_treasury: 2400000,
        treasury_growth_rate: 24.7,
        most_active_treasury_dao: 'DeFi Protocol Alpha'
      };
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_analytics.getTreasuryAnalytics();
      
      return {
        total_tvl: Number(result.total_tvl),
        total_deposits: Number(result.total_deposits),
        total_withdrawals: Number(result.total_withdrawals),
        net_flow_24h: Number(result.net_flow_24h),
        average_dao_treasury: Number(result.average_dao_treasury),
        largest_treasury: Number(result.largest_treasury),
        treasury_growth_rate: Number(result.treasury_growth_rate),
        most_active_treasury_dao: result.most_active_treasury_dao?.[0]
      };
    } catch (err) {
      handleError(err, 'Get Treasury Analytics');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const getTopDAOs = useCallback(async (limit: number = 10) => {
    if (!actors?.dao_analytics) {
      // Return mock data
      return [
        ['DeFi Protocol Alpha', 245.7],
        ['MetaVerse Gaming DAO', 198.3],
        ['Creator Economy DAO', 156.9],
        ['Green Energy DAO', 134.2],
        ['Social Network DAO', 112.8]
      ];
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_analytics.getTopDAOs(BigInt(limit));
      
      return result.map(([daoId, score]) => [daoId, Number(score)]);
    } catch (err) {
      handleError(err, 'Get Top DAOs');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const getActivitySummary = useCallback(async (period: string) => {
    if (!actors?.dao_analytics) {
      // Return mock data
      return {
        period,
        start_time: Date.now() - 24 * 60 * 60 * 1000,
        end_time: Date.now(),
        dao_creations: 3,
        user_registrations: 47,
        proposals_created: 8,
        votes_cast: 67,
        treasury_volume: 125000,
        staking_volume: 89000,
        unique_active_users: 456,
        unique_active_daos: 23
      };
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await actors.dao_analytics.getActivitySummary(period);
      
      if (!result || result.length === 0) {
        return null;
      }

      const summary = result[0];
      return {
        period: summary.period,
        start_time: Number(summary.start_time),
        end_time: Number(summary.end_time),
        dao_creations: Number(summary.dao_creations),
        user_registrations: Number(summary.user_registrations),
        proposals_created: Number(summary.proposals_created),
        votes_cast: Number(summary.votes_cast),
        treasury_volume: Number(summary.treasury_volume),
        staking_volume: Number(summary.staking_volume),
        unique_active_users: Number(summary.unique_active_users),
        unique_active_daos: Number(summary.unique_active_daos)
      };
    } catch (err) {
      handleError(err, 'Get Activity Summary');
    } finally {
      setLoading(false);
    }
  }, [actors]);

  const recordEvent = useCallback(async (
    eventType: string,
    daoId?: string,
    userId?: string,
    metadata: Record<string, string> = {},
    value?: number
  ) => {
    if (!actors?.dao_analytics) {
      console.warn('Analytics not available, event not recorded:', eventType);
      return;
    }

    try {
      const metadataArray = Object.entries(metadata);
      const eventTypeVariant = { [eventType]: null };
      
      await actors.dao_analytics.recordEvent(
        eventTypeVariant,
        daoId ? [daoId] : [],
        userId ? [userId] : [],
        metadataArray,
        value ? [value] : []
      );
    } catch (err) {
      console.error('Failed to record analytics event:', err);
    }
  }, [actors]);

  return {
    getPlatformMetrics,
    getTimeSeriesData,
    getGrowthMetrics,
    getGovernanceStats,
    getTreasuryAnalytics,
    getTopDAOs,
    getActivitySummary,
    recordEvent,
    loading,
    error
  };
};