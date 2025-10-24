// lib/contracts/dao-factory.ts
import { Address, parseUnits, WalletClient, PublicClient } from "viem";
import { DaoFactoryAbi } from "@/lib/abis/dao-factory";
import { getDaoFactoryAddress } from "./config";

export interface CreateDAOParams {
  name: string;
  symbol: string;
  initialSupply: string; // in whole tokens (e.g., "1000000")
  metadataCid: string; // IPFS CID for DAO metadata
}

export interface CreateDAOResult {
  tokenAddress: Address;
  registryAddress: Address;
  txHash: Address;
}

/**
 * Creates a new DAO on-chain by calling the DAOFactory contract
 */
export async function createDAOOnChain(
  walletClient: WalletClient,
  publicClient: PublicClient,
  params: CreateDAOParams
): Promise<CreateDAOResult> {
  const chainId = await walletClient.getChainId();
  const factoryAddress = getDaoFactoryAddress(chainId);

  // Convert initial supply to wei (18 decimals for ERC20)
  const initialSupplyWei = parseUnits(params.initialSupply, 18);

  // Simulate the transaction first to get return values
  const { request, result } = await publicClient.simulateContract({
    address: factoryAddress as Address,
    abi: DaoFactoryAbi,
    functionName: "createDAO",
    args: [params.name, params.symbol, initialSupplyWei, params.metadataCid],
    account: walletClient.account!,
  });

  // The simulation returns [tokenAddr, registryAddr]
  const [simulatedTokenAddr, simulatedRegistryAddr] = result as [
    Address,
    Address
  ];

  console.log("Simulated token address:", simulatedTokenAddr);
  console.log("Simulated registry address:", simulatedRegistryAddr);

  // Execute the transaction
  const hash = await walletClient.writeContract(request);

  // Wait for transaction confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status !== "success") {
    throw new Error(
      `Transaction failed with status: ${receipt.status}. Hash: ${hash}`
    );
  }

  console.log("Transaction successful:", hash);

  // Use the simulated addresses (they are deterministic based on nonce)
  // Or we can parse events as a verification step
  let tokenAddress = simulatedTokenAddr;
  let registryAddress = simulatedRegistryAddr;

  // Optional: Verify by parsing the DaoCreated event
  try {
    const parsedEvents = (publicClient as any).parseEventLogs({
      abi: DaoFactoryAbi,
      logs: receipt.logs,
    });

    const daoCreatedEvent = parsedEvents.find(
      (event: any) => event.eventName === "DaoCreated"
    );

    if (daoCreatedEvent) {
      console.log("Verified with DaoCreated event");
      // Optionally override with event values if they differ
      tokenAddress = daoCreatedEvent.args.token as Address;
      registryAddress = daoCreatedEvent.args.signalRegistry as Address;
    }
  } catch (error) {
    console.warn(
      "Could not parse events for verification, using simulated addresses:",
      error
    );
  }

  return {
    tokenAddress,
    registryAddress,
    txHash: hash,
  };
}

/**
 * Gets DAO info from the factory contract
 */
export async function getDAOInfo(
  publicClient: PublicClient,
  registryAddress: Address
): Promise<{
  daoOwner: Address;
  token: Address;
  signalRegistry: Address;
  metadataCid: string;
  exists: boolean;
}> {
  const chainId = await publicClient.getChainId();
  const factoryAddress = getDaoFactoryAddress(chainId);

  const result = await publicClient.readContract({
    address: factoryAddress as Address,
    abi: DaoFactoryAbi,
    functionName: "daos",
    args: [registryAddress],
  });

  return {
    daoOwner: result as any[0],
    token: result as any[1],
    signalRegistry: result as any[2],
    metadataCid: result as any[3],
    exists: result as any[4],
  };
}
