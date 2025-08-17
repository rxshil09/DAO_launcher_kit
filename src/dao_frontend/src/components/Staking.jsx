import React, { useState } from 'react';
import { useStaking } from '../hooks/useStaking';
import { useAuth } from '../context/AuthContext';

const Staking = () => {
  const {
    stake,
    unstake,
    claimRewards,
    extendStakingPeriod,
    getUserStakingSummary,
    getStake,
    getStakingRewards,
    setMinimumStakeAmount,
    setMaximumStakeAmount,
    setStakingEnabled,
    loading,
    error,
  } = useStaking();
  const { principal } = useAuth();
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('instant');
  const [unstakeId, setUnstakeId] = useState('');
  const [fetchId, setFetchId] = useState('');
  const [fetchedStake, setFetchedStake] = useState(null);
  const [pendingRewards, setPendingRewards] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [extendId, setExtendId] = useState('');
  const [extendPeriod, setExtendPeriod] = useState('locked30');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [enabled, setEnabled] = useState(true);

  const handleStake = async (e) => {
    e.preventDefault();
    try {
      const id = await stake(amount, period);
      console.log('Stake created:', id);
      setAmount('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnstake = async (e) => {
    e.preventDefault();
    try {
      const amount = await unstake(unstakeId);
      console.log('Unstaked amount:', amount);
      setUnstakeId('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchStake = async (e) => {
    e.preventDefault();
    try {
      setFetchError(null);
      const stakeRes = await getStake(fetchId);
      if (!stakeRes || stakeRes.length === 0) {
        setFetchedStake(null);
        setPendingRewards(null);
        setFetchError('Stake not found');
        return;
      }
      setFetchedStake(stakeRes[0]);
      const rewardsRes = await getStakingRewards(fetchId);
      setPendingRewards(rewardsRes[0] || null);
    } catch (err) {
      console.error(err);
      setFetchError(err.message);
    }
  };

  const handleClaimFetched = async () => {
    try {
      const rewards = await claimRewards(fetchId);
      console.log('Rewards claimed:', rewards);
      setFetchId('');
      setFetchedStake(null);
      setPendingRewards(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSummary = async () => {
    try {
      const res = await getUserStakingSummary(principal);
      setSummary(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExtend = async (e) => {
    e.preventDefault();
    try {
      await extendStakingPeriod(extendId, extendPeriod);
      setExtendId('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetMin = async (e) => {
    e.preventDefault();
    try {
      await setMinimumStakeAmount(minAmount);
      setMinAmount('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetMax = async (e) => {
    e.preventDefault();
    try {
      await setMaximumStakeAmount(maxAmount);
      setMaxAmount('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleEnabled = async () => {
    try {
      await setStakingEnabled(!enabled);
      setEnabled(!enabled);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">Staking</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleStake} className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          className="border p-2 w-full"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="instant">Instant</option>
          <option value="locked30">30 Days</option>
          <option value="locked90">90 Days</option>
          <option value="locked180">180 Days</option>
          <option value="locked365">365 Days</option>
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Stake
        </button>
      </form>

      <form onSubmit={handleUnstake} className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Stake ID"
          value={unstakeId}
          onChange={(e) => setUnstakeId(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Unstake
        </button>
      </form>

      <form onSubmit={handleFetchStake} className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Stake ID"
          value={fetchId}
          onChange={(e) => setFetchId(e.target.value)}
        />
        <button
          type="submit"
          className="bg-purple-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Fetch Stake
        </button>
      </form>
      {loading && <p>Loading...</p>}
      {fetchError && <p className="text-red-500">{fetchError}</p>}
      {fetchedStake && (
        <div className="p-2 border rounded space-y-2">
          <p>Amount: {fetchedStake.amount.toString()}</p>
          <p>
            Period: {Object.keys(fetchedStake.stakingPeriod)[0]}
          </p>
          <p>Active: {fetchedStake.isActive ? 'Yes' : 'No'}</p>
          {pendingRewards && (
            <p>
              Pending Rewards: {pendingRewards.claimableRewards?.toString()}
            </p>
          )}
          <button
            onClick={handleClaimFetched}
            className="bg-purple-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Claim Rewards
          </button>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handleSummary}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Get My Summary
        </button>
        {summary && (
          <div className="p-2 border rounded">
            <p>Active Stakes: {summary.activeStakes?.toString()}</p>
            <p>Total Staked: {summary.totalStaked?.toString()}</p>
            <p>Total Rewards: {summary.totalRewards?.toString()}</p>
            <p>Total Voting Power: {summary.totalVotingPower?.toString()}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleExtend} className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Stake ID"
          value={extendId}
          onChange={(e) => setExtendId(e.target.value)}
        />
        <select
          className="border p-2 w-full"
          value={extendPeriod}
          onChange={(e) => setExtendPeriod(e.target.value)}
        >
          <option value="instant">Instant</option>
          <option value="locked30">30 Days</option>
          <option value="locked90">90 Days</option>
          <option value="locked180">180 Days</option>
          <option value="locked365">365 Days</option>
        </select>
        <button
          type="submit"
          className="bg-indigo-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Extend Period
        </button>
      </form>

      <form onSubmit={handleSetMin} className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Minimum Stake Amount"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
        />
        <button
          type="submit"
          className="bg-teal-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Set Minimum
        </button>
      </form>

      <form onSubmit={handleSetMax} className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Maximum Stake Amount"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Set Maximum
        </button>
      </form>

      <button
        onClick={handleToggleEnabled}
        className="bg-gray-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {enabled ? 'Disable Staking' : 'Enable Staking'}
      </button>
    </div>
  );
};

export default Staking;
