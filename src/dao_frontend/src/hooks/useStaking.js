import { useState } from 'react';
import { useActors } from '../context/ActorContext';

export const useStaking = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const stake = async (amount, period) => {
    setLoading(true);
    setError(null);
    try {
      const periodVariant = { [period]: null };
      const res = await actors.staking.stake(BigInt(amount), periodVariant);
      if ('err' in res) throw new Error(res.err);
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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

  return { stake, unstake, claimRewards, loading, error };
};
