/**
 * Create Agent API
 *
 * POST /api/agent/[organizationId]/create
 * Create or re-create an agent for a DAO
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import { agentCommonsService } from "@/lib/services/agentcommons";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const resolvedParams = await params;

    // Authenticate the user
    const user = await getAuthenticatedUser(request);
    if (!user || !user.walletAddress) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get the organization
    const organization = await Organization.findById(resolvedParams.organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if user is the creator
    if (
      organization.creatorAddress.toLowerCase() !==
      user.walletAddress.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Only the DAO creator can create an agent" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { persona } = body;

    // Create agent persona and instructions
    const agentPersona =
      persona || agentCommonsService.getDefaultPersona(organization.name);
    const agentInstructions = agentCommonsService.getDefaultInstructions(
      organization.name
    );

    console.log("Creating agent for DAO:", {
      name: `${organization.name} Community Agent`,
      owner: user.walletAddress,
      persona: agentPersona.substring(0, 100) + "...",
    });

    // Create the agent
    const agent = await agentCommonsService.createAgent({
      name: `${organization.name} Community Agent`,
      persona: agentPersona,
      instructions: agentInstructions,
      owner: user.walletAddress,
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
      commonsOwned: false,
    });

    console.log("Agent created successfully:", agent.agentId);

    // Update the organization with agent details
    organization.agent = {
      agentId: agent.agentId,
      enabled: true,
      persona: agentPersona,
      instructions: agentInstructions,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      topP: agent.topP,
      presencePenalty: agent.presencePenalty,
      frequencyPenalty: agent.frequencyPenalty,
      createdAt: new Date(),
    };

    await organization.save();

    return NextResponse.json(
      {
        success: true,
        agent: {
          agentId: agent.agentId,
          enabled: true,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating agent:", error);
    console.error("Agent error details:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to create agent" },
      { status: 500 }
    );
  }
}
