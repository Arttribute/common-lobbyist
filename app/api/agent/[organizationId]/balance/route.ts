/**
 * Agent Balance API
 *
 * GET /api/agent/[organizationId]/balance
 * Get the $COMMON token balance of the DAO's agent
 */

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import { agentCommonsService } from "@/lib/services/agentcommons";

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    await dbConnect();

    // Get the organization and its agent config
    const organization = await Organization.findById(params.organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (!organization.agent?.agentId) {
      return NextResponse.json(
        { error: "Agent not configured for this DAO" },
        { status: 400 }
      );
    }

    // Get agent balance from AgentCommons
    const balance = await agentCommonsService.getAgentBalance(
      organization.agent.agentId
    );

    // Get agent wallet address
    const walletAddress = await agentCommonsService.getAgentWallet(
      organization.agent.agentId
    );

    return NextResponse.json(
      {
        balance,
        walletAddress,
        agentId: organization.agent.agentId,
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
