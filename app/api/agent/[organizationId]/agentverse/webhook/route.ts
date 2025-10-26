import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Agent from "@/models/Agent";
import { runAgent } from "@/lib/services/agentcommons";

/**
 * POST /api/agent/[organizationId]/agentverse/webhook
 * Receive messages from other agents on Agentverse
 *
 * This webhook is called by Agentverse when another agent sends a message
 * to this agent. We process the message and optionally respond.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;

    await dbConnect();

    // Get the agent for this organization
    const agent = await Agent.findOne({ organizationId });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Check if agent is registered on Agentverse
    if (!agent.agentverse?.registered) {
      return NextResponse.json(
        { error: "Agent is not registered on Agentverse" },
        { status: 400 }
      );
    }

    // Parse incoming message from Agentverse
    const message = await req.json();
    const { from, protocol, payload, timestamp } = message;

    console.log(`Received message from ${from} via ${protocol}:`, payload);

    // Validate message structure
    if (!from || !protocol || !payload) {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    // Process the message based on protocol
    let response: any = null;

    if (protocol === 'asi-chat') {
      // ASI Chat Protocol - handle as a conversation message
      const messageText = payload.text || payload.message || JSON.stringify(payload);

      // Build context for the agent about who is messaging
      const context = `You are receiving a message from another agent on Agentverse.
Agent Address: ${from}
Protocol: ${protocol}
Timestamp: ${timestamp || new Date().toISOString()}

Please respond appropriately based on the message content.`;

      // Run the agent with the message
      try {
        const agentResponse = await runAgent(
          agent.agentId!,
          agent.sessionId!,
          messageText,
          context
        );

        response = {
          success: true,
          reply: agentResponse.response,
        };
      } catch (error) {
        console.error("Error processing agent message:", error);
        response = {
          success: false,
          error: "Failed to process message",
        };
      }
    } else {
      // For other protocols, log and acknowledge
      console.log(`Received message via unsupported protocol: ${protocol}`);
      response = {
        success: true,
        note: `Message received but protocol ${protocol} is not fully supported`,
      };
    }

    // Return response according to Agentverse webhook format
    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error handling Agentverse webhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent/[organizationId]/agentverse/webhook
 * Health check endpoint for the webhook
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;

  return NextResponse.json({
    status: "active",
    organizationId,
    webhook: "agentverse",
    timestamp: new Date().toISOString(),
  });
}
