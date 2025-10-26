import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Agent from "@/models/Agent";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import { getAgent, isAgentverseConfigured } from "@/lib/services/agentverse";

/**
 * GET /api/agent/[organizationId]/agentverse/status
 * Get Agentverse registration status and details for an agent
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;

    // Authenticate user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get agent for this organization
    const agent = await Agent.findOne({ organizationId });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Return local status if not registered or Agentverse not configured
    if (!agent.agentverse?.registered || !isAgentverseConfigured()) {
      return NextResponse.json({
        registered: false,
        agentverseConfigured: isAgentverseConfigured(),
        localAgent: {
          id: agent._id,
          name: agent.name,
          organizationId: agent.organizationId,
        },
      });
    }

    // Fetch live status from Agentverse
    try {
      const agentverseData = await getAgent(agent.agentverse.address!);

      // Update local metadata
      agent.agentverse.lastSynced = new Date();
      agent.agentverse.metadata = {
        ...agent.agentverse.metadata,
        running: agentverseData.running,
        compiled: agentverseData.compiled,
        interactions: agentverseData.interactions,
        updated: agentverseData.updated,
      };
      await agent.save();

      return NextResponse.json({
        registered: true,
        agentverseConfigured: true,
        agentverse: {
          address: agentverseData.address,
          name: agentverseData.name,
          domain: agentverseData.domain,
          running: agentverseData.running,
          compiled: agentverseData.compiled,
          description: agentverseData.description,
          protocols: agentverseData.protocols,
          interactions: agentverseData.interactions,
          avatarUrl: agentverseData.avatar_url,
          created: agentverseData.created,
          updated: agentverseData.updated,
        },
        localAgent: {
          id: agent._id,
          name: agent.name,
          organizationId: agent.organizationId,
          lastSynced: agent.agentverse.lastSynced,
          discoverable: agent.agentverse.discoverable,
        },
      });
    } catch (error) {
      // If we can't fetch from Agentverse, return local data
      console.error("Error fetching agent from Agentverse:", error);
      return NextResponse.json({
        registered: true,
        agentverseConfigured: true,
        error: "Could not fetch live status from Agentverse",
        agentverse: {
          address: agent.agentverse.address,
          lastSynced: agent.agentverse.lastSynced,
        },
        localAgent: {
          id: agent._id,
          name: agent.name,
          organizationId: agent.organizationId,
        },
      });
    }
  } catch (error) {
    console.error("Error getting Agentverse status:", error);
    return NextResponse.json(
      {
        error: "Failed to get Agentverse status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
