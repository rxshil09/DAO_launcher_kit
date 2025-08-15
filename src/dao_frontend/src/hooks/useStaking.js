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
      const result = await actors.staking.stake(BigInt(amount), periodVariant);
      return result;
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
      const result = await actors.staking.unstake(BigInt(stakeId));
      return result;
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
      const result = await actors.staking.claimRewards(BigInt(stakeId));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { stake, unstake, claimRewards, loading, error };
};
