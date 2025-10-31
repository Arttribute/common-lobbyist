/**
 * Get Session API
 *
 * GET /api/agent/[organizationId]/sessions/[sessionId]
 * Get a specific chat session with its message history
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ organizationId: string; sessionId: string }>;
  }
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

    // Get the session and verify ownership
    const session = await ChatSession.findOne({
      sessionId: resolvedParams.sessionId,
      organizationId: resolvedParams.organizationId,
      owner: user.walletAddress,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: session });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
