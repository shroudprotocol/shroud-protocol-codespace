export type ShroudNote = {
  note: string; // The secret part, e.g., "0x...-0x..."
  tokenSymbol: string;
  amount: string;
  chainId: number;
  memo: string;
};