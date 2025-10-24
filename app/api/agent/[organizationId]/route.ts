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
import { agentCommonsService } from "@/lib/services/agentcommons";

/**
 * GET - Get agent configuration for a DAO
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    await dbConnect();

    const organization = await Organization.findById(params.organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (!organization.agent) {
      return NextResponse.json(
        { error: "Agent not configured" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        agent: {
          agentId: organization.agent.agentId,
          enabled: organization.agent.enabled,
          persona: organization.agent.persona,
          instructions: organization.agent.instructions,
          temperature: organization.agent.temperature,
          maxTokens: organization.agent.maxTokens,
          topP: organization.agent.topP,
          presencePenalty: organization.agent.presencePenalty,
          frequencyPenalty: organization.agent.frequencyPenalty,
          createdAt: organization.agent.createdAt,
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

    const organization = await Organization.findById(params.organizationId);
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
    if (!organization.agent?.agentId) {
      try {
        const agentPersona =
          persona || agentCommonsService.getDefaultPersona(organization.name);
        const agentInstructions =
          instructions ||
          agentCommonsService.getDefaultInstructions(organization.name);

        const agent = await agentCommonsService.createAgent({
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

        organization.agent = {
          agentId: agent.agentId,
          enabled: enabled ?? true,
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

        return NextResponse.json({ agent: organization.agent }, { status: 200 });
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
        await agentCommonsService.updateAgent(
          organization.agent.agentId!,
          updateData
        );
      } catch (error) {
        console.error("Error updating agent on AgentCommons:", error);
        return NextResponse.json(
          { error: "Failed to update agent" },
          { status: 500 }
        );
      }
    }

    // Update local database
    if (persona !== undefined) organization.agent.persona = persona;
    if (instructions !== undefined)
      organization.agent.instructions = instructions;
    if (temperature !== undefined) organization.agent.temperature = temperature;
    if (maxTokens !== undefined) organization.agent.maxTokens = maxTokens;
    if (topP !== undefined) organization.agent.topP = topP;
    if (presencePenalty !== undefined)
      organization.agent.presencePenalty = presencePenalty;
    if (frequencyPenalty !== undefined)
      organization.agent.frequencyPenalty = frequencyPenalty;
    if (enabled !== undefined) organization.agent.enabled = enabled;

    await organization.save();

    return NextResponse.json({ agent: organization.agent }, { status: 200 });
  } catch (error) {
    console.error("Error updating agent config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
