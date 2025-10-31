/**
 * Agent Chat API
 *
 * POST /api/agent/[organizationId]/chat
 * Stream chat responses from the DAO's agent
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import Agent from "@/models/Agent";
import ChatSession from "@/models/ChatSession";
import { agentCommonsService } from "@/lib/services/agentcommons";
import { v4 as uuidv4 } from "uuid";

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

    // Get the organization and its agent config
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

    if (!agent?.agentId || !agent?.enabled) {
      return NextResponse.json(
        { error: "Agent not configured or disabled for this DAO" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { message, sessionId, daoId, title } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Handle session management
    let currentSessionId = sessionId;
    let chatSession;

    if (sessionId) {
      // Update existing session
      chatSession = await ChatSession.findOneAndUpdate(
        {
          sessionId,
          owner: user.walletAddress,
        },
        {
          $set: {
            lastMessageAt: new Date(),
            ...(title && { title }),
          },
          $inc: {
            messageCount: 1,
          },
        },
        { new: true }
      );

      if (!chatSession) {
        // Session not found, create a new one
        currentSessionId = uuidv4();
        chatSession = await ChatSession.create({
          sessionId: currentSessionId,
          organizationId: resolvedParams.organizationId,
          agentId: agent._id,
          userId: user.userId || user.walletAddress,
          owner: user.walletAddress,
          title: title || "New Chat",
          lastMessageAt: new Date(),
          messageCount: 1,
        });
      }
    } else {
      // Create new session
      currentSessionId = uuidv4();
      chatSession = await ChatSession.create({
        sessionId: currentSessionId,
        organizationId: resolvedParams.organizationId,
        agentId: agent._id,
        userId: user.userId || user.walletAddress,
        owner: user.walletAddress,
        title: title || "New Chat",
        lastMessageAt: new Date(),
        messageCount: 1,
      });
    }

    // Prepare context message with daoId for tool usage
    const contextMessage = daoId
      ? `[CONTEXT] You are operating in DAO with ID: ${daoId}. When using the lobbyistSemanticSearch tool, always use this daoId parameter.`
      : "";

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let assistantMessage = "";
        try {
          // Build messages array with context
          const messages: Array<{ role: "user" | "system"; content: string }> = [];

          // Add context message if daoId is provided
          if (contextMessage) {
            messages.push({
              role: "system",
              content: contextMessage,
            });
          }

          // Add user message
          messages.push({
            role: "user",
            content: message,
          });

          // Send session info first
          const sessionData = `data: ${JSON.stringify({
            type: "session",
            sessionId: currentSessionId,
            title: chatSession.title,
          })}\n\n`;
          controller.enqueue(encoder.encode(sessionData));

          // Stream the agent's response
          const agentStream = agentCommonsService.runAgentStream({
            agentId: agent.agentId!,
            messages,
            sessionId: currentSessionId,
            initiator: user.walletAddress!,
          });

          for await (const chunk of agentStream) {
            assistantMessage += chunk; // Capture the full message
            const sseData = `data: ${JSON.stringify({
              type: "token",
              content: chunk,
            })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }

          // Save messages to session history
          await ChatSession.findOneAndUpdate(
            { sessionId: currentSessionId },
            {
              $push: {
                history: {
                  $each: [
                    {
                      role: "user",
                      content: message,
                      timestamp: new Date(),
                    },
                    {
                      role: "assistant",
                      content: assistantMessage,
                      timestamp: new Date(),
                    },
                  ],
                },
              },
            }
          );

          // Send completion signal
          const completionData = `data: ${JSON.stringify({
            type: "done",
          })}\n\n`;
          controller.enqueue(encoder.encode(completionData));
          controller.close();
        } catch (error: any) {
          console.error("Error streaming agent response:", error);
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            cause: error.cause,
          });
          const errorData = `data: ${JSON.stringify({
            type: "error",
            message: error.message || "Failed to stream response",
            details: error.toString(),
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in agent chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
