// hooks/use-signal.ts
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useWallets } from "@privy-io/react-auth";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  type WalletClient,
  type PublicClient,
  type Transport,
  type Chain,
  type Account,
} from "viem";
import { baseSepolia } from "viem/chains";
import {
  placeSignal,
  withdrawSignal,
  type PlaceSignalParams,
  type WithdrawSignalParams,
} from "@/lib/contracts/signal-registry";
import { Address } from "viem";

export function useSignal() {
  const { authenticated, authState } = useAuth();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the active wallet
  const activeWallet = wallets.find((wallet) => wallet);

  const placeTokens = async (
    registryAddress: string,
    tokenAddress: string,
    contentId: string,
    amount: string,
    daoId: string
  ) => {
    if (!authenticated || !authState.walletAddress) {
      throw new Error("Please connect your wallet");
    }

    if (!activeWallet) {
      throw new Error("No active wallet found");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get Privy wallet provider
      const provider = await activeWallet.getEthereumProvider();

      // Create wallet and public clients
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(provider),
        account: activeWallet.address as Address,
      }) as WalletClient<Transport, Chain, Account>;

      const rpcUrl =
        process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ||
        "https://sepolia.base.org";

      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(rpcUrl),
      }) as PublicClient;

      // Generate CID for the content
      const cid = `content:${contentId}`;

      console.log("Placing signal with params:", {
        registryAddress,
        tokenAddress,
        cid,
        amount,
      });

      // Place signal on-chain
      const result = await placeSignal(
        walletClient as any,
        publicClient as any,
        tokenAddress as Address,
        {
          registryAddress: registryAddress as Address,
          cid,
          amount,
        } as PlaceSignalParams
      );

      console.log("Signal placed successfully:", result);

      // Validate result has required fields
      if (!result.totalRawAfter || !result.totalQuadAfter) {
        console.error("Invalid result from placeSignal:", result);
        throw new Error("Failed to read signal data from contract. Transaction succeeded but state sync failed.");
      }

      // Sync to database
      const syncRes = await fetch("/api/content/signal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.idToken}`,
        },
        body: JSON.stringify({
          contentId,
          daoId,
          totalRaw: result.totalRawAfter.toString(),
          totalQuadWeight: result.totalQuadAfter.toString(),
          supporters: 1,
          txHash: result.txHash,
          userAmount: amount,
        }),
      });

      if (!syncRes.ok) {
        console.warn("Failed to sync signal to database, but on-chain transaction succeeded");
      }

      setIsLoading(false);
      return result;
    } catch (err) {
      console.error("Error placing signal:", err);
      const message = err instanceof Error ? err.message : "Failed to place signal";
      setError(message);
      setIsLoading(false);
      throw err;
    }
  };

  const withdrawTokens = async (
    registryAddress: string,
    contentId: string,
    amount: string,
    daoId: string
  ) => {
    if (!authenticated || !authState.walletAddress) {
      throw new Error("Please connect your wallet");
    }

    if (!activeWallet) {
      throw new Error("No active wallet found");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get Privy wallet provider
      const provider = await activeWallet.getEthereumProvider();

      // Create wallet and public clients
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(provider),
        account: activeWallet.address as Address,
      }) as WalletClient<Transport, Chain, Account>;

      const rpcUrl =
        process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ||
        "https://sepolia.base.org";

      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(rpcUrl),
      }) as PublicClient;

      // Generate CID for the content
      const cid = `content:${contentId}`;

      // Withdraw signal on-chain
      const result = await withdrawSignal(
        walletClient as any,
        publicClient as any,
        {
          registryAddress: registryAddress as Address,
          cid,
          amount,
        } as WithdrawSignalParams
      );

      // Sync to database
      const syncRes = await fetch("/api/content/signal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.idToken}`,
        },
        body: JSON.stringify({
          contentId,
          daoId,
          totalRaw: result.totalRawAfter.toString(),
          totalQuadWeight: result.totalQuadAfter.toString(),
          supporters: 1,
          txHash: result.txHash,
          userAmount: `-${amount}`,
        }),
      });

      if (!syncRes.ok) {
        console.warn("Failed to sync withdrawal to database, but on-chain transaction succeeded");
      }

      setIsLoading(false);
      return result;
    } catch (err) {
      console.error("Error withdrawing signal:", err);
      const message = err instanceof Error ? err.message : "Failed to withdraw signal";
      setError(message);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    placeTokens,
    withdrawTokens,
    isLoading,
    error,
  };
}
