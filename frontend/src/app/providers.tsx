"use client";

import React, { ReactNode } from 'react';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider } from 'wagmi';
import { hardhat } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

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

const chains = [hardhat] as const;
export const wagmiConfig = defaultWagmiConfig({ // Add 'export' here
  chains,
  projectId,
  metadata,
});

// Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  // CORRECTED: The 'chains' property is no longer needed here and has been removed.
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#0D0E12',
    '--w3m-accent': '#6366F1',
  }
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}