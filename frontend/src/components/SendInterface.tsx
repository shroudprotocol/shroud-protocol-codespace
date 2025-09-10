"use client";

import { useState } from 'react';
import DepositForm from './DepositForm'; // Import DepositForm
import WithdrawForm from './WithdrawForm'; // Import WithdrawForm

export default function SendInterface() {
  const [activeTab, setActiveTab] = useState('deposit');

  return (
    <div className="w-full max-w-lg mx-auto bg-surface rounded-xl shadow-lg p-6 sm:p-8">
      {/* Tab Buttons */}
      <div className="flex border-b border-secondary/50 mb-6">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`px-4 py-2 text-sm font-medium transition-colors w-1/2 rounded-t-lg
            ${activeTab === 'deposit' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`px-4 py-2 text-sm font-medium transition-colors w-1/2 rounded-t-lg
            ${activeTab === 'withdraw' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Withdraw
        </button>
      </div>

      {/* Conditional Content */}
      <div>
        {activeTab === 'deposit' && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-1">Create a private note</h2>
            <p className="text-sm text-text-secondary mb-6">
              Deposit funds to generate a new Shroud note. You will need this note to withdraw your funds later.
            </p>
            <DepositForm /> {/* Use the DepositForm component */}
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-1">Withdraw funds</h2>
            <p className="text-sm text-text-secondary mb-6">
              Use your Shroud note to withdraw funds to any address. This action is private.
            </p>
            <WithdrawForm /> {/* Use the WithdrawForm component */}
          </div>
        )}
      </div>
    </div>
  );
}