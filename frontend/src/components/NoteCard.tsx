"use client";

import { useState, useEffect } from 'react';
import Button from './Button';
import { useRouter } from 'next/navigation';
import { ShroudNote } from '@/types';
import { useReadContract } from 'wagmi';
import { shroudConductorAbi, shroudConductorAddress } from '@/lib/contracts';
import { parseNote, calculateNullifierHash } from '@/lib/shroud';
import { toHex } from 'viem';

interface NoteCardProps {
  noteData: ShroudNote;
}

export default function NoteCard({ noteData }: NoteCardProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [nullifierHash, setNullifierHash] = useState<`0x${string}` | '0x'>('0x');

  useEffect(() => {
    async function computeHash() {
      if (noteData?.note) {
        // We only need the note string part for the nullifier hash calculation now
        const hash = await calculateNullifierHash(noteData.note, noteData.memo);
        setNullifierHash(hash as `0x${string}`);
      }
    }
    computeHash();
  }, [noteData]);

  const { data: isSpent, isLoading } = useReadContract({
    address: shroudConductorAddress,
    abi: shroudConductorAbi,
    functionName: 'nullifiers',
    args: [nullifierHash],
    query: { enabled: nullifierHash !== '0x' },
  });

  const { note, amount, tokenSymbol, memo } = noteData;

  const handleCopy = () => { navigator.clipboard.writeText(note); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };
  const handleWithdraw = () => { router.push(`/?note=${encodeURIComponent(JSON.stringify(noteData))}`); };

  return (
    <div className={`bg-surface p-4 rounded-lg border border-secondary/30 w-full transition-opacity ${isSpent ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-lg font-bold">{amount} {tokenSymbol}</p>
          {memo ? (<p className="text-sm text-text-secondary">Memo: "{memo}"</p>) : (<p className="text-sm text-text-secondary italic">No memo</p>)}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            {(isLoading || nullifierHash === '0x') ? (<span className="text-text-secondary italic">Checking...</span>) : isSpent ? (<span className="text-error font-semibold">Spent</span>) : (<span className="text-success font-semibold">Unspent</span>)}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleCopy} className="text-sm px-3 py-1">{isCopied ? 'Copied!' : 'Copy Secret'}</Button>
            <Button onClick={handleWithdraw} disabled={!!isSpent || isLoading || nullifierHash === '0x'} className="text-sm px-3 py-1">Withdraw</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
