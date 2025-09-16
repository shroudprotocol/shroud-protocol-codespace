"use client";

import React, { ReactNode, useEffect } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiProvider, useAccount, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmiConfig';
import { hardhat } from 'viem/chains';

const queryClient = new QueryClient();
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;

createWeb3Modal({
  wagmiConfig,
  projectId,
  themeMode: 'dark',
});

function Web3ConnectionManager({ children }: { children: ReactNode }) {
  const { chainId, status } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (status === 'connected' && chainId !== hardhat.id) {
      console.warn(`Wallet connected to wrong chain (ID: ${chainId}), disconnecting.`);
      disconnect();
    }
  }, [status, chainId, disconnect]);

  return <>{children}</>;
}

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3ConnectionManager>
          {children}
        </Web3ConnectionManager>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
