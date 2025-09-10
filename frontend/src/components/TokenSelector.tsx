"use client";

import { useState } from 'react';
import Image from 'next/image'; // Import the Next.js Image component
import { Token } from '@/lib/tokens';
import { useCustomTokens } from '@/hooks/useCustomTokens';
import Input from './Input';
import Button from './Button';

interface TokenSelectorProps {
  selectedToken: Token;
  setSelectedToken: (token: Token) => void;
}

export default function TokenSelector({ selectedToken, setSelectedToken }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { allTokens, addCustomToken } = useCustomTokens();
  
  const handleSelect = (token: Token) => {
    setSelectedToken(token);
    setIsOpen(false);
  };

  const TokenDisplay = ({ token }: { token: Token }) => (
    <div className="flex items-center">
      {token.icon ? (
        <Image src={token.icon} alt={`${token.symbol} logo`} width={24} height={24} className="mr-2" />
      ) : (
        <div className="w-6 h-6 mr-2 bg-secondary rounded-full" />
      )}
      <span>{token.symbol}</span>
    </div>
  );

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-text-secondary mb-2">
        Select Token
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-background border border-secondary/50 rounded-lg px-3 py-2 text-text-primary"
      >
        <TokenDisplay token={selectedToken} />
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-secondary/50 rounded-lg z-10 shadow-lg">
          {allTokens.map((token) => (
            <button
              key={token.symbol}
              type="button"
              onClick={() => handleSelect(token)}
              className="w-full flex items-center px-3 py-2 text-left hover:bg-primary/10"
            >
              {token.icon ? <Image src={token.icon} alt={`${token.symbol} logo`} width={24} height={24} className="mr-2" /> : <div className="w-6 h-6 mr-2 bg-secondary rounded-full" />}
              <span>{token.name} ({token.symbol})</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setIsOpen(false); setIsModalOpen(true); }}
            className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/10"
          >
            + Add Custom Token
          </button>
        </div>
      )}

      {isModalOpen && (
        <AddTokenModal 
          onClose={() => setIsModalOpen(false)} 
          onAddToken={(token) => { addCustomToken(token); setSelectedToken(token); }} 
        />
      )}
    </div>
  );
}

// AddTokenModal sub-component remains the same
function AddTokenModal({ onClose, onAddToken }: { onClose: () => void; onAddToken: (token: Token) => void; }) {
  const [address, setAddress] = useState('');
  const [symbol, setSymbol] = useState('');
  const [name, setSymbolName] = useState('');

  const handleAdd = () => {
    if (!address || !symbol || !name) return;
    const newToken: Token = { address, symbol, name, icon: '' }; // Custom tokens won't have an icon
    onAddToken(newToken);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg p-6 w-full max-w-sm space-y-4">
        <h3 className="text-lg font-semibold">Add Custom Token</h3>
        <p className="text-sm text-yellow-500">Warning: Using tokens with a small user base provides little to no privacy. Proceed with caution.</p>
        <div><label className="text-xs text-text-secondary">Token Contract Address</label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." /></div>
        <div className="flex gap-4">
          <div><label className="text-xs text-text-secondary">Symbol</label><Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="e.g. MYT" /></div>
          <div><label className="text-xs text-text-secondary">Name</label><Input value={name} onChange={(e) => setSymbolName(e.target.value)} placeholder="e.g. My Token" /></div>
        </div>
        <div className="flex gap-4"><Button variant="secondary" onClick={onClose} className="w-full">Cancel</Button><Button onClick={handleAdd} className="w-full">Add Token</Button></div>
      </div>
    </div>
  );
}