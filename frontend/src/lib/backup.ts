import { signMessage } from '@wagmi/core';
import { wagmiConfig } from '@/app/providers';
import { sha256 } from 'viem';
import CryptoJS from 'crypto-js';

export const SIGNATURE_MESSAGE = 'Sign this message to encrypt and back up your Shroud Protocol notes. This is a non-transactional request and will not cost any gas.';

function deriveKeyFromSignature(signature: string): string {
  return sha256(signature as `0x${string}`);
}

export async function getEncryptionKey(): Promise<string> {
  const signature = await signMessage(wagmiConfig, { message: SIGNATURE_MESSAGE });
  return deriveKeyFromSignature(signature);
}

export function encryptNote(note: string, key: string): string {
  const keyHex = CryptoJS.enc.Hex.parse(key.substring(2));
  const encrypted = CryptoJS.AES.encrypt(note, keyHex, {
    iv: keyHex,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return encrypted.toString();
}

export function decryptNote(ciphertext: string, key: string): string {
  const keyHex = CryptoJS.enc.Hex.parse(key.substring(2));
  const decrypted = CryptoJS.AES.decrypt(ciphertext, keyHex, {
    iv: keyHex,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

const API_BASE_URL = process.env.NEXT_PUBLIC_NOTE_SERVICE_URL || 'http://localhost:3001';

export async function saveEncryptedNote(address: string, ciphertext: string): Promise<void> {
  await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, ciphertext }),
  });
}

export async function fetchEncryptedNotes(address: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/notes/${address}`);
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return response.json();
}