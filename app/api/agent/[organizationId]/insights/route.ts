/**
 * Content Insights API
 *
 * POST /api/agent/[organizationId]/insights
 * Get agent insights on content (alignment, community sentiment, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import Content from "@/models/Content";
import { agentCommonsService } from "@/lib/services/agentcommons";

export async function POST(
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

    // Get the organization and its agent config
    const organization = await Organization.findById(params.organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (!organization.agent?.agentId || !organization.agent?.enabled) {
      return NextResponse.json(
        { error: "Agent not configured or disabled for this DAO" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content, type = "alignment" } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Create a prompt based on the insight type requested
    let prompt = "";

    switch (type) {
      case "alignment":
        prompt = `A community member is drafting the following content:\n\n"${content}"\n\nAnalyze how aligned this content is with current community priorities and discussions. Provide:
1. Overall alignment score (High/Medium/Low)
2. Key points that align well
3. Potential concerns or gaps
4. Suggestions for improvement

Keep your response concise and constructive.`;
        break;

      case "sentiment":
        prompt = `A community member is drafting the following content:\n\n"${content}"\n\nPredict how the community might respond to this content. Consider:
1. Likely support level
2. Potential concerns or objections
3. Relevant past discussions
4. Suggested modifications for better reception

Keep your response concise and helpful.`;
        break;

      case "suggestions":
        prompt = `A community member is drafting the following content:\n\n"${content}"\n\nProvide helpful suggestions to improve this content:
1. Clarity and structure improvements
2. Additional context or references to include
3. Potential questions to address preemptively
4. How to make it more actionable

Keep your response concise and practical.`;
        break;

      default:
        prompt = `Analyze the following content and provide insights:\n\n"${content}"\n\nProvide a brief, helpful analysis.`;
    }

    // Get insights from the agent (non-streaming for simpler UI)
    const response = await agentCommonsService.runAgent({
      agentId: organization.agent.agentId!,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      initiator: user.walletAddress,
    });

    return NextResponse.json(
      {
        insights: response.response?.content || "No insights generated",
        type,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting content insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
