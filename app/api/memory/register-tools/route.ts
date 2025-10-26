import { NextRequest, NextResponse } from 'next/server';
import { formatToolSpecsForAgentCommons } from '@/lib/tools/memory-tools';

/**
 * GET /api/memory/register-tools
 * Get memory tool specifications formatted for Agent Commons
 *
 * This endpoint returns tool specifications that can be dynamically
 * added to Agent Commons agents for semantic search and on-chain verification
 */
export async function GET() {
  try {
    const toolSpecs = formatToolSpecsForAgentCommons();

    return NextResponse.json({
      success: true,
      data: {
        tools: toolSpecs,
        count: toolSpecs.length,
        description:
          'Memory and semantic search tools for DAO content with on-chain verification',
      },
    });
  } catch (error: unknown) {
    console.error('Error getting tool specifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tool specifications',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/memory/register-tools
 * Register memory tools with Agent Commons for a specific agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, organizationId } = body;

    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'agentId is required',
        },
        { status: 400 }
      );
    }

    const toolSpecs = formatToolSpecsForAgentCommons();

    // TODO: Make API call to Agent Commons to add these tools to the agent
    // This would involve calling the Agent Commons API endpoint:
    // POST /v1/agents/{agentId}/tools
    // with each tool specification

    // For now, return the specs that need to be registered
    return NextResponse.json({
      success: true,
      message: 'Tool specifications ready for registration',
      data: {
        agentId,
        organizationId,
        tools: toolSpecs,
        instructions: {
          message:
            'Use these tool specifications to add memory search capabilities to your agent',
          agentCommonsEndpoint: `${process.env.AGENT_COMMONS_API_URL || 'http://localhost:4000'}/v1/agents/${agentId}/tools`,
          method: 'POST',
          bodyFormat: {
            toolId: 'string (use tool.function.name)',
            usageComments: 'string (optional description)',
          },
        },
      },
    });
  } catch (error: unknown) {
    console.error('Error registering tools:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register tools',
      },
      { status: 500 }
    );
  }
}
