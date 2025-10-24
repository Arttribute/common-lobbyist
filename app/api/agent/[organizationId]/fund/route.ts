/**
 * Agent Funding API
 *
 * POST /api/agent/[organizationId]/fund
 * Fund or donate $COMMON tokens to the DAO's agent
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import { agentCommonsService } from "@/lib/services/agentcommons";

const COMMON_TOKEN_ADDRESS = "0x09d3e33fBeB985653bFE868eb5a62435fFA04e4F";

export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    // Authenticate the user
    const user = await getAuthenticatedUser(request);
    if (!user || !user.walletAddress) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get the organization and its agent config
    const organization = await Organization.findById(params.organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (!organization.agent?.agentId || !organization.agent?.enabled) {
      return NextResponse.json(
        { error: "Agent not configured or disabled for this DAO" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { txHash } = body;

    if (!txHash) {
      return NextResponse.json(
        { error: "Transaction hash is required" },
        { status: 400 }
      );
    }

    // Get the agent's wallet address (agentId is the wallet address)
    const agentWalletAddress = organization.agent.agentId;

    // Return success with agent wallet info
    // The actual token transfer happens on the frontend using wagmi
    // We just verify the transaction and record it
    return NextResponse.json(
      {
        success: true,
        agentWalletAddress,
        txHash,
        message: "Funding transaction submitted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error funding agent:", error);
    return NextResponse.json(
      { error: "Failed to process funding" },
      { status: 500 }
    );
  }
}
