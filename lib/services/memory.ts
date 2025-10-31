import dbConnect from "../dbConnect";
import Content from "../../models/Content";
import Organization from "../../models/Organization";
import { embeddingService } from "./embedding";

/**
 * Memory Service
 * Handles semantic search and content indexing using MongoDB Atlas Vector Search
 */
export class MemoryService {
  /**
   * Index content with vector embeddings
   * @param contentId - The MongoDB _id of the content to index
   * @returns Updated content with embeddings
   */
  async indexContent(contentId: string) {
    await dbConnect();

    const content = await Content.findById(contentId);
    if (!content) {
      throw new Error(`Content not found: ${contentId}`);
    }

    // Generate embedding from title and text
    const embedding = await embeddingService.generateContentEmbedding({
      title: content.content?.title,
      text: content.content?.text,
    });

    // Update content with embeddings
    content.embeddings = {
      model: "text-embedding-3-small",
      vector: embedding,
    };

    await content.save();
    return content;
  }

  /**
   * Batch index multiple content items
   * @param contentIds - Array of content IDs to index
   * @returns Array of indexed content
   */
  async batchIndexContent(contentIds: string[]) {
    await dbConnect();

    const contents = await Content.find({ _id: { $in: contentIds } });
    const results: Array<{ id: unknown; status: string; error?: string }> = [];

    for (const content of contents) {
      try {
        const embedding = await embeddingService.generateContentEmbedding({
          title: content.content?.title,
          text: content.content?.text,
        });

        content.embeddings = {
          model: "text-embedding-3-small",
          vector: embedding,
        };

        await content.save();
        results.push({ id: content._id, status: "indexed" });
      } catch (error) {
        console.error(`Error indexing content ${content._id}:`, error);
        results.push({
          id: content._id,
          status: "error",
          error: String(error),
        });
      }
    }

    return results;
  }

  /**
   * Index all content for a specific DAO
   * @param daoId - The organization/DAO ID
   * @returns Indexing results
   */
  async indexDaoContent(daoId: string) {
    await dbConnect();

    const contents = await Content.find({
      daoId,
      status: "published",
      "embeddings.vector": { $exists: false }, // Only index content without embeddings
    });

    console.log(`Found ${contents.length} contents to index for DAO ${daoId}`);

    return this.batchIndexContent(contents.map((c) => c._id.toString()));
  }

  /**
   * Perform semantic search on content using MongoDB Atlas Vector Search
   * @param query - The search query text
   * @param options - Search options (daoId, forumId, limit, etc.)
   * @returns Array of matching content with similarity scores
   */
  async semanticSearch(
    query: string,
    options: {
      daoId?: string;
      forumId?: string;
      authorId?: string;
      limit?: number;
      minScore?: number;
      includeOnChainData?: boolean;
      includeRecentContext?: boolean;
    } = {}
  ) {
    await dbConnect();

    const {
      daoId,
      forumId,
      authorId,
      limit = 10,
      minScore = 0.7,
      includeOnChainData = false,
      includeRecentContext = false,
    } = options;

    // Generate embedding for the query
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // Build MongoDB aggregation pipeline for vector search
    const pipeline: any[] = [
      {
        $vectorSearch: {
          index: "vector_index", // You'll need to create this index in MongoDB Atlas
          path: "embeddings.vector",
          queryVector: queryEmbedding,
          numCandidates: limit * 10, // Fetch more candidates for filtering
          limit: limit * 2, // Get more results before filtering by score
        },
      },
      {
        $addFields: {
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    // Add filters
    const matchFilters: any = {
      status: "published",
      score: { $gte: minScore },
    };

    if (daoId) matchFilters.daoId = daoId;
    if (forumId) matchFilters.forumId = forumId;
    if (authorId) matchFilters.authorId = authorId;

    pipeline.push({
      $match: matchFilters,
    });

    // Add on-chain data lookup if requested
    if (includeOnChainData) {
      pipeline.push(
        {
          $lookup: {
            from: "organizations",
            localField: "daoId",
            foreignField: "_id",
            as: "dao",
          },
        },
        {
          $unwind: {
            path: "$dao",
            preserveNullAndEmptyArrays: true,
          },
        }
      );
    }

    // Add comments/replies lookup for posts
    pipeline.push({
      $lookup: {
        from: "contents",
        let: { rootId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$rootId", { $toString: "$$rootId" }] },
                  { $ne: ["$_id", "$$rootId"] }, // Exclude the parent itself
                  { $eq: ["$status", "published"] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              type: 1,
              content: 1,
              authorId: 1,
              onchain: 1,
              userSignals: 1,
              createdAt: 1,
              depth: 1,
            },
          },
          { $sort: { "onchain.totalQuadWeight": -1, createdAt: -1 } },
          { $limit: 5 }, // Top 5 comments by weight
        ],
        as: "topComments",
      },
    });

    pipeline.push(
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 1,
          type: 1,
          daoId: 1,
          forumId: 1,
          authorId: 1,
          content: 1,
          onchain: 1,
          userSignals: 1,
          createdAt: 1,
          score: 1,
          topComments: 1,
          ...(includeOnChainData && {
            "dao.name": 1,
            "dao.tokenName": 1,
            "dao.tokenSymbol": 1,
            "dao.onchain": 1,
          }),
        },
      }
    );

    const results = await Content.aggregate(pipeline);

    // Add proper content links to results
    const appUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const searchResults = results.map((result) => {
      // For posts: /forum/{organizationId}/{forumId}/post/{postId}
      // For comments: /forum/{organizationId}/{forumId}/post/{rootId} (link to parent post)
      const contentId = result.type === "post" ? result._id : result.rootId;

      return {
        ...result,
        link: `${appUrl}/forum/${result.daoId}/${result.forumId}/post/${contentId}`,
        topComments: result.topComments?.map((comment: any) => ({
          ...comment,
          // Comments link to their parent post
          link: `${appUrl}/forum/${result.daoId}/${result.forumId}/post/${result._id}`,
        })),
      };
    });

    // Fetch recent content if:
    // 1. User explicitly requests it (includeRecentContext)
    // 2. No search results found (fallback to show something)
    // 3. Very few search results (< 3) and daoId available
    const shouldFetchRecent =
      includeRecentContext ||
      (daoId && searchResults.length < 3);

    if (shouldFetchRecent && daoId) {
      const recentContent = await this.getRecentContent(daoId, {
        limit: 5,
        hoursAgo: 24,
        includeOnChainData,
      });

      return {
        searchResults,
        recentHappenings: recentContent,
      };
    }

    return {
      searchResults,
      recentHappenings: [],
    };
  }

