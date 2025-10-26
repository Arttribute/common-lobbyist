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
import Agent from "@/models/Agent";
import { agentCommonsService } from "@/lib/services/agentcommons";

const COMMON_TOKEN_ADDRESS = "0x09d3e33fBeB985653bFE868eb5a62435fFA04e4F";

// ✅ Define context type explicitly
type RouteContext = {
  params: {
    organizationId: string;
  };
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { organizationId } = context.params;

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
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get the default agent for this organization
    const agent = await Agent.findOne({
      organizationId,
      isDefault: true,
    });

    if (!agent?.agentId || !agent?.enabled) {
      return NextResponse.json(
        { error: "Agent not configured or disabled for this DAO" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { txHash } = body as { txHash?: string };

    if (!txHash) {
      return NextResponse.json(
        { error: "Transaction hash is required" },
        { status: 400 }
      );
    }

    // Agent wallet address (same as agentId)
    const agentWalletAddress = agent.agentId;

    // Success response (frontend handles the actual transfer)
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
