"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import NoteCard from '@/components/NoteCard';
import Button from '@/components/Button';
import { ShroudNote } from '@/types';
import { getEncryptionKey, decryptNote, fetchEncryptedNotes } from '@/lib/backup';

export default function HistoryPage() {
  const { address, isConnected } = useAccount();
  const [notes, setNotes] = useState<ShroudNote[]>([]);
  const [decryptionState, setDecryptionState] = useState<'idle' | 'in_progress' | 'success' | 'error'>('idle');

  // Load notes from local storage immediately on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('shroud-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const handleDecrypt = async () => {
    if (!address) return;
    setDecryptionState('in_progress');
    try {
      // 1. Get user signature to derive key
      const key = await getEncryptionKey();
      // 2. Fetch encrypted notes from the server
      const ciphertexts = await fetchEncryptedNotes(address);
      // 3. Decrypt them
      const decryptedNotes = ciphertexts.map(ct => JSON.parse(decryptNote(ct, key)));
      
      // Merge server notes with local notes, avoiding duplicates
      const allNotes = [...notes];
      decryptedNotes.forEach(serverNote => {
        if (!allNotes.some(localNote => localNote.note === serverNote.note)) {
          allNotes.push(serverNote);
        }
      });

      setNotes(allNotes);
      setDecryptionState('success');
    } catch (err) {
      console.error("Decryption failed:", err);
      setDecryptionState('error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-text-primary">Transaction History</h1>
        {isConnected && (
          <Button onClick={handleDecrypt} disabled={decryptionState === 'in_progress'}>
            {decryptionState === 'in_progress' ? 'Checking Wallet...' : 'Sync Encrypted Notes'}
          </Button>
        )}
      </div>
      <p className="text-text-secondary mb-8">Notes saved in this browser are shown below. Sync to recover notes backed up from other devices.</p>
      
      {decryptionState === 'error' && <p className="text-error text-center mb-4">Could not decrypt notes. The wrong wallet may be connected, or the signature was rejected.</p>}

      <div className="space-y-4">
        {notes.length > 0 ? (
          notes.map((noteData, index) => <NoteCard key={index} noteData={noteData} />)
        ) : (
          <div className="text-center py-12 bg-surface rounded-lg">
            <p className="text-text-secondary">You have no saved notes.</p>
          </div>
        )}
      </div>
    </div>
  );
}