  /**
   * Get recent content from a DAO (for context about recent happenings)
   * This is separate from semantic search to avoid polluting search results
   * @param daoId - The DAO/organization ID
   * @param options - Options for recent content
   * @returns Array of recent content with metadata
   */
  async getRecentContent(
    daoId: string,
    options: {
      limit?: number;
      hoursAgo?: number;
      includeOnChainData?: boolean;
    } = {}
  ) {
    await dbConnect();

    const { limit = 5, hoursAgo = 24, includeOnChainData = false } = options;

    // Calculate time threshold
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - hoursAgo);

    const pipeline: any[] = [
      {
        $match: {
          daoId,
          status: "published",
          type: "post", // Only posts, not comments
          createdAt: { $gte: timeThreshold },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: limit,
      },
    ];

    // Add on-chain data if requested
    if (includeOnChainData) {
      pipeline.push(
        {
          $lookup: {
            from: "organizations",
            localField: "daoId",
            foreignField: "_id",
            as: "dao",
          },
        },
        {
          $unwind: {
            path: "$dao",
            preserveNullAndEmptyArrays: true,
          },
        }
      );
    }

    pipeline.push({
      $project: {
        _id: 1,
        type: 1,
        daoId: 1,
        forumId: 1,
        authorId: 1,
        content: 1,
        onchain: 1,
        userSignals: 1,
        createdAt: 1,
        ...(includeOnChainData && {
          "dao.name": 1,
          "dao.tokenName": 1,
          "dao.tokenSymbol": 1,
        }),
      },
    });

    const results = await Content.aggregate(pipeline);

    // Add proper links
    const appUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return results.map((result) => ({
      ...result,
      link: `${appUrl}/forum/${result.daoId}/${result.forumId}/post/${result._id}`,
    }));
  }

