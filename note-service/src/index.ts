import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createPublicClient, http, parseAbiItem, hexToBigInt } from 'viem';
import { hardhat } from 'viem/chains';
import { MerkleTree } from 'fixed-merkle-tree';
// @ts-ignore - circomlibjs is not typed
import { buildPoseidon } from 'circomlibjs';

// --- Configuration ---
const prisma = new PrismaClient();
const app = express();
const PORT = 3001;
const TREE_LEVELS = 20;
// NOTE: This address must be updated every time you restart the Hardhat node.
const SHROUD_CONDUCTOR_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

// --- Asynchronous State Initialization ---
let merkleTree: MerkleTree;
let poseidon: any;
let indexedBlock = 0n;

// --- Viem Client Setup ---
const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// Endpoint to get all encrypted notes for a specific user address
app.get('/notes/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const notes = await prisma.encryptedNote.findMany({
      where: { userAddress: address.toLowerCase() },
      orderBy: { createdAt: 'desc' },
    });
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
      data: { userAddress: address.toLowerCase(), ciphertext },
    });
    res.status(201).json({ success: true, id: newNote.id });
  } catch (error) {
    console.error('Failed to save note:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// Endpoint to get a Merkle proof for a given commitment
app.get('/proof/:commitment', (req, res) => {
  const { commitment } = req.params;
  if (!merkleTree) {
    return res.status(503).json({ error: 'Indexer is not ready' });
  }
  try {
    const commitmentAsBigInt = hexToBigInt(commitment as `0x${string}`);
    const leafIndex = merkleTree.indexOf(commitmentAsBigInt);

    if (leafIndex === -1) {
      return res.status(404).json({ error: 'Commitment not found in tree' });
    }
    const proof = merkleTree.proof(commitmentAsBigInt);
    res.json({ ...proof, root: merkleTree.root });
  } catch (error) {
    console.error('Failed to generate proof:', error);
    res.status(500).json({ error: 'Failed to generate proof' });
  }
});

// Endpoint to get the current status of the Merkle tree
app.get('/status', (req, res) => {
  if (!merkleTree) {
    return res.status(503).json({ error: 'Indexer is not ready' });
  }
  res.json({
    root: merkleTree.root.toString(),
    leafCount: merkleTree.elements.length,
    indexedBlock: indexedBlock.toString(),
  });
});

// --- Blockchain Indexer Logic ---
async function syncEvents() {
  if (!merkleTree) {
    console.log("Merkle tree not initialized, skipping sync.");
    return;
  }
  console.log('Checking for new deposit events...');
  try {
    const toBlock = await publicClient.getBlockNumber();
    if (toBlock <= indexedBlock) {
      console.log('No new blocks to process.');
      return;
    }

    const logs = await publicClient.getLogs({
      address: SHROUD_CONDUCTOR_ADDRESS,
      event: parseAbiItem('event Deposit(address indexed token, uint256 amount, bytes32 indexed commitment, uint256 timestamp, bool isCustom)'),
      fromBlock: indexedBlock > 0n ? indexedBlock + 1n : 0n,
      toBlock: toBlock,
    });

    if (logs.length > 0) {
      console.log(`Found ${logs.length} new deposit(s).`);
      for (const log of logs) {
        // CORRECTED: Convert the commitment from a hex string to a BigInt before inserting
        const commitmentAsBigInt = hexToBigInt(log.args.commitment!);
        merkleTree.insert(commitmentAsBigInt);
      }
      console.log(`Merkle tree updated. New root: ${merkleTree.root.toString()}`);
    }
    indexedBlock = toBlock;
  } catch (error) {
    console.error('Error syncing events:', error);
  }
}

// --- Main Server Start Function ---
async function startServer() {
  poseidon = await buildPoseidon();
  
  merkleTree = new MerkleTree(TREE_LEVELS, [], {
    hashFunction: (l, r) => poseidon([l, r]),
    zeroElement: BigInt(0)
  });
  console.log('Merkle tree initialized.');

  app.listen(PORT, async () => {
    console.log(`✅ Note Service & Indexer running on http://localhost:${PORT}`);
    await syncEvents();
    setInterval(syncEvents, 15000);
  });
}

startServer();