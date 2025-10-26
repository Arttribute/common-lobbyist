/**
 * Agent Configuration API
 *
 * GET /api/agent/[organizationId] - Get agent configuration
 * PUT /api/agent/[organizationId] - Update agent configuration
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import Agent from "@/models/Agent";
import { agentCommonsService } from "@/lib/services/agentcommons";

/**
 * GET - Get agent configuration for a DAO
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const resolvedParams = await params;

    await dbConnect();

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

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not configured" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        agent: {
          agentId: agent.agentId,
          enabled: agent.enabled,
          persona: agent.persona,
          instructions: agent.instructions,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
          topP: agent.topP,
          presencePenalty: agent.presencePenalty,
          frequencyPenalty: agent.frequencyPenalty,
          createdAt: agent.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching agent config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update agent configuration
 * Only the DAO creator can update the agent config
 */
export async function PUT(
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

    const organization = await Organization.findById(
      resolvedParams.organizationId
    );
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Verify user is the creator
    if (
      organization.creatorAddress.toLowerCase() !==
      user.walletAddress.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Only the DAO creator can update agent configuration" },
        { status: 403 }
      );
    }

    // Get the default agent for this organization
    let agent = await Agent.findOne({
      organizationId: resolvedParams.organizationId,
      isDefault: true,
    });

    const body = await request.json();
    const {
      persona,
      instructions,
      temperature,
      maxTokens,
      topP,
      presencePenalty,
      frequencyPenalty,
      enabled,
    } = body;

    // If agent doesn't exist, create one
    if (!agent) {
      try {
        const agentPersona =
          persona || agentCommonsService.getDefaultPersona(organization.name);
        const agentInstructions =
          instructions ||
          agentCommonsService.getDefaultInstructions(organization.name);

        const agentCommonsAgent = await agentCommonsService.createAgent({
          name: `${organization.name} Community Agent`,
          persona: agentPersona,
          instructions: agentInstructions,
          owner: user.walletAddress,
          temperature: temperature ?? 0.7,
          maxTokens: maxTokens ?? 2000,
          topP: topP ?? 1,
          presencePenalty: presencePenalty ?? 0,
          frequencyPenalty: frequencyPenalty ?? 0,
          commonsOwned: false,
        });

        // Create agent document in database
        agent = new Agent({
          name: `${organization.name} Community Agent`,
          organizationId: organization._id,
          agentId: agentCommonsAgent.agentId,
          enabled: enabled ?? true,
          persona: agentPersona,
          instructions: agentInstructions,
          temperature: agentCommonsAgent.temperature,
          maxTokens: agentCommonsAgent.maxTokens,
          topP: agentCommonsAgent.topP,
          presencePenalty: agentCommonsAgent.presencePenalty,
          frequencyPenalty: agentCommonsAgent.frequencyPenalty,
          createdBy: user.walletAddress,
          isDefault: true,
        });

        await agent.save();

        // Update the organization with default agent reference
        organization.defaultAgentId = agent._id;
        await organization.save();

        return NextResponse.json({ agent }, { status: 200 });
      } catch (error) {
        console.error("Error creating agent:", error);
        return NextResponse.json(
          { error: "Failed to create agent" },
          { status: 500 }
        );
      }
    }

    // Update existing agent
    const updateData: any = {};
    if (persona !== undefined) updateData.persona = persona;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (temperature !== undefined) updateData.temperature = temperature;
    if (maxTokens !== undefined) updateData.maxTokens = maxTokens;
    if (topP !== undefined) updateData.topP = topP;
    if (presencePenalty !== undefined)
      updateData.presencePenalty = presencePenalty;
    if (frequencyPenalty !== undefined)
      updateData.frequencyPenalty = frequencyPenalty;

    // Update agent on AgentCommons if there are changes
    if (Object.keys(updateData).length > 0) {
      try {
        await agentCommonsService.updateAgent(agent.agentId!, updateData);
      } catch (error) {
        console.error("Error updating agent on AgentCommons:", error);
        return NextResponse.json(
          { error: "Failed to update agent" },
          { status: 500 }
        );
      }
    }

    // Update local database
    if (persona !== undefined) agent.persona = persona;
    if (instructions !== undefined) agent.instructions = instructions;
    if (temperature !== undefined) agent.temperature = temperature;
    if (maxTokens !== undefined) agent.maxTokens = maxTokens;
    if (topP !== undefined) agent.topP = topP;
    if (presencePenalty !== undefined) agent.presencePenalty = presencePenalty;
    if (frequencyPenalty !== undefined)
      agent.frequencyPenalty = frequencyPenalty;
    if (enabled !== undefined) agent.enabled = enabled;

    await agent.save();

    return NextResponse.json({ agent }, { status: 200 });
  } catch (error) {
    console.error("Error updating agent config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
