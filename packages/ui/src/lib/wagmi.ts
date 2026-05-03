import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, baseSepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

export const zeroGChain = defineChain({
  id: 16602,
  name: '0G Chain Testnet',
  nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_ZEROG_RPC || 'https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://chainscan-galileo.0g.ai' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Hustl3',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [zeroGChain, mainnet, baseSepolia, sepolia],
  ssr: false,
});