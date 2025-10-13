/**
 * useTreasury Hook
 * 
 * Manages treasury operations including deposits, withdrawals, balance management,
 * and transaction history. Supports balance segregation (available, locked, reserved)
 * and authorization management.
 * 
 * @module hooks/useTreasury
 * 
 * @returns {Object} Treasury operations interface
 * @returns {Function} deposit - Deposit tokens to treasury
 * @returns {Function} withdraw - Withdraw tokens from treasury (authorized users)
 * @returns {Function} lockTokens - Lock tokens for specific purposes
 * @returns {Function} unlockTokens - Unlock previously locked tokens
 * @returns {Function} reserveTokens - Reserve tokens for future use
 * @returns {Function} releaseReservedTokens - Release reserved tokens
 * @returns {Function} getBalance - Get treasury balance breakdown
 * @returns {Function} getAllTransactions - Get all treasury transactions
 * @returns {Function} getTransactionsByType - Filter transactions by type
 * @returns {Function} getRecentTransactions - Get N most recent transactions
 * @returns {Function} getTreasuryStats - Get treasury statistics and analytics
 * @returns {Function} addAuthorizedPrincipal - Add authorized treasurer (admin)
 * @returns {Function} removeAuthorizedPrincipal - Remove authorized treasurer (admin)
 * @returns {Function} getAuthorizedPrincipals - Get list of authorized treasurers
 * @returns {boolean} loading - Loading state for operations
 * @returns {string|null} error - Error message if operation fails
 * 
 * @example
 * ```jsx
 * function TreasuryPanel() {
 *   const { deposit, withdraw, getBalance, getTreasuryStats } = useTreasury();
 *   
 *   const handleDeposit = async () => {
 *     const txId = await deposit(5000, "Initial funding");
 *     console.log("Deposit transaction:", txId);
 *   };
 *   
 *   const handleWithdraw = async () => {
 *     const txId = await withdraw(
 *       "recipient-principal-id",
 *       1000,
 *       "Development team payment"
 *     );
 *   };
 *   
 *   const loadBalance = async () => {
 *     const balance = await getBalance();
 *     // { total, available, locked, reserved }
 *   };
 * }
 * ```
 * 
 * Transaction Types:
 * - deposit: Funds added to treasury
 * - withdrawal: Funds withdrawn from treasury
 * - proposalExecution: Withdrawal via governance proposal
 * - stakingReward: Reward distribution
 * - fee: Fee collection
 * 
 * Balance Segregation:
 * - available: Freely usable funds
 * - locked: Funds locked for specific purposes (e.g., staking rewards)
 * - reserved: Emergency reserves or allocated but not yet used
 */

import { useState } from 'react';
import { useActors } from '../context/ActorContext';
import { Principal } from '@dfinity/principal';

