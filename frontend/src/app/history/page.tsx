"use client";

import { useState, useEffect } from 'react';
import NoteCard from '@/components/NoteCard';
import { ShroudNote } from '@/types';

export default function HistoryPage() {
  const [notes, setNotes] = useState<ShroudNote[]>([]);

  useEffect(() => {
    const savedNotes = localStorage.getItem('shroud-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-2">Transaction History</h1>
      <p className="text-text-secondary mb-8">Notes saved in this browser. This data is not backed up.</p>

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