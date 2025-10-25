/**
 * Agent Balance API
 *
 * GET /api/agent/[organizationId]/balance
 * Get the $COMMON token balance of the DAO's agent
 */

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import Agent from "@/models/Agent";
import { createPublicClient, http, formatEther, Address } from "viem";
import { baseSepolia } from "viem/chains";

const COMMON_TOKEN_ADDRESS =
  "0x09d3e33fBeB985653bFE868eb5a62435fFA04e4F" as Address;

// ERC-20 ABI for balanceOf
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const resolvedParams = await params;

    await dbConnect();

    // Get the organization and its agent config
    const organization = await Organization.findById(
      resolvedParams.organizationId
    );
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get the default agent for this organization
    const agent = await Agent.findOne({
      organizationId: resolvedParams.organizationId,
      isDefault: true,
    });

    if (!agent?.agentId) {
      return NextResponse.json(
        { error: "Agent not configured for this DAO" },
        { status: 400 }
      );
    }

    // The agentId IS the wallet address
    const walletAddress = agent.agentId as Address;

    // Get the balance on-chain using viem
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const balanceWei = await publicClient.readContract({
      address: COMMON_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [walletAddress],
    });

    const balance = parseFloat(formatEther(balanceWei));

    return NextResponse.json(
      {
        balance,
        walletAddress,
        agentId: agent.agentId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting agent balance:", error);
    return NextResponse.json(
      { error: "Failed to get agent balance" },
      { status: 500 }
    );
  }
}
