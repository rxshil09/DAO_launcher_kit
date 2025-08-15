import React, { useState } from 'react';
import { useTreasury } from '../hooks/useTreasury';

const Treasury = () => {
  const { deposit, withdraw, loading, error } = useTreasury();
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDesc, setDepositDesc] = useState('');
  const [recipient, setRecipient] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDesc, setWithdrawDesc] = useState('');

  const handleDeposit = async (e) => {
    e.preventDefault();
    await deposit(depositAmount, depositDesc);
    setDepositAmount('');
    setDepositDesc('');
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    await withdraw(recipient, withdrawAmount, withdrawDesc);
    setRecipient('');
    setWithdrawAmount('');
    setWithdrawDesc('');
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">Treasury</h1>
      {error && <p className="text-red-500">{error}</p>}

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
    </div>
  );
};

export default Treasury;
