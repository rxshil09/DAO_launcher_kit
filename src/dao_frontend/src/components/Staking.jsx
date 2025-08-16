import React, { useState } from 'react';
import { useStaking } from '../hooks/useStaking';

const Staking = () => {
  const { stake, unstake, claimRewards, loading, error } = useStaking();
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('instant');
  const [unstakeId, setUnstakeId] = useState('');
  const [claimId, setClaimId] = useState('');

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

  const handleClaim = async (e) => {
    e.preventDefault();
    try {
      const rewards = await claimRewards(claimId);
      console.log('Rewards claimed:', rewards);
      setClaimId('');
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

      <form onSubmit={handleClaim} className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Stake ID"
          value={claimId}
          onChange={(e) => setClaimId(e.target.value)}
        />
        <button
          type="submit"
          className="bg-purple-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Claim Rewards
        </button>
      </form>
    </div>
  );
};

export default Staking;
