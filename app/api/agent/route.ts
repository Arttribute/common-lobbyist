// app/api/agent/route.ts
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";
import Organization from "@/models/Organization";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import { agentCommonsService } from "@/lib/services/agentcommons";

/**
 * POST /api/agent - Create a new agent for an organization
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthenticatedUser(request);
    if (!user || !user.walletAddress) {
      return NextResponse.json(
        { error: "Authentication required. Please connect your wallet." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      organizationId,
      name,
      persona,
      instructions,
      temperature = 0.7,
      maxTokens = 2000,
      topP = 1,
      presencePenalty = 0,
      frequencyPenalty = 0,
      isDefault = false,
    } = body;

    // Validate required fields
    if (!organizationId || !name || !persona) {
      return NextResponse.json(
        { error: "Missing required fields: organizationId, name, persona" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify the organization exists and user has permission
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if user is the creator or has permission
    if (
      organization.creatorAddress.toLowerCase() !==
      user.walletAddress.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Only the DAO creator can create agents" },
        { status: 403 }
      );
    }

    // If this is being set as default, unset any existing default agent
    if (isDefault) {
      await Agent.updateMany(
        { organizationId, isDefault: true },
        { isDefault: false }
      );
    }

    // Create agent in AgentCommons
    const agentCommonsAgent = await agentCommonsService.createAgent({
      name,
      persona,
      instructions:
        instructions ||
        agentCommonsService.getDefaultInstructions(organization.name),
      owner: user.walletAddress,
      temperature,
      maxTokens,
      topP,
      presencePenalty,
      frequencyPenalty,
      commonsOwned: false,
    });

    console.log("Agent created successfully:", agentCommonsAgent.agentId);

    // Create agent document in database
    const newAgent = new Agent({
      name,
      organizationId,
      agentId: agentCommonsAgent.agentId,
      enabled: true,
      persona,
      instructions:
        instructions ||
        agentCommonsService.getDefaultInstructions(organization.name),
      temperature: agentCommonsAgent.temperature,
      maxTokens: agentCommonsAgent.maxTokens,
      topP: agentCommonsAgent.topP,
      presencePenalty: agentCommonsAgent.presencePenalty,
      frequencyPenalty: agentCommonsAgent.frequencyPenalty,
      createdBy: user.walletAddress,
      isDefault,
    });

    await newAgent.save();

    // If this is the default agent, update the organization
    if (isDefault) {
      organization.defaultAgentId = newAgent._id;
      await organization.save();
    }

    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent - Get all agents for an organization
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Missing organizationId parameter" },
        { status: 400 }
      );
    }

    await dbConnect();
    const agents = await Agent.find({ organizationId }).sort({ createdAt: -1 });
    return NextResponse.json(agents, { status: 200 });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
