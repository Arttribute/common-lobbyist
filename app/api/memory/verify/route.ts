import { NextRequest, NextResponse } from 'next/server';
import { onChainService } from '@/lib/services/onchain';

/**
 * GET /api/memory/verify
 * Get verifiable on-chain references for DAO and content
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daoId = searchParams.get('daoId');
    const contentId = searchParams.get('contentId');

    if (!daoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'daoId is required',
        },
        { status: 400 }
      );
    }

    const references = await onChainService.getVerifiableReferences(
      daoId,
      contentId || undefined
    );

    return NextResponse.json({
      success: true,
      data: references,
    });
  } catch (error: unknown) {
    console.error('Error fetching verifiable references:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch verifiable references',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/memory/verify/content
 * Get comprehensive on-chain proof for specific content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId } = body;

    if (!contentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'contentId is required',
        },
        { status: 400 }
      );
    }

    const proof = await onChainService.getContentOnChainProof(contentId);

    return NextResponse.json({
      success: true,
      data: proof,
    });
  } catch (error: unknown) {
    console.error('Error fetching on-chain proof:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch on-chain proof',
      },
      { status: 500 }
    );
  }
}
