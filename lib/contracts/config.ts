// lib/contracts/config.ts
import { baseSepolia } from "viem/chains";

// Contract addresses
export const CONTRACTS = {
  [baseSepolia.id]: {
    daoFactory: "0x7e5adb9add98bf0c9450cb814c3746f655fde93f",
  },
} as const;

// Supported chains
export const SUPPORTED_CHAINS = [baseSepolia] as const;

// Default chain
export const DEFAULT_CHAIN = baseSepolia;

// Get DAO Factory address for a given chain
export function getDaoFactoryAddress(chainId: number): string {
  const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS];
  if (!contracts) {
    throw new Error(`Chain ${chainId} is not supported`);
  }
  return contracts.daoFactory;
}