  /**
   * Get contextual information about a specific content item
   * Includes on-chain signals, parent/child relationships, and DAO info
   * @param contentId - The content ID
   * @returns Contextual content information
   */
  async getContentContext(contentId: string) {
    await dbConnect();

    const content = await Content.findById(contentId).lean();
    if (!content) {
      throw new Error(`Content not found: ${contentId}`);
    }

    // Get DAO information
    const dao =
      content && typeof content === "object" && "daoId" in content
        ? await Organization.findOne({
            _id: (content as unknown as { daoId: string }).daoId,
          })
        : null;

    // Get parent content if this is a comment
    let parentContent: unknown = null;
    if (content && typeof content === "object" && "parentId" in content) {
      parentContent = await Content.findById(
        (content as unknown as { parentId: string }).parentId
      ).lean();
    }

    // Get child comments
    const childComments = await Content.find({
      parentId: contentId,
      status: "published",
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Type guard for content properties
    type ContentData = {
      embeddings?: { vector?: unknown };
      content?: { text?: string; title?: string };
      daoId?: string;
      userSignals?: Array<{ amount?: string }>;
      onchain?: {
        totalRaw?: string;
        totalQuadWeight?: string;
        supporters?: number;
      };
    };
    const typedContent = content as unknown as ContentData;

    // Get similar content (if embeddings exist)
    let similarContent: unknown[] = [];
    if (typedContent.embeddings?.vector) {
      const { searchResults } = await this.semanticSearch(
        typedContent.content?.text || typedContent.content?.title || "",
        {
          daoId: typedContent.daoId,
          limit: 5,
        }
      );
      // Filter out the current content
      similarContent = searchResults.filter((c: unknown) => {
        const item = c as Record<string, unknown>;
        return String(item._id) !== contentId;
      });
    }

    // Calculate on-chain metrics
    const totalSignals = typedContent.userSignals?.length || 0;
    const totalStaked =
      typedContent.userSignals?.reduce(
        (sum: bigint, signal) => sum + BigInt(signal.amount || "0"),
        BigInt(0)
      ) || BigInt(0);

    return {
      content,
      dao: dao
        ? {
            name: dao.name,
            tokenName: dao.tokenName,
            tokenSymbol: dao.tokenSymbol,
            onchain: dao.onchain,
          }
        : null,
      parentContent,
      childComments,
      similarContent,
      onChainMetrics: {
        totalSignals,
        totalStaked: totalStaked.toString(),
        totalRaw: typedContent.onchain?.totalRaw || "0",
        totalQuadWeight: typedContent.onchain?.totalQuadWeight || "0",
        supporters: typedContent.onchain?.supporters || 0,
      },
    };
  }

  /**
   * Search for content by user activity
   * @param userId - The user's wallet address
   * @param options - Search options
   * @returns User's content and activity
   */
  async getUserActivity(
    userId: string,
    options: {
      daoId?: string;
      limit?: number;
      includeSignals?: boolean;
    } = {}
  ) {
    await dbConnect();

    const { daoId, limit = 50, includeSignals = true } = options;

    // Get user's authored content
    const authoredContent: unknown[] = await Content.find({
      authorId: userId,
      status: "published",
      ...(daoId && { daoId }),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get content user has signaled (staked on)
    let signaledContent: unknown[] = [];
    if (includeSignals) {
      signaledContent = await Content.find({
        "userSignals.userId": userId,
        status: "published",
        ...(daoId && { daoId }),
      })
        .sort({ "userSignals.lastUpdatedAt": -1 })
        .limit(limit)
        .lean();
    }

    return {
      authored: authoredContent,
      signaled: signaledContent,
      stats: {
        totalAuthored: authoredContent.length,
        totalSignaled: signaledContent.length,
      },
    };
  }

  /**
   * Get trending content based on recent signal activity
   * @param daoId - The DAO ID
   * @param options - Query options
   * @returns Trending content
   */
  async getTrendingContent(
    daoId: string,
    options: {
      forumId?: string;
      limit?: number;
      timeWindow?: number; // hours
    } = {}
  ) {
    await dbConnect();

    const { forumId, limit = 10, timeWindow = 24 } = options;

    const cutoffDate = new Date(Date.now() - timeWindow * 60 * 60 * 1000);

    const pipeline: any[] = [
      {
        $match: {
          daoId,
          status: "published",
          ...(forumId && { forumId }),
          $or: [
            { "userSignals.lastUpdatedAt": { $gte: cutoffDate } },
            { createdAt: { $gte: cutoffDate } },
          ],
        },
      },
      {
        $addFields: {
          recentSignals: {
            $size: {
              $filter: {
                input: "$userSignals",
                as: "signal",
                cond: { $gte: ["$$signal.lastUpdatedAt", cutoffDate] },
              },
            },
          },
          totalWeight: {
            $cond: {
              if: { $ne: ["$onchain.totalQuadWeight", null] },
              then: { $toDouble: "$onchain.totalQuadWeight" },
              else: 0,
            },
          },
        },
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$recentSignals", 10] },
              { $multiply: ["$totalWeight", 0.1] },
              { $multiply: ["$counters.replies", 5] },
            ],
          },
        },
      },
      {
        $sort: { trendingScore: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 1,
          type: 1,
          daoId: 1,
          forumId: 1,
          authorId: 1,
          content: 1,
          onchain: 1,
          createdAt: 1,
          trendingScore: 1,
          recentSignals: 1,
          "counters.replies": 1,
        },
      },
    ];

    const results = await Content.aggregate(pipeline);
    return results;
  }
}

// Export singleton instance
export const memoryService = new MemoryService();
