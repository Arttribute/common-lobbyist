/**
 * Chat Sessions API
 *
 * GET /api/agent/[organizationId]/sessions
 * Get all chat sessions for the authenticated user in this organization
 *
 * POST /api/agent/[organizationId]/sessions
 * Create or update a chat session
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";
import Agent from "@/models/Agent";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/agent/[organizationId]/sessions
 * Get all sessions for the authenticated user in this organization
 */
export async function GET(
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

    // Get all sessions for this user and organization, ordered by most recent
    const sessions = await ChatSession.find({
      organizationId: resolvedParams.organizationId,
      owner: user.walletAddress,
      archived: false,
    })
      .select("sessionId title lastMessageAt messageCount createdAt updatedAt")
      .sort({ lastMessageAt: -1 })
      .limit(50); // Limit to 50 most recent sessions

    return NextResponse.json({ data: sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent/[organizationId]/sessions
 * Create a new session or update an existing one
 */
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

    const body = await request.json();
    const { sessionId, title } = body;

    // Get the default agent for this organization
    const agent = await Agent.findOne({
      organizationId: resolvedParams.organizationId,
      isDefault: true,
    });

    if (!agent) {
      return NextResponse.json(
        { error: "No default agent found for this organization" },
        { status: 404 }
      );
    }

    // If sessionId is provided, update existing session
    if (sessionId) {
      const updatedSession = await ChatSession.findOneAndUpdate(
        {
          sessionId,
          owner: user.walletAddress,
        },
        {
          $set: {
            title: title || undefined,
            lastMessageAt: new Date(),
          },
          $inc: {
            messageCount: 1,
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedSession) {
        return NextResponse.json(
          { error: "Session not found or unauthorized" },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: updatedSession });
    }

    // Create new session
    const newSessionId = uuidv4();
    const newSession = await ChatSession.create({
      sessionId: newSessionId,
      organizationId: resolvedParams.organizationId,
      agentId: agent._id,
      userId: user.userId || user.walletAddress,
      owner: user.walletAddress,
      title: title || "New Chat",
      lastMessageAt: new Date(),
      messageCount: 1,
    });

    return NextResponse.json({ data: newSession }, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating session:", error);
    return NextResponse.json(
      { error: "Failed to create/update session" },
      { status: 500 }
    );
  }
}
