// lib/contracts/governance-token.ts
import { Address, PublicClient, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { GovernanceTokenAbi } from "../abis/governance-token";

/**
 * Gets the token balance of an address
 */
export async function getTokenBalance(
  publicClient: PublicClient,
  tokenAddress: Address,
  holderAddress: Address
): Promise<bigint> {
  const balance = await publicClient.readContract({
    address: tokenAddress,
    abi: GovernanceTokenAbi,
    functionName: "balanceOf",
    args: [holderAddress],
  });

  return balance as bigint;
}

/**
 * Gets the token balance for a user (creates its own public client)
 * Used by API routes to fetch balances
 */
export async function getUserTokenBalance(
  chainId: number,
  tokenAddress: string,
  userAddress: string
): Promise<bigint> {
  // For now, we only support Base Sepolia
  if (chainId !== baseSepolia.id) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  const rpcUrl =
    process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ||
    "https://sepolia.base.org";

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });

  const balance = await publicClient.readContract({
    address: tokenAddress as Address,
    abi: GovernanceTokenAbi,
    functionName: "balanceOf",
    args: [userAddress as Address],
  });

  return balance as bigint;
}

/**
 * Gets the token symbol
 */
export async function getTokenSymbol(
  publicClient: PublicClient,
  tokenAddress: Address
): Promise<string> {
  const symbol = await publicClient.readContract({
    address: tokenAddress,
    abi: GovernanceTokenAbi,
    functionName: "symbol",
  });

  return symbol as string;
}

/**
 * Gets the token name
 */
export async function getTokenName(
  publicClient: PublicClient,
  tokenAddress: Address
): Promise<string> {
  const name = await publicClient.readContract({
    address: tokenAddress,
    abi: GovernanceTokenAbi,
    functionName: "name",
  });

  return name as string;
}

/**
 * Gets the token total supply
 */
export async function getTotalSupply(
  publicClient: PublicClient,
  tokenAddress: Address
): Promise<bigint> {
  const supply = await publicClient.readContract({
    address: tokenAddress,
    abi: GovernanceTokenAbi,
    functionName: "totalSupply",
  });

  return supply as bigint;
}
