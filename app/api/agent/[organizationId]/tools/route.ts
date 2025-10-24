/**
 * Agent Tools API
 *
 * POST /api/agent/[organizationId]/tools
 * Execute blockchain explorer tools for the agent
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import { executeTool, agentTools } from "@/lib/services/agent-tools";

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

    const body = await request.json();
    const { toolName, args } = body;

    if (!toolName) {
      return NextResponse.json(
        { error: "Tool name is required" },
        { status: 400 }
      );
    }

    console.log("Executing tool:", {
      toolName,
      args,
      organizationId: resolvedParams.organizationId,
    });

    // Execute the tool
    const result = await executeTool(toolName, {
      ...args,
      organizationId: resolvedParams.organizationId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in agent tools:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET - Get available tools
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    await params;

    return NextResponse.json(
      {
        tools: agentTools,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching tools:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
