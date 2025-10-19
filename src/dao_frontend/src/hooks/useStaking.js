/**
 * useStaking Hook
 * 
 * Manages token staking operations including stake creation, unstaking,
 * reward claiming, and staking analytics. Supports multiple staking periods
 * with different reward rates and voting power multipliers.
 * 
 * @module hooks/useStaking
 * 
 * @returns {Object} Staking operations interface
 * @returns {Function} stake - Stake tokens for a specific period
 * @returns {Function} unstake - Unstake tokens after lock period
 * @returns {Function} claimRewards - Claim accumulated rewards (instant staking only)
 * @returns {Function} extendStakingPeriod - Extend stake lock period for better rewards
 * @returns {Function} getStake - Get stake details by ID
 * @returns {Function} getStakingRewards - Get reward information for a stake
 * @returns {Function} getStakingStats - Get platform-wide staking statistics
 * @returns {Function} getUserStakes - Get all stakes for a user
 * @returns {Function} getUserActiveStakes - Get active stakes for a user
 * @returns {Function} getUserStakingSummary - Get staking summary (total staked, rewards, voting power)
 * @returns {Function} setMinimumStakeAmount - Set minimum stake amount (admin)
 * @returns {Function} setMaximumStakeAmount - Set maximum stake amount (admin)
 * @returns {Function} setStakingEnabled - Enable/disable staking (admin)
 * @returns {boolean} loading - Loading state for operations
 * @returns {string|null} error - Error message if operation fails
 * 
 * @example
 * ```jsx
 * function StakingPanel() {
 *   const { stake, unstake, getUserStakingSummary, loading } = useStaking();
 *   
 *   const handleStake = async () => {
 *     // Stake 1000 tokens for 90 days
 *     const stakeId = await stake(1000, "locked90");
 *     console.log("Stake created:", stakeId);
 *   };
 *   
 *   const handleUnstake = async (stakeId) => {
 *     const amount = await unstake(stakeId);
 *     console.log("Unstaked amount:", amount);
 *   };
 *   
 *   const loadSummary = async () => {
 *     const summary = await getUserStakingSummary(userPrincipal);
 *     // { totalStaked, totalRewards, activeStakes, totalVotingPower }
 *   };
 * }
 * ```
 * 
 * Staking Periods:
 * - instant: No lock period, 5% APR, 1.0x voting power
 * - locked30: 30 days, 8% APR, 1.1x voting power
 * - locked90: 90 days, 12% APR, 1.25x voting power
 * - locked180: 180 days, 18% APR, 1.5x voting power
 * - locked365: 365 days, 25% APR, 2.0x voting power
 */

import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useActors } from '../context/ActorContext';

export const useStaking = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Stake tokens for a specific period
   * 
   * @async
   * @param {number} amount - Amount of tokens to stake (in DAO tokens, not base units)
   * @param {string} period - Staking period: "instant", "locked30", "locked90", "locked180", "locked365"
   * @returns {Promise<number>} Stake ID
   * @throws {Error} If staking fails (insufficient balance, below minimum, etc.)
   */
  const stake = async (amount, period) => {
    setLoading(true);
    setError(null);
    try {
      // Convert to base units (8 decimals)
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 100_000_000));
      const transferFee = 10_000n;
      
      // Get staking canister ID from environment
      const stakingCanisterId = import.meta.env.VITE_CANISTER_ID_STAKING;
      if (!stakingCanisterId) {
        throw new Error('Staking canister ID not configured');
      }

      // Step 1: Approve the staking canister to spend tokens (amount + transfer fee)
      // The approval itself costs a fee
      const stakingPrincipal = Principal.fromText(stakingCanisterId);
      
      const approveRes = await actors.ledger.icrc2_approve({
        spender: { owner: stakingPrincipal, subaccount: [] },
        amount: amountBigInt + transferFee, // Include transfer fee in approval
        fee: [transferFee], // Fee for the approval itself
        expires_at: [],
        expected_allowance: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
      });

      if ('Err' in approveRes || 'err' in approveRes) {
        const error = approveRes.Err || approveRes.err;
        throw new Error(`Approval failed: ${typeof error === 'object' ? Object.keys(error)[0] : error}`);
      }

      // Step 2: Call stake function (which will use transfer_from)
      const periodVariant = { [period]: null };
      const res = await actors.staking.stake(amountBigInt, periodVariant);
      if ('err' in res) throw new Error(res.err);
      return res.ok;
    } catch (err) {
      const errorMessage = err.message || 'Staking failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Unstake tokens (requires lock period to have passed)
   * 
   * @async
   * @param {number} stakeId - ID of the stake to unstake
   * @returns {Promise<number>} Amount of tokens unstaked
   * @throws {Error} If unstaking fails (stake still locked, not found, etc.)
   */
  const unstake = async (stakeId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.staking.unstake(BigInt(stakeId));
      if ('err' in res) throw new Error(res.err);
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Claim rewards without unstaking (instant staking only)
   * 
   * @async
   * @param {number} stakeId - ID of the stake to claim rewards from
   * @returns {Promise<number>} Amount of rewards claimed
   * @throws {Error} If claiming fails (only instant staking allowed)
   */
  const claimRewards = async (stakeId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.staking.claimRewards(BigInt(stakeId));
      if ('err' in res) throw new Error(res.err);
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const extendStakingPeriod = async (stakeId, newPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const periodVariant = { [newPeriod]: null };
      const res = await actors.staking.extendStakingPeriod(
        BigInt(stakeId),
        periodVariant
      );
      if ('err' in res) throw new Error(res.err);
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStake = async (stakeId) => {
    setLoading(true);
    setError(null);
    try {
      return await actors.staking.getStake(BigInt(stakeId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStakingRewards = async (stakeId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.staking.getStakingRewards(BigInt(stakeId));
      return res && res.length ? res[0] : null;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStakingStats = async () => {
    setLoading(true);
    setError(null);
    try {
      return await actors.staking.getStakingStats();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserStakes = async (user) => {
    setLoading(true);
    setError(null);
    try {
      const principal = Principal.fromText(user);
      return await actors.staking.getUserStakes(principal);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserActiveStakes = async (user) => {
    setLoading(true);
    setError(null);
    try {
      const principal = Principal.fromText(user);
      return await actors.staking.getUserActiveStakes(principal);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserStakingSummary = async (user) => {
    setLoading(true);
    setError(null);
    try {
      const principal = Principal.fromText(user);
      return await actors.staking.getUserStakingSummary(principal);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setMinimumStakeAmount = async (amount) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.staking.setMinimumStakeAmount(BigInt(amount));
      if ('err' in res) throw new Error(res.err);
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setMaximumStakeAmount = async (amount) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.staking.setMaximumStakeAmount(BigInt(amount));
      if ('err' in res) throw new Error(res.err);
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setStakingEnabled = async (enabled) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.staking.setStakingEnabled(enabled);
      if ('err' in res) throw new Error(res.err);
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    stake,
    unstake,
    claimRewards,
    extendStakingPeriod,
    getStake,
    getStakingRewards,
    getStakingStats,
    getUserStakes,
    getUserActiveStakes,
    getUserStakingSummary,
    setMinimumStakeAmount,
    setMaximumStakeAmount,
    setStakingEnabled,
    loading,
    error,
  };
};
