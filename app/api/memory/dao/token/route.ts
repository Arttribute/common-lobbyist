import { NextRequest, NextResponse } from 'next/server';
import { onChainService } from '@/lib/services/onchain';

/**
 * GET /api/memory/dao/token
 * Get comprehensive DAO token information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daoId = searchParams.get('daoId');

    if (!daoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'daoId is required',
        },
        { status: 400 }
      );
    }

    const tokenInfo = await onChainService.getDaoTokenInfo(daoId);

    return NextResponse.json({
      success: true,
      data: tokenInfo,
    });
  } catch (error: unknown) {
    console.error('Error fetching DAO token info:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch DAO token info',
      },
      { status: 500 }
    );
  }
}
