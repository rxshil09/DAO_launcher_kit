import { useState } from 'react';
import { useActors } from '../context/ActorContext';
import { Principal } from '@dfinity/principal';

export const useTreasury = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const getAllTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.treasury.getAllTransactions();
      if ('err' in res) throw new Error(res.err);
      return 'ok' in res ? res.ok : res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
    loading,
    error,
  };
};
