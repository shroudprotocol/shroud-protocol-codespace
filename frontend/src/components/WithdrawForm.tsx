"use client";

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import TokenSelector from './TokenSelector';
import { TOKENS, Token } from '@/lib/tokens';

export default function WithdrawForm() {
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]);

  return (
    <div className="space-y-6">
      <TokenSelector selectedToken={selectedToken} setSelectedToken={setSelectedToken} />

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Shroud Note
        </label>
        <textarea
          rows={3}
          placeholder="Paste your full Shroud note here..."
          className="w-full bg-background border border-secondary/50 rounded-lg px-3 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Secret Memo
        </label>
        <Input
          type="password"
          placeholder="Enter the secret memo for this note"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Recipient Address
        </label>
        <Input type="text" placeholder="0x..." />
      </div>

      <Button className="w-full">Generate Proof & Withdraw</Button>
    </div>
  );
}