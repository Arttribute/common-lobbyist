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

// Type for positions() return value
interface PositionData {
  rawAmount?: bigint;
  sqrtWeight?: bigint;
  0?: bigint;
  1?: bigint;
}

// Type for getMemoryByHash() return value
interface MemoryAggregate {
  cid?: string;
  dao?: Address;
  totalRaw?: bigint;
  totalQuadWeight?: bigint;
  supporters?: number;
  exists?: boolean;
  0?: string;
  1?: Address;
  2?: bigint;
  3?: bigint;
  4?: number;
  5?: boolean;
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

  if (receipt.status !== "success") {
    throw new Error(`Signal transaction failed. Hash: ${hash}`);
  }

  console.log("Signal transaction successful:", hash);

  // Read the state after transaction to get updated values
  const cidHash = await publicClient.readContract({
    address: params.registryAddress,
    abi: SignalRegistryAbi,
    functionName: "cidHashOf",
    args: [params.cid],
  });

  console.log("CID hash:", cidHash);
  console.log("Reading position for user:", walletClient.account!.address);

  // Get user's position
  const userPosition = await publicClient.readContract({
    address: params.registryAddress,
    abi: SignalRegistryAbi,
    functionName: "positions",
    args: [cidHash as `0x${string}`, walletClient.account!.address],
  });

  console.log("User position:", userPosition);

  // Get memory aggregate
  const memoryData = await publicClient.readContract({
    address: params.registryAddress,
    abi: SignalRegistryAbi,
    functionName: "getMemoryByHash",
    args: [cidHash as `0x${string}`],
  });

  console.log("Memory data:", memoryData);

  // Parse the struct/tuple results
  // positions returns { rawAmount, sqrtWeight } or [rawAmount, sqrtWeight]
  // getMemoryByHash returns { cid, dao, totalRaw, totalQuadWeight, supporters, exists }
  const positionData = userPosition as PositionData;
  const memoryStruct = memoryData as MemoryAggregate;

  const result = {
    txHash: hash,
    userRawAfter: BigInt(positionData.rawAmount || positionData[0] || 0),
    userSqrtAfter: BigInt(positionData.sqrtWeight || positionData[1] || 0),
    totalRawAfter: BigInt(memoryStruct.totalRaw || memoryStruct[2] || 0),
    totalQuadAfter: BigInt(memoryStruct.totalQuadWeight || memoryStruct[3] || 0),
  };

  console.log("Returning result:", result);

  return result;
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

  if (receipt.status !== "success") {
    throw new Error(`Withdraw transaction failed. Hash: ${hash}`);
  }

  console.log("Withdraw transaction successful:", hash);

  // Read the state after transaction to get updated values
  const cidHash = await publicClient.readContract({
    address: params.registryAddress,
    abi: SignalRegistryAbi,
    functionName: "cidHashOf",
    args: [params.cid],
  });

  console.log("CID hash:", cidHash);

  // Get user's position
  const userPosition = await publicClient.readContract({
    address: params.registryAddress,
    abi: SignalRegistryAbi,
    functionName: "positions",
    args: [cidHash as `0x${string}`, walletClient.account!.address],
  });

  console.log("User position after withdraw:", userPosition);

  // Get memory aggregate
  const memoryData = await publicClient.readContract({
    address: params.registryAddress,
    abi: SignalRegistryAbi,
    functionName: "getMemoryByHash",
    args: [cidHash as `0x${string}`],
  });

  console.log("Memory data after withdraw:", memoryData);

  // Parse the struct/tuple results
  // positions returns { rawAmount, sqrtWeight } or [rawAmount, sqrtWeight]
  // getMemoryByHash returns { cid, dao, totalRaw, totalQuadWeight, supporters, exists }
  const positionData = userPosition as PositionData;
  const memoryStruct = memoryData as MemoryAggregate;

  const result = {
    txHash: hash,
    userRawAfter: BigInt(positionData.rawAmount || positionData[0] || 0),
    userSqrtAfter: BigInt(positionData.sqrtWeight || positionData[1] || 0),
    totalRawAfter: BigInt(memoryStruct.totalRaw || memoryStruct[2] || 0),
    totalQuadAfter: BigInt(memoryStruct.totalQuadWeight || memoryStruct[3] || 0),
  };

  console.log("Returning withdraw result:", result);

  return result;
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

  const positionData = result as PositionData;

  return {
    rawAmount: BigInt(positionData.rawAmount || positionData[0] || 0),
    sqrtWeight: BigInt(positionData.sqrtWeight || positionData[1] || 0),
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

  const memoryData = result as MemoryAggregate;

  return {
    cid: (memoryData.cid || memoryData[0] || "") as string,
    dao: (memoryData.dao || memoryData[1] || "0x0") as Address,
    totalRaw: BigInt(memoryData.totalRaw || memoryData[2] || 0),
    totalQuadWeight: BigInt(memoryData.totalQuadWeight || memoryData[3] || 0),
    supporters: Number(memoryData.supporters || memoryData[4] || 0),
    exists: Boolean(memoryData.exists ?? memoryData[5] ?? false),
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
