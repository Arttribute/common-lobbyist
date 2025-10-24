// hooks/useContracts.ts
"use client";

import { useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import {
  createWalletClient,
  custom,
  createPublicClient,
  http,
  type WalletClient,
  type PublicClient,
  type Transport,
  type Chain,
  type Account
} from "viem";
import { baseSepolia } from "viem/chains";
import {
  createDAOOnChain,
  CreateDAOParams,
  CreateDAOResult,
} from "@/lib/contracts/dao-factory";
import {
  placeSignal,
  withdrawSignal,
  PlaceSignalParams,
  WithdrawSignalParams,
  SignalResult,
  getTokenBalance,
  getUserPosition,
  getMemoryAggregate,
} from "@/lib/contracts/signal-registry";
import type { Address } from "viem";

export function useContracts() {
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the active wallet
  const activeWallet = wallets.find((wallet) => wallet);

  // Create viem clients
  const getClients = async () => {
    if (!activeWallet) {
      throw new Error("No wallet connected");
    }

    const provider = await activeWallet.getEthereumProvider();

    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: custom(provider),
      account: activeWallet.address as Address,
    }) as WalletClient<Transport, Chain, Account>;

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    }) as PublicClient<Transport, Chain>;

    return { walletClient, publicClient };
  };

  // Create a new DAO
  const createDAO = async (
    params: CreateDAOParams
  ): Promise<CreateDAOResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { walletClient, publicClient } = await getClients();
      const result = await createDAOOnChain(walletClient, publicClient, params);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create DAO";
      setError(errorMessage);
      console.error("Error creating DAO:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Place a signal (allocate tokens to content)
  const placeSignalOnContent = async (
    tokenAddress: Address,
    params: PlaceSignalParams
  ): Promise<SignalResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { walletClient, publicClient } = await getClients();
      const result = await placeSignal(
        walletClient,
        publicClient,
        tokenAddress,
        params
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to place signal";
      setError(errorMessage);
      console.error("Error placing signal:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw a signal (remove tokens from content)
  const withdrawSignalFromContent = async (
    params: WithdrawSignalParams
  ): Promise<SignalResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { walletClient, publicClient } = await getClients();
      const result = await withdrawSignal(walletClient, publicClient, params);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to withdraw signal";
      setError(errorMessage);
      console.error("Error withdrawing signal:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's token balance
  const fetchTokenBalance = async (
    tokenAddress: Address
  ): Promise<string | null> => {
    if (!activeWallet) {
      setError("No wallet connected");
      return null;
    }

    try {
      const { publicClient } = await getClients();
      const balance = await getTokenBalance(
        publicClient,
        tokenAddress,
        activeWallet.address as Address
      );
      return balance;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch balance";
      setError(errorMessage);
      console.error("Error fetching balance:", err);
      return null;
    }
  };

  // Get user's position on a content CID
  const fetchUserPosition = async (
    registryAddress: Address,
    cid: string
  ): Promise<{ rawAmount: bigint; sqrtWeight: bigint } | null> => {
    if (!activeWallet) {
      setError("No wallet connected");
      return null;
    }

    try {
      const { publicClient } = await getClients();
      const position = await getUserPosition(
        publicClient,
        registryAddress,
        cid,
        activeWallet.address as Address
      );
      return position;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch user position";
      setError(errorMessage);
      console.error("Error fetching user position:", err);
      return null;
    }
  };

  // Get memory aggregate for a content CID
  const fetchMemoryAggregate = async (
    registryAddress: Address,
    cid: string
  ) => {
    try {
      const { publicClient } = await getClients();
      const aggregate = await getMemoryAggregate(
        publicClient,
        registryAddress,
        cid
      );
      return aggregate;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch memory aggregate";
      setError(errorMessage);
      console.error("Error fetching memory aggregate:", err);
      return null;
    }
  };

  return {
    // State
    isLoading,
    error,
    walletAddress: activeWallet?.address,
    isConnected: !!activeWallet,

    // DAO operations
    createDAO,

    // Signal operations
    placeSignalOnContent,
    withdrawSignalFromContent,

    // Read operations
    fetchTokenBalance,
    fetchUserPosition,
    fetchMemoryAggregate,
  };
}
