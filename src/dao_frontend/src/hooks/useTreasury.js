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
      const result = await actors.treasury.deposit(BigInt(amount), description);
      return result;
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
      const result = await actors.treasury.withdraw(
        principal,
        BigInt(amount),
        description,
        []
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
      const balance = await actors.treasury.getBalance();
      return balance;
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
      const txs = await actors.treasury.getAllTransactions();
      return txs;
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
    getBalance,
    getAllTransactions,
    loading,
    error,
  };
};
