import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Agent from "@/models/Agent";
import Organization from "@/models/Organization";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import {
  registerAgent,
  generateAgentverseConfig,
  isAgentverseConfigured,
} from "@/lib/services/agentverse";

/**
 * POST /api/agent/[organizationId]/agentverse/register
 * Register an agent with Agentverse
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;

    // Check if Agentverse is configured
    if (!isAgentverseConfigured()) {
      return NextResponse.json(
        { error: "Agentverse is not configured. Please add AGENTVERSE_API_KEY to environment variables." },
        { status: 503 }
      );
    }

    // Authenticate user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get organization
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if user is the creator
    if (organization.creatorAddress?.toLowerCase() !== user.walletAddress?.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get agent for this organization
    const agent = await Agent.findOne({ organizationId });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Check if already registered
    if (agent.agentverse?.registered) {
      return NextResponse.json(
        {
          error: "Agent is already registered on Agentverse",
          address: agent.agentverse.address,
        },
        { status: 400 }
      );
    }

    // Parse request body for optional overrides
    const body = await req.json().catch(() => ({}));
    const { description, avatarUrl, discoverable = true } = body;

    // Generate webhook URL for this agent
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || 'http://localhost:3000';
    const webhookUrl = `${baseUrl}/api/agent/${organizationId}/agentverse/webhook`;

    // Generate Agentverse configuration
    const agentverseConfig = generateAgentverseConfig({
      daoName: organization.name,
      agentName: agent.name,
      description: description || agent.instructions || `AI agent for ${organization.name}`,
      webhookUrl,
      persona: agent.persona,
      tools: [
        'get_content_signals',
        'get_top_signaled_content',
        'get_user_signal_activity',
        'get_token_transfers',
        'get_transaction_details',
      ],
    });

    // Add optional fields
    if (avatarUrl) {
      agentverseConfig.avatar_url = avatarUrl;
    }

    // Register with Agentverse
    const registrationResult = await registerAgent(agentverseConfig);

    // Update agent with Agentverse details
    agent.agentverse = {
      registered: true,
      address: registrationResult.address,
      apiKey: registrationResult.api_key,
      discoverable,
      protocols: ['asi-chat'],
      webhookUrl,
      lastSynced: new Date(),
      metadata: {
        domain: registrationResult.domain,
        created: registrationResult.created,
      },
    };

    await agent.save();

    return NextResponse.json({
      success: true,
      agent: {
        id: agent._id,
        name: agent.name,
        agentverse: {
          address: registrationResult.address,
          domain: registrationResult.domain,
          registered: true,
          discoverable,
        },
      },
    });
  } catch (error) {
    console.error("Error registering agent with Agentverse:", error);
    return NextResponse.json(
      {
        error: "Failed to register agent with Agentverse",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
