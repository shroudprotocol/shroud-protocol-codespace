"use client";

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import Button from './Button';
import Input from './Input';
import TokenSelector from './TokenSelector';
import { TOKENS, Token } from '@/lib/tokens';
import { generateFullNote } from '@/lib/shroud';
import { shroudConductorAbi, shroudConductorAddress } from '@/lib/contracts';

const denominations: { [key: string]: string[] } = {
  ETH: ['0.1', '1', '10', '100'],
  SHROUD: ['100', '1000', '10000', '100000'],
  DEFAULT: ['10', '100', '1000', '10000'],
};

export default function DepositForm() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract();
  
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]);
  const [selectedAmount, setSelectedAmount] = useState<string | null>(denominations.ETH[1]);
  const [customAmount, setCustomAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [depositData, setDepositData] = useState<{ note: string; [key: string]: any } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const currentDenominations = denominations[selectedToken.symbol] || denominations.DEFAULT;
  const isCustomDeposit = !!customAmount || !TOKENS.some(t => t.symbol === selectedToken.symbol);
  const amountToDeposit = customAmount || selectedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountToDeposit || !isConnected || !chainId) return;
    try {
      const { fullNoteObject, commitmentHex } = await generateFullNote(selectedToken.symbol, amountToDeposit, chainId, memo);
      setDepositData(fullNoteObject);
      const depositAmount = parseEther(amountToDeposit);
      writeContract({ address: shroudConductorAddress, abi: shroudConductorAbi, functionName: isCustomDeposit ? 'depositCustom' : 'deposit', args: [selectedToken.address, depositAmount, commitmentHex], value: selectedToken.symbol === 'ETH' ? depositAmount : BigInt(0), });
    } catch (err) { console.error("Error during deposit submission:", err); }
  };

  const handleAcknowledge = () => {
    setDepositData(null);
    setIsCopied(false);
    reset();
  };

  const handleCopy = () => {
    if (depositData?.note) {
      navigator.clipboard.writeText(depositData.note);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (isConfirmed && depositData) {
      const notes = JSON.parse(localStorage.getItem('shroud-notes') || '[]');
      notes.push(depositData);
      localStorage.setItem('shroud-notes', JSON.stringify(notes));
    }
  }, [isConfirmed, depositData]);

  if (!isMounted) return null;

  if (isConfirmed && depositData) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold text-success">Deposit Confirmed!</h2>
        <p className="text-sm text-text-secondary">Please save your secret note in a secure location.</p>
        <div className="p-4 bg-background rounded-lg border border-secondary/50">
          <p className="text-xs text-left text-error font-bold mb-2">CRITICAL: Without this note AND your secret memo, your funds are lost forever.</p>
          <textarea readOnly value={depositData.note} rows={4} className="w-full bg-black/30 text-xs p-2 rounded-md font-mono" />
        </div>
        <Button onClick={handleCopy} className="w-full">{isCopied ? 'Copied!' : 'Copy Secret Note'}</Button>
        <button onClick={handleAcknowledge} className="text-sm text-text-secondary hover:text-text-primary pt-2 transition-colors">Done</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TokenSelector selectedToken={selectedToken} setSelectedToken={setSelectedToken} />
      <div><label className="block text-sm font-medium text-text-secondary mb-2">Select Amount</label><div className="grid grid-cols-4 gap-2">{currentDenominations.map((amount) => ( <button type="button" key={amount} onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }} className={`py-2 px-1 text-sm rounded-md transition-colors border ${ selectedAmount === amount ? 'bg-primary/20 border-primary text-primary font-semibold' : 'bg-surface border-secondary/50 hover:border-primary/50 text-text-secondary' }`} > {amount} <span className="text-xs">{selectedToken.symbol}</span> </button> ))}</div></div>
      <div><label className="block text-sm font-medium text-text-secondary mb-2">Or Enter Custom Amount</label><Input type="number" placeholder="e.g., 5.4321" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }} />{(customAmount || !TOKENS.some(t => t.symbol === selectedToken.symbol)) && ( <p className="text-xs text-yellow-500 mt-1"> Warning: Using a custom token or amount may significantly reduce your privacy. </p> )}</div>
      <div><label className="block text-sm font-medium text-text-secondary mb-2">Secret Memo (Optional Password)</label><Input type="password" placeholder="A secret word or phrase only you know" value={memo} onChange={(e) => setMemo(e.target.value)} /><p className="text-xs text-text-secondary mt-1"> <span className="font-bold text-error">CRITICAL:</span> If you set a memo, you MUST remember it to withdraw. </p></div>
      <Button type="submit" className="w-full" disabled={!isMounted || !isConnected || isPending || isConfirming}>{isPending ? 'Check Wallet...' : isConfirming ? 'Depositing...' : 'Generate Note & Deposit'}</Button>
      {hash && <div className="text-xs text-center text-text-secondary mt-2">Transaction Hash: {hash.slice(0, 10)}...</div>}
      {error && <div className="text-xs text-center text-error mt-2">Error: {error.message}</div>}
    </form>
  );
}