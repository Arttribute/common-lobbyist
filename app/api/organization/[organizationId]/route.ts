// app/api/organization/[organizationId]/route.ts
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import Agent from "@/models/Agent";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/organization/[organizationId] - Get a single organization by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;

    await dbConnect();

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get the default agent for this organization
    const defaultAgent = await Agent.findOne({
      organizationId: organizationId,
      isDefault: true,
    });

    // Add agent information to the organization object for backward compatibility
    const organizationWithAgent = {
      ...organization.toObject(),
      agent: defaultAgent
        ? {
            agentId: defaultAgent.agentId,
            enabled: defaultAgent.enabled,
            persona: defaultAgent.persona,
            instructions: defaultAgent.instructions,
            temperature: defaultAgent.temperature,
            maxTokens: defaultAgent.maxTokens,
            topP: defaultAgent.topP,
            presencePenalty: defaultAgent.presencePenalty,
            frequencyPenalty: defaultAgent.frequencyPenalty,
            createdAt: defaultAgent.createdAt,
          }
        : null,
    };

    return NextResponse.json(organizationWithAgent, { status: 200 });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
