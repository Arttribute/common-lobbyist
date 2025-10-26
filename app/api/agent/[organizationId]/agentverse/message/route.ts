import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import {
  sendAgentMessage,
  isAgentverseConfigured,
  isValidAgentAddress,
} from "@/lib/services/agentverse";

/**
 * POST /api/agent/[organizationId]/agentverse/message
 * Send a message to another agent on Agentverse
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
        { error: "Agentverse is not configured" },
        { status: 503 }
      );
    }

    // Authenticate user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get the sender agent
    const senderAgent = await Agent.findOne({ organizationId });
    if (!senderAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Check if agent is registered on Agentverse
    if (!senderAgent.agentverse?.registered || !senderAgent.agentverse?.address) {
      return NextResponse.json(
        { error: "Agent is not registered on Agentverse" },
        { status: 400 }
      );
    }

    // Parse message data from request body
    const body = await req.json();
    const { to, protocol = 'asi-chat', payload } = body;

    // Validate recipient address
    if (!to || !isValidAgentAddress(to)) {
      return NextResponse.json(
        { error: "Invalid recipient agent address" },
        { status: 400 }
      );
    }

    // Validate payload
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        { error: "Invalid message payload" },
        { status: 400 }
      );
    }

    // Send message via Agentverse
    const result = await sendAgentMessage({
      from: senderAgent.agentverse.address,
      to,
      protocol,
      payload,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to send message",
          details: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.message_id,
      from: senderAgent.agentverse.address,
      to,
      protocol,
    });
  } catch (error) {
    console.error("Error sending agent message:", error);
    return NextResponse.json(
      {
        error: "Failed to send message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
