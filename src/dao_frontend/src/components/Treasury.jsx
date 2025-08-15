import React, { useState, useEffect } from 'react';
import { useTreasury } from '../hooks/useTreasury';

const Treasury = () => {
  const {
    deposit,
    withdraw,
    getBalance,
    getAllTransactions,
    loading,
    error,
  } = useTreasury();
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDesc, setDepositDesc] = useState('');
  const [recipient, setRecipient] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDesc, setWithdrawDesc] = useState('');
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchData = async () => {
    try {
      const bal = await getBalance();
      setBalance(bal);
      const txs = await getAllTransactions();
      txs.sort((a, b) => Number(b.timestamp - a.timestamp));
      setTransactions(txs.slice(0, 5));
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
    </div>
  );
};

export default Treasury;
