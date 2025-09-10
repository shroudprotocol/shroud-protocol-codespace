import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001; // We'll run this on a different port than our frontend

app.use(cors());
app.use(express.json());

// Endpoint to get all encrypted notes for a specific user address
app.get('/notes/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const notes = await prisma.encryptedNote.findMany({
      where: { userAddress: address.toLowerCase() },
      orderBy: { createdAt: 'desc' },
    });
    // We only send the ciphertext, not other metadata
    res.json(notes.map(note => note.ciphertext));
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Endpoint to save a new encrypted note
app.post('/notes', async (req, res) => {
  const { address, ciphertext } = req.body;

  if (!address || !ciphertext) {
    return res.status(400).json({ error: 'address and ciphertext are required' });
  }

  try {
    const newNote = await prisma.encryptedNote.create({
      data: {
        userAddress: address.toLowerCase(),
        ciphertext,
      },
    });
    res.status(201).json({ success: true, id: newNote.id });
  } catch (error) {
    console.error('Failed to save note:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Secure Note Backup Service running on http://localhost:${PORT}`);
});