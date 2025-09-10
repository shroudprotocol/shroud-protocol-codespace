"use client";

import { useState, useEffect } from 'react';
import NoteCard from '@/components/NoteCard';
import { ShroudNote } from '@/types'; // Import our new type

export default function HistoryPage() {
  const [notes, setNotes] = useState<ShroudNote[]>([]); // Use the correct type

  useEffect(() => {
    const savedNotes = localStorage.getItem('shroud-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-2">Transaction History</h1>
      <p className="text-text-secondary mb-8">View your locally saved notes. This data is stored only in your browser.</p>

      <div className="space-y-4">
        {notes.length > 0 ? (
          // Pass the entire note object to the NoteCard
          notes.map((noteData, index) => <NoteCard key={index} noteData={noteData} />)
        ) : (
          <div className="text-center py-12 bg-surface rounded-lg">
            <p className="text-text-secondary">You have no saved notes.</p>
            <p className="text-text-secondary text-sm">Make a deposit to see your history here.</p>
          </div>
        )}
      </div>
    </div>
  );
}