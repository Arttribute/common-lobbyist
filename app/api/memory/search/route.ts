import { NextRequest, NextResponse } from 'next/server';
import { memoryService } from '@/lib/services/memory';
import { onChainService } from '@/lib/services/onchain';

/**
 * POST /api/memory/search
 * Perform semantic search on DAO content with optional on-chain data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      daoId,
      forumId,
      authorId,
      limit = 10,
      minScore = 0.7,
      includeOnChainData = false,
    } = body;

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'query is required',
        },
        { status: 400 }
      );
    }

    // Perform semantic search
    const results = await memoryService.semanticSearch(query, {
      daoId,
      forumId,
      authorId,
      limit,
      minScore,
      includeOnChainData,
    });

    return NextResponse.json({
      success: true,
      data: {
        query,
        filters: { daoId, forumId, authorId },
        totalResults: results.searchResults.length,
        results: results.searchResults.map((result: Record<string, unknown>) => ({
          ...result,
          // Format user signals for readability
          userSignals: Array.isArray(result.userSignals)
            ? (result.userSignals as Array<Record<string, unknown>>).slice(0, 5).map((signal) => ({
                userId: signal.userId,
                amount: signal.amount,
                placedAt: signal.placedAt,
              }))
            : [],
        })),
        recentHappenings: results.recentHappenings,
      },
    });
  } catch (error: unknown) {
    console.error('Error performing semantic search:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform search',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/memory/search/context
 * Get full context for a specific content item
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const includeOnChain = searchParams.get('includeOnChain') === 'true';

    if (!contentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'contentId is required',
        },
        { status: 400 }
      );
    }

    // Get content context
    const context = await memoryService.getContentContext(contentId);

    // Optionally include on-chain proof
    let onChainProof: Awaited<ReturnType<typeof onChainService.getContentOnChainProof>> | null = null;
    if (includeOnChain && context.content && typeof context.content === 'object' && 'daoId' in context.content) {
      try {
        onChainProof = await onChainService.getContentOnChainProof(contentId);
      } catch (error) {
        console.error('Error fetching on-chain proof:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...context,
        onChainProof,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching content context:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch context',
      },
      { status: 500 }
    );
  }
}
