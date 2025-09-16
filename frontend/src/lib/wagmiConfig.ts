import { defaultWagmiConfig } from '@web3modal/wagmi/react';
import { hardhat } from 'viem/chains';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set in .env.local');
}

const metadata = {
  name: 'Shroud Protocol',
  description: 'Privacy-preserving transactions',
  url: 'https://shroud.protocol',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [hardhat] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});
