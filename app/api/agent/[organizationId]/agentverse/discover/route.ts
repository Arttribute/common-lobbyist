import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import { searchAgents, isAgentverseConfigured } from "@/lib/services/agentverse";

/**
 * POST /api/agent/[organizationId]/agentverse/discover
 * Search and discover agents on Agentverse
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    await params; // organizationId not strictly needed but validates route

    // Check if Agentverse is configured
    if (!isAgentverseConfigured()) {
      return NextResponse.json(
        { error: "Agentverse is not configured" },
        { status: 503 }
      );
    }

    // Authenticate user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse search parameters from request body
    const body = await req.json().catch(() => ({}));
    const {
      query,
      category,
      protocol,
      runningOnly = false,
      minInteractions = 0,
      limit = 20,
      offset = 0,
    } = body;

    // Build search parameters
    const searchParams: any = {
      offset,
      limit,
    };

    if (query) {
      searchParams.text = query;
      searchParams.semantic_search = true;
    }

    if (category || protocol || runningOnly || minInteractions > 0) {
      searchParams.filters = {};

      if (runningOnly) {
        searchParams.filters.state = 'running';
      }

      if (category) {
        searchParams.filters.category = category;
      }

      if (protocol) {
        searchParams.filters.protocol_digest = protocol;
      }

      if (minInteractions > 0) {
        searchParams.filters.min_interactions = minInteractions;
      }
    }

    // Sort by relevancy or interactions
    searchParams.sort = {
      by: query ? 'relevancy' : 'interactions',
      order: 'desc',
    };

    // Search Agentverse
    const results = await searchAgents(searchParams);

    return NextResponse.json({
      success: true,
      agents: results.agents.map(agent => ({
        address: agent.address,
        name: agent.name,
        description: agent.description,
        domain: agent.domain,
        running: agent.running,
        protocols: agent.protocols,
        interactions: agent.interactions,
        avatarUrl: agent.avatar_url,
        readme: agent.readme,
        created: agent.created,
        updated: agent.updated,
      })),
      pagination: results.pagination,
    });
  } catch (error) {
    console.error("Error searching Agentverse:", error);
    return NextResponse.json(
      {
        error: "Failed to search Agentverse",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
