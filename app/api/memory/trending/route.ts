import { NextRequest, NextResponse } from 'next/server';
import { memoryService } from '@/lib/services/memory';
import { onChainService } from '@/lib/services/onchain';

/**
 * GET /api/memory/trending
 * Get trending content based on recent signal activity
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daoId = searchParams.get('daoId');
    const forumId = searchParams.get('forumId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const timeWindow = parseInt(searchParams.get('timeWindow') || '24');

    if (!daoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'daoId is required',
        },
        { status: 400 }
      );
    }

    const trending = await memoryService.getTrendingContent(daoId, {
      forumId: forumId || undefined,
      limit,
      timeWindow,
    });

    // Get recent signal activity for context
    const signalActivity = await onChainService.getRecentSignalActivity(
      daoId,
      20
    );

    return NextResponse.json({
      success: true,
      data: {
        daoId,
        forumId,
        timeWindow,
        trending,
        recentSignals: signalActivity.recentActivity,
        stats: signalActivity.stats,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching trending content:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trending content',
      },
      { status: 500 }
    );
  }
}
