import { NextRequest, NextResponse } from 'next/server';
import { memoryService } from '@/lib/services/memory';

/**
 * POST /api/memory/index
 * Index content with vector embeddings for semantic search
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, contentIds, daoId } = body;

    // Single content indexing
    if (contentId) {
      const result = await memoryService.indexContent(contentId);
      return NextResponse.json({
        success: true,
        data: {
          contentId: result._id,
          indexed: true,
          embeddingModel: result.embeddings?.model,
        },
      });
    }

    // Batch content indexing
    if (contentIds && Array.isArray(contentIds)) {
      const results = await memoryService.batchIndexContent(contentIds);
      return NextResponse.json({
        success: true,
        data: {
          total: results.length,
          indexed: results.filter((r: { status: string }) => r.status === 'indexed').length,
          failed: results.filter((r: { status: string }) => r.status === 'error').length,
          results,
        },
      });
    }

    // Index all content for a DAO
    if (daoId) {
      const results = await memoryService.indexDaoContent(daoId);
      return NextResponse.json({
        success: true,
        data: {
          daoId,
          total: results.length,
          indexed: results.filter((r: { status: string }) => r.status === 'indexed').length,
          failed: results.filter((r: { status: string }) => r.status === 'error').length,
          results,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Must provide contentId, contentIds, or daoId',
      },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Error indexing content:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to index content',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/memory/index/status
 * Check indexing status for a DAO
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

    const dbConnect = (await import('@/lib/dbConnect')).default;
    const Content = (await import('@/models/Content')).default;

    await dbConnect();

    const totalContent = await Content.countDocuments({
      daoId,
      status: 'published',
    });

    const indexedContent = await Content.countDocuments({
      daoId,
      status: 'published',
      'embeddings.vector': { $exists: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        daoId,
        totalContent,
        indexedContent,
        pendingContent: totalContent - indexedContent,
        percentIndexed:
          totalContent > 0 ? ((indexedContent / totalContent) * 100).toFixed(2) : 0,
      },
    });
  } catch (error: unknown) {
    console.error('Error checking index status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check index status',
      },
      { status: 500 }
    );
  }
}
