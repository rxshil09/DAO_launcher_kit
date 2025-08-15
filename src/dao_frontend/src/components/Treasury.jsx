import React, { useState, useEffect } from 'react';
import { useTreasury } from '../hooks/useTreasury';

const Treasury = () => {
  const {
    deposit,
    withdraw,
    lockTokens,
    unlockTokens,
    reserveTokens,
    releaseReservedTokens,
    getBalance,
    getTransactionsByType,
    getRecentTransactions,
    getTreasuryStats,
    loading,
    error,
  } = useTreasury();
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDesc, setDepositDesc] = useState('');
  const [recipient, setRecipient] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDesc, setWithdrawDesc] = useState('');
  const [lockAmount, setLockAmount] = useState('');
  const [lockReason, setLockReason] = useState('');
  const [unlockAmount, setUnlockAmount] = useState('');
  const [unlockReason, setUnlockReason] = useState('');
  const [reserveAmount, setReserveAmount] = useState('');
  const [reserveReason, setReserveReason] = useState('');
  const [releaseAmount, setReleaseAmount] = useState('');
  const [releaseReason, setReleaseReason] = useState('');
  const [filterType, setFilterType] = useState('deposit');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchData = async () => {
    try {
      const bal = await getBalance();
      setBalance(bal);
      const txs = await getRecentTransactions(5);
      setTransactions(txs);
      const s = await getTreasuryStats();
      setStats(s);
    } catch (e) {
      // error handled in hook
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    await deposit(depositAmount, depositDesc);
    setDepositAmount('');
    setDepositDesc('');
    await fetchData();
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    await withdraw(recipient, withdrawAmount, withdrawDesc);
    setRecipient('');
    setWithdrawAmount('');
    setWithdrawDesc('');
    await fetchData();
  };

  const handleLock = async (e) => {
    e.preventDefault();
    await lockTokens(lockAmount, lockReason);
    setLockAmount('');
    setLockReason('');
    await fetchData();
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    await unlockTokens(unlockAmount, unlockReason);
    setUnlockAmount('');
    setUnlockReason('');
    await fetchData();
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    await reserveTokens(reserveAmount, reserveReason);
    setReserveAmount('');
    setReserveReason('');
    await fetchData();
  };

  const handleRelease = async (e) => {
    e.preventDefault();
    await releaseReservedTokens(releaseAmount, releaseReason);
    setReleaseAmount('');
    setReleaseReason('');
    await fetchData();
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    const txs = await getTransactionsByType(filterType);
    setFilteredTransactions(txs);
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">Treasury</h1>
      {error && <p className="text-red-500">{error}</p>}

      {balance && (
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Current Balance</h2>
          <p>Total: {balance.total.toString()} tokens</p>
          <p>Available: {balance.available.toString()} tokens</p>
          <p>Locked: {balance.locked.toString()} tokens</p>
          <p>Reserved: {balance.reserved.toString()} tokens</p>
        </div>
      )}

      {stats && (
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Statistics</h2>
          <p>Total Transactions: {stats.totalTransactions.toString()}</p>
          <p>Total Deposits: {stats.totalDeposits.toString()} tokens</p>
          <p>Total Withdrawals: {stats.totalWithdrawals.toString()} tokens</p>
          <p>
            Avg. Amount: {stats.averageTransactionAmount.toFixed(2)} tokens
          </p>
        </div>
      )}

      <form onSubmit={handleDeposit} className="space-y-2">
        <h2 className="text-xl font-semibold">Deposit</h2>
        <input
          className="border p-2 w-full"
          placeholder="Amount"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Description"
          value={depositDesc}
          onChange={(e) => setDepositDesc(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Deposit
        </button>
      </form>

      <form onSubmit={handleWithdraw} className="space-y-2">
        <h2 className="text-xl font-semibold">Withdraw</h2>
        <input
          className="border p-2 w-full"
          placeholder="Recipient Principal"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Amount"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Description"
          value={withdrawDesc}
          onChange={(e) => setWithdrawDesc(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Withdraw
        </button>
      </form>

      <form onSubmit={handleLock} className="space-y-2">
        <h2 className="text-xl font-semibold">Lock Tokens</h2>
        <input
          className="border p-2 w-full"
          placeholder="Amount"
          value={lockAmount}
          onChange={(e) => setLockAmount(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Reason"
          value={lockReason}
          onChange={(e) => setLockReason(e.target.value)}
        />
        <button
          type="submit"
          className="bg-purple-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Lock
        </button>
      </form>

      <form onSubmit={handleUnlock} className="space-y-2">
        <h2 className="text-xl font-semibold">Unlock Tokens</h2>
        <input
          className="border p-2 w-full"
          placeholder="Amount"
          value={unlockAmount}
          onChange={(e) => setUnlockAmount(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Reason"
          value={unlockReason}
          onChange={(e) => setUnlockReason(e.target.value)}
        />
        <button
          type="submit"
          className="bg-pink-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Unlock
        </button>
      </form>

      <form onSubmit={handleReserve} className="space-y-2">
        <h2 className="text-xl font-semibold">Reserve Tokens</h2>
        <input
          className="border p-2 w-full"
          placeholder="Amount"
          value={reserveAmount}
          onChange={(e) => setReserveAmount(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Reason"
          value={reserveReason}
          onChange={(e) => setReserveReason(e.target.value)}
        />
        <button
          type="submit"
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Reserve
        </button>
      </form>

      <form onSubmit={handleRelease} className="space-y-2">
        <h2 className="text-xl font-semibold">Release Reserved Tokens</h2>
        <input
          className="border p-2 w-full"
          placeholder="Amount"
          value={releaseAmount}
          onChange={(e) => setReleaseAmount(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Reason"
          value={releaseReason}
          onChange={(e) => setReleaseReason(e.target.value)}
        />
        <button
          type="submit"
          className="bg-indigo-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Release
        </button>
      </form>

      <form onSubmit={handleFilter} className="space-y-2">
        <h2 className="text-xl font-semibold">Filter Transactions</h2>
        <select
          className="border p-2 w-full"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="stakingReward">Staking Reward</option>
          <option value="fee">Fee</option>
        </select>
        <button
          type="submit"
          className="bg-gray-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Apply Filter
        </button>
      </form>

      {transactions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <ul className="space-y-1">
            {transactions.map((tx) => {
              const type = Object.keys(tx.transactionType)[0];
              const time = new Date(
                Number(tx.timestamp / BigInt(1_000_000))
              ).toLocaleString();
              return (
                <li key={tx.id.toString()} className="border p-2 rounded">
                  <span className="font-mono">#{tx.id.toString()}</span> - {type}
                  : {tx.amount.toString()} tokens on {time}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {filteredTransactions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Filtered Transactions</h2>
          <ul className="space-y-1">
            {filteredTransactions.map((tx) => {
              const type = Object.keys(tx.transactionType)[0];
              const time = new Date(
                Number(tx.timestamp / BigInt(1_000_000))
              ).toLocaleString();
              return (
                <li key={tx.id.toString()} className="border p-2 rounded">
                  <span className="font-mono">#{tx.id.toString()}</span> - {type}
                  : {tx.amount.toString()} tokens on {time}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Treasury;
