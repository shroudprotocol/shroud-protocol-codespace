// @ts-ignore - circomlibjs is not typed
import { buildPoseidon } from "circomlibjs";
import { toHex, hexToBigInt, padHex } from 'viem';

let poseidon: any;

async function getPoseidon() {
  if (!poseidon) {
    poseidon = await buildPoseidon();
  }
  return poseidon;
}

const randomHex = () => {
  const randomBytes = crypto.getRandomValues(new Uint8Array(31));
  return toHex(randomBytes);
};

export async function generateFullNote(tokenSymbol: string, amount: string, chainId: number, memo: string = '') {
  const poseidon = await getPoseidon();
  
  const secret = hexToBigInt(randomHex());
  const nullifier = hexToBigInt(randomHex());

  const memoHash = memo ? poseidon([hexToBigInt(toHex(new TextEncoder().encode(memo)))]) : 0;
  
  const commitment = poseidon([secret, nullifier, memoHash]);
  const commitmentHex = padHex(toHex(commitment), { size: 32 });

  // THE NEW, CLEAN NOTE FORMAT: Just secret and nullifier.
  const noteString = `${toHex(secret)}-${toHex(nullifier)}`;

  // The full object to be saved to local storage/backups.
  // The memo is stored here, but NOT in the noteString.
  const fullNoteObject = {
    note: noteString,
    tokenSymbol,
    amount,
    chainId,
    memo,
  };

  return { fullNoteObject, commitmentHex };
}