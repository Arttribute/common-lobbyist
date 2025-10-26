import { NextRequest, NextResponse } from 'next/server';
import { onChainService } from '@/lib/services/onchain';

/**
 * GET /api/memory/dao/user-tokens
 * Get user's token balance and activity for a DAO
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const daoId = searchParams.get('daoId');

    if (!userId || !daoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId and daoId are required',
        },
        { status: 400 }
      );
    }

    const activity = await onChainService.getUserDaoActivity(userId, daoId);

    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (error: unknown) {
    console.error('Error fetching user DAO tokens:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user DAO tokens',
      },
      { status: 500 }
    );
  }
}
