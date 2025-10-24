// lib/contracts/signal-registry.ts
import { Address, parseUnits, formatUnits, WalletClient, PublicClient } from "viem";
import { SignalRegistryAbi } from "@/lib/abis/signal-registry";
import { GovernanceTokenAbi } from "@/lib/abis/governance-token";

export interface PlaceSignalParams {
  registryAddress: Address;
  cid: string; // IPFS CID of the content
  amount: string; // in whole tokens (e.g., "100")
}

export interface WithdrawSignalParams {
  registryAddress: Address;
  cid: string; // IPFS CID of the content
  amount: string; // in whole tokens (e.g., "100")
}

export interface SignalResult {
  txHash: Address;
  userRawAfter: bigint;
  userSqrtAfter: bigint;
  totalRawAfter: bigint;
  totalQuadAfter: bigint;
}

/**
 * Place tokens on content (signal support)
 */
export async function placeSignal(
  walletClient: WalletClient,
  publicClient: PublicClient,
  tokenAddress: Address,
  params: PlaceSignalParams
): Promise<SignalResult> {
  const amountWei = parseUnits(params.amount, 18);

  // First, approve the signal registry to spend tokens
  const { request: approveRequest } = await publicClient.simulateContract({
    address: tokenAddress,
    abi: GovernanceTokenAbi,
    functionName: "approve",
    args: [params.registryAddress, amountWei],
    account: walletClient.account!,
  });

  const approveHash = await walletClient.writeContract(approveRequest);
  await publicClient.waitForTransactionReceipt({ hash: approveHash });

  // Then, signal the content
  const { request } = await publicClient.simulateContract({
    address: params.registryAddress,
    abi: SignalRegistryAbi,
    functionName: "signal",
    args: [params.cid, amountWei],
    account: walletClient.account!,
  });

  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  // Parse the Signaled event
  const signaledEvent = receipt.logs.find((log) => {
    try {
      const decoded = (publicClient as any).parseEventLogs({
        abi: SignalRegistryAbi,
        logs: [log],
        eventName: "Signaled",
      });
      return decoded.length > 0;
    } catch {
      return false;
    }
  });

  if (!signaledEvent) {
    throw new Error("Signaled event not found in transaction receipt");
  }

  const parsedEvent = (publicClient as any).parseEventLogs({
    abi: SignalRegistryAbi,
    logs: [signaledEvent],
    eventName: "Signaled",
  })[0];

  return {
    txHash: hash,
    userRawAfter: parsedEvent.args.userRawAfter as bigint,
    userSqrtAfter: parsedEvent.args.userSqrtAfter as bigint,
    totalRawAfter: parsedEvent.args.totalRawAfter as bigint,
    totalQuadAfter: parsedEvent.args.totalQuadAfter as bigint,
  };
}

/**
 * Withdraw tokens from content (withdraw support)
 */
export async function withdrawSignal(
  walletClient: WalletClient,
  publicClient: PublicClient,
  params: WithdrawSignalParams
): Promise<SignalResult> {
  const amountWei = parseUnits(params.amount, 18);

  const { request } = await publicClient.simulateContract({
    address: params.registryAddress,
    abi: SignalRegistryAbi,
    functionName: "withdraw",
    args: [params.cid, amountWei],
    account: walletClient.account!,
  });

  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  // Parse the Withdrawn event
  const withdrawnEvent = receipt.logs.find((log) => {
    try {
      const decoded = (publicClient as any).parseEventLogs({
        abi: SignalRegistryAbi,
        logs: [log],
        eventName: "Withdrawn",
      });
      return decoded.length > 0;
    } catch {
      return false;
    }
  });

  if (!withdrawnEvent) {
    throw new Error("Withdrawn event not found in transaction receipt");
  }

  const parsedEvent = (publicClient as any).parseEventLogs({
    abi: SignalRegistryAbi,
    logs: [withdrawnEvent],
    eventName: "Withdrawn",
  })[0];

  return {
    txHash: hash,
    userRawAfter: parsedEvent.args.userRawAfter as bigint,
    userSqrtAfter: parsedEvent.args.userSqrtAfter as bigint,
    totalRawAfter: parsedEvent.args.totalRawAfter as bigint,
    totalQuadAfter: parsedEvent.args.totalQuadAfter as bigint,
  };
}

/**
 * Get user's position on a specific content CID
 */
export async function getUserPosition(
  publicClient: PublicClient,
  registryAddress: Address,
  cid: string,
  userAddress: Address
): Promise<{ rawAmount: bigint; sqrtWeight: bigint }> {
  // First get the CID hash
  const cidHash = await publicClient.readContract({
    address: registryAddress,
    abi: SignalRegistryAbi,
    functionName: "cidHashOf",
    args: [cid],
  });

  const result = await publicClient.readContract({
    address: registryAddress,
    abi: SignalRegistryAbi,
    functionName: "positions",
    args: [cidHash as `0x${string}`, userAddress],
  });

  return {
    rawAmount: result as any[0] as bigint,
    sqrtWeight: result as any[1] as bigint,
  };
}

/**
 * Get memory aggregate data for a content CID
 */
export async function getMemoryAggregate(
  publicClient: PublicClient,
  registryAddress: Address,
  cid: string
): Promise<{
  cid: string;
  dao: Address;
  totalRaw: bigint;
  totalQuadWeight: bigint;
  supporters: number;
  exists: boolean;
}> {
  const cidHash = await publicClient.readContract({
    address: registryAddress,
    abi: SignalRegistryAbi,
    functionName: "cidHashOf",
    args: [cid],
  });

  const result = await publicClient.readContract({
    address: registryAddress,
    abi: SignalRegistryAbi,
    functionName: "getMemoryByHash",
    args: [cidHash as `0x${string}`],
  });

  return {
    cid: result as any[0] as string,
    dao: result as any[1] as Address,
    totalRaw: result as any[2] as bigint,
    totalQuadWeight: result as any[3] as bigint,
    supporters: Number(result as any[4]),
    exists: result as any[5] as boolean,
  };
}

/**
 * Get user's token balance
 */
export async function getTokenBalance(
  publicClient: PublicClient,
  tokenAddress: Address,
  userAddress: Address
): Promise<string> {
  const balance = await publicClient.readContract({
    address: tokenAddress,
    abi: GovernanceTokenAbi,
    functionName: "balanceOf",
    args: [userAddress],
  });

  return formatUnits(balance as bigint, 18);
}
