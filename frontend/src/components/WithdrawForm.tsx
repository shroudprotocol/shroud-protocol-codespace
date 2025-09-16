"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from './Button';
import Input from './Input';
import TokenSelector from './TokenSelector';
import { TOKENS, Token } from '@/lib/tokens';
import { ShroudNote } from '@/types';
import { generateProof } from '@/lib/shroud';
import { shroudConductorAbi, shroudConductorAddress } from '@/lib/contracts';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useIsMounted } from '@/hooks/useIsMounted';
import { parseEther } from 'viem';

export default function WithdrawForm() {
  const isMounted = useIsMounted();
  const { isConnected } = useAccount();
  const searchParams = useSearchParams();
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]);
  const [noteString, setNoteString] = useState('');
  const [memo, setMemo] = useState('');
  const [recipient, setRecipient] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [amount, setAmount] = useState('0');

  useEffect(() => {
    const noteParam = searchParams.get('note');
    if (noteParam) {
      try {
        const parsedNote: ShroudNote = JSON.parse(decodeURIComponent(noteParam));
        setNoteString(parsedNote.note);
        setMemo(parsedNote.memo);
        setAmount(parsedNote.amount);
        const token = TOKENS.find(t => t.symbol === parsedNote.tokenSymbol);
        if (token) setSelectedToken(token);
      } catch (e) { console.error("Failed to parse note from URL", e); }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteString || !recipient) {
      setStatusMessage("Error: Please provide a secret note and recipient address.");
      return;
    }
    
    const allNotes: ShroudNote[] = JSON.parse(localStorage.getItem('shroud-notes') || '[]');
    const noteDataForProof = allNotes.find(n => n.note === noteString.trim());

    if (!noteDataForProof) {
      setStatusMessage("Error: Could not find this note in your browser's local storage.");
      return;
    }
    
    noteDataForProof.memo = memo;

    try {
      setStatusMessage("1/3: Generating ZK proof...");
      const { formattedProof, publicSignals } = await generateProof(noteDataForProof, recipient);
      
      setStatusMessage("2/3: Proof generated. Please confirm transaction...");
      const withdrawAmount = parseEther(noteDataForProof.amount);

      writeContract({
        address: shroudConductorAddress,
        abi: shroudConductorAbi,
        functionName: 'withdraw',
        args: [ formattedProof.a, formattedProof.b, formattedProof.c, publicSignals, selectedToken.address, withdrawAmount ],
      });
    } catch (err: any) { console.error("Withdrawal failed:", err); setStatusMessage(`Error: ${err.message}`); }
  };
  
  useEffect(() => {
    if (isConfirmed) {
        setStatusMessage("3/3: Withdrawal successful!");
        if (noteString) {
            const notes = JSON.parse(localStorage.getItem('shroud-notes') || '[]');
            const updatedNotes = notes.filter((n: ShroudNote) => n.note !== noteString.trim());
            localStorage.setItem('shroud-notes', JSON.stringify(updatedNotes));
        }
        setTimeout(() => { reset(); setNoteString(''); setMemo(''); setRecipient(''); setStatusMessage(''); setAmount('0'); }, 5000);
    }
  }, [isConfirmed, reset, noteString]);
  
  if (!isMounted) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TokenSelector selectedToken={selectedToken} setSelectedToken={setSelectedToken} />
      <div><label className="block text-sm font-medium text-text-secondary mb-2">Secret Note</label><Input value={noteString} onChange={(e) => setNoteString(e.target.value)} placeholder="Paste your 124-character secret note here" className="font-mono" /></div>
      <div><label className="block text-sm font-medium text-text-secondary mb-2">Secret Memo</label><Input type="password" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Enter the secret memo for this note" /></div>
      <div><label className="block text-sm font-medium text-text-secondary mb-2">Recipient Address</label><Input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="0x..." /></div>
      <Button type="submit" className="w-full" disabled={!isConnected || isPending || isConfirming || statusMessage.startsWith('1/3')}>
        {isPending ? 'Check Wallet...' : isConfirming ? 'Withdrawing...' : statusMessage.startsWith('1/3') ? 'Generating Proof...' : 'Generate Proof & Withdraw'}
      </Button>
      {statusMessage && <div className="text-xs text-center text-text-secondary mt-2">{statusMessage}</div>}
      {error && <div className="text-xs text-center text-error mt-2">Error: {error.message}</div>}
    </form>
  );
}