export const useTreasury = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Deposit tokens to the treasury
   * 
   * @async
   * @param {number} amount - Amount of tokens to deposit
   * @param {string} description - Description of the deposit
   * @returns {Promise<number>} Transaction ID
   * @throws {Error} If deposit fails
   */
  const deposit = async (amount, description) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.treasury.deposit(BigInt(amount), description);
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
   * Withdraw tokens from the treasury (requires authorization)
   * 
   * @async
   * @param {string} recipient - Principal ID of recipient
   * @param {number} amount - Amount of tokens to withdraw
   * @param {string} description - Description of the withdrawal
   * @returns {Promise<number>} Transaction ID
   * @throws {Error} If withdrawal fails (unauthorized, insufficient funds, etc.)
   */
  const withdraw = async (recipient, amount, description) => {
    setLoading(true);
    setError(null);
    try {
      const principal = Principal.fromText(recipient);
      const res = await actors.treasury.withdraw(
        principal,
        BigInt(amount),
        description,
        []
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

  /**
   * Lock tokens for specific purposes (e.g., staking rewards, proposal execution)
   * 
   * @async
   * @param {number} amount - Amount of tokens to lock
   * @param {string} reason - Reason for locking tokens
   * @returns {Promise<void>}
   * @throws {Error} If locking fails (insufficient available funds)
   */
  const lockTokens = async (amount, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await actors.treasury.lockTokens(
        BigInt(amount),
        reason
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Unlock previously locked tokens, making them available again
   * 
   * @async
   * @param {number} amount - Amount of tokens to unlock
   * @param {string} reason - Reason for unlocking tokens
   * @returns {Promise<void>}
   * @throws {Error} If unlocking fails (insufficient locked funds)
   */
  const unlockTokens = async (amount, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await actors.treasury.unlockTokens(
        BigInt(amount),
        reason
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reserve tokens for planned future use (emergency fund, allocated budget)
   * 
   * @async
   * @param {number} amount - Amount of tokens to reserve
   * @param {string} reason - Reason for reservation
   * @returns {Promise<void>}
   * @throws {Error} If reservation fails (insufficient available funds)
   */
  const reserveTokens = async (amount, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await actors.treasury.reserveTokens(
        BigInt(amount),
        reason
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Release reserved tokens back to available balance
   * 
   * @async
   * @param {number} amount - Amount of tokens to release
   * @param {string} reason - Reason for release
   * @returns {Promise<void>}
   * @throws {Error} If release fails (insufficient reserved funds)
   */
  const releaseReservedTokens = async (amount, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await actors.treasury.releaseReservedTokens(
        BigInt(amount),
        reason
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get treasury balance breakdown
   * 
   * @async
   * @returns {Promise<Object>} Balance object with total, available, locked, and reserved amounts
   * @throws {Error} If balance retrieval fails
   */
  const getBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.treasury.getBalance();
      if ('err' in res) throw new Error(res.err);
      return 'ok' in res ? res.ok : res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get all treasury transactions
   * 
   * @async
   * @returns {Promise<Array>} Array of transaction objects
   * @throws {Error} If transaction retrieval fails
   */
  const getAllTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const txs = await actors.treasury.getAllTransactions();
      return txs;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get transactions filtered by type
   * 
   * @async
   * @param {string} type - Transaction type ("deposit", "withdrawal", "proposalExecution", "stakingReward", "fee")
   * @returns {Promise<Array>} Array of matching transactions
   * @throws {Error} If transaction retrieval fails
   */
  const getTransactionsByType = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const txs = await actors.treasury.getTransactionsByType({
        [type]: null,
      });
      return txs;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get N most recent transactions
   * 
   * @async
   * @param {number} limit - Maximum number of transactions to return
   * @returns {Promise<Array>} Array of recent transactions
   * @throws {Error} If transaction retrieval fails
   */
  const getRecentTransactions = async (limit) => {
    setLoading(true);
    setError(null);
    try {
      const txs = await actors.treasury.getRecentTransactions(BigInt(limit));
      return txs;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get treasury statistics and analytics
   * 
   * @async
   * @returns {Promise<Object>} Statistics including total transactions, volume, etc.
   * @throws {Error} If stats retrieval fails
   */
  const getTreasuryStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await actors.treasury.getTreasuryStats();
      return stats;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add authorized treasurer (admin only)
   * 
   * @async
   * @param {string} principalId - Principal ID to authorize
   * @returns {Promise<void>}
   * @throws {Error} If authorization fails (not admin, invalid principal)
   */
  const addAuthorizedPrincipal = async (principalId) => {
    setLoading(true);
    setError(null);
    try {
      const principal = Principal.fromText(principalId);
      const res = await actors.treasury.addAuthorizedPrincipal(principal);
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
   * Remove authorized treasurer (admin only)
   * 
   * @async
   * @param {string} principalId - Principal ID to remove authorization from
   * @returns {Promise<void>}
   * @throws {Error} If removal fails (not admin, invalid principal)
   */
  const removeAuthorizedPrincipal = async (principalId) => {
    setLoading(true);
    setError(null);
    try {
      const principal = Principal.fromText(principalId);
      const res = await actors.treasury.removeAuthorizedPrincipal(principal);
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
   * Get list of authorized treasurers
   * 
   * @async
   * @returns {Promise<Array<string>>} Array of authorized principal IDs
   * @throws {Error} If retrieval fails
   */
  const getAuthorizedPrincipals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.treasury.getAuthorizedPrincipals();
      return res.map((p) => (typeof p.toText === 'function' ? p.toText() : p));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deposit,
    withdraw,
    lockTokens,
    unlockTokens,

    reserveTokens,
    releaseReservedTokens,
    getBalance,
    getAllTransactions,
    getTransactionsByType,
    getRecentTransactions,
    getTreasuryStats,
    addAuthorizedPrincipal,
    removeAuthorizedPrincipal,
    getAuthorizedPrincipals,
    loading,
    error,
  };
};

