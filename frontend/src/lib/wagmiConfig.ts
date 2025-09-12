import { defaultWagmiConfig } from '@web3modal/wagmi/react';
import { hardhat } from 'viem/chains';

// This is a placeholder for your actual forwarded URL from Codespaces
// It's better to use an environment variable for this in a real app,
// but for simplicity, we'll define it here. Make sure it's correct.
const CODESPACE_RPC_URL = 'https://sturdy-engine-77775g6q4vxcxvg4-8545.app.github.dev/';

const codespaceHardhat = {
  ...hardhat,
  rpcUrls: {
    default: {
      http: [CODESPACE_RPC_URL],
    },
  },
} as const;

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set');
}

const metadata = {
  name: 'Shroud Protocol',
  description: 'Privacy-preserving transactions for EVM chains',
  url: 'https://shroud.protocol',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [codespaceHardhat] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});