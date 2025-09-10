"use client";

import { useState } from 'react';
import Button from './Button';
import { useRouter } from 'next/navigation';
import { ShroudNote } from '@/types'; // Import our new type

interface NoteCardProps {
  noteData: ShroudNote; // Expect the full object
}

export default function NoteCard({ noteData }: NoteCardProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  // Directly access properties from the object
  const { note, amount, tokenSymbol, memo } = noteData;

  const handleCopy = () => {
    // Only copy the secret part of the note
    navigator.clipboard.writeText(note);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleWithdraw = () => {
    // Pass the secret note and memo to the home page to pre-fill the form
    const params = new URLSearchParams({
      note: note,
      memo: memo,
    });
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="bg-surface p-4 rounded-lg border border-secondary/30 w-full">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-lg font-bold">{amount} {tokenSymbol}</p>
          {memo ? (
            <p className="text-sm text-text-secondary">Memo: "{memo}"</p>
          ) : (
            <p className="text-sm text-text-secondary italic">No memo</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleCopy} className="text-sm px-3 py-1">
            {isCopied ? 'Copied!' : 'Copy Secret'}
          </Button>
          <Button onClick={handleWithdraw} className="text-sm px-3 py-1">
            Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
}