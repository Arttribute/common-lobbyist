import { NextRequest, NextResponse } from 'next/server';
import { memoryService } from '@/lib/services/memory';
import { onChainService } from '@/lib/services/onchain';

/**
 * GET /api/memory/activity/user
 * Get user's activity including authored content and signal history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const daoId = searchParams.get('daoId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeSignals = searchParams.get('includeSignals') !== 'false';
    const includeOnChain = searchParams.get('includeOnChain') === 'true';

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    // Get database activity
    const activity = await memoryService.getUserActivity(userId, {
      daoId: daoId || undefined,
      limit,
      includeSignals,
    });

    // Optionally include on-chain activity
    let onChainActivity: Awaited<ReturnType<typeof onChainService.getUserDaoActivity>> | null = null;
    if (includeOnChain && daoId) {
      try {
        onChainActivity = await onChainService.getUserDaoActivity(
          userId,
          daoId
        );
      } catch (error) {
        console.error('Error fetching on-chain activity:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        daoId,
        activity,
        onChainActivity,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user activity',
      },
      { status: 500 }
    );
  }
}
