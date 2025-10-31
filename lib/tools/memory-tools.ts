/**
 * Memory Tool Specifications for Agent Commons
 *
 * These tool specs allow agents to perform semantic search on DAO content
 * and retrieve verifiable on-chain data for contextual responses
 */

export const memoryToolSpecs = [
  {
    name: 'searchDaoContent',
    description:
      'Perform semantic search on DAO forum content (posts, comments, proposals). Returns relevant content based on natural language query with similarity scores and optional on-chain data.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'The search query in natural language (e.g., "proposals about token distribution", "discussions on governance")',
        },
        daoId: {
          type: 'string',
          description: 'The DAO organization ID to search within',
        },
        forumId: {
          type: 'string',
          description: 'Optional: Specific forum ID to narrow search',
        },
        authorId: {
          type: 'string',
          description:
            'Optional: Filter by author wallet address',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
          default: 10,
        },
        minScore: {
          type: 'number',
          description:
            'Minimum similarity score threshold 0-1 (default: 0.7)',
          default: 0.7,
        },
        includeOnChainData: {
          type: 'boolean',
          description:
            'Include on-chain signal/staking data for results (default: false)',
          default: false,
        },
      },
      required: ['query', 'daoId'],
    },
    endpoint: '/api/memory/search',
    method: 'POST',
  },
  {
    name: 'getContentContext',
    description:
      'Get comprehensive context for a specific content item including parent/child relationships, similar content, on-chain metrics, and signal activity. Use this when you need detailed information about a specific post or comment.',
    parameters: {
      type: 'object',
      properties: {
        contentId: {
          type: 'string',
          description: 'The MongoDB _id of the content item',
        },
        includeOnChain: {
          type: 'boolean',
          description:
            'Include on-chain proof and verification data (default: false)',
          default: false,
        },
      },
      required: ['contentId'],
    },
    endpoint: '/api/memory/search/context',
    method: 'GET',
  },
  {
    name: 'getUserActivity',
    description:
      'Get user\'s activity within a DAO including authored content, signal/staking history, and on-chain token data. Use this to understand a user\'s participation and contribution.',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User\'s wallet address',
        },
        daoId: {
          type: 'string',
          description: 'Optional: Specific DAO to filter activity',
        },
        limit: {
          type: 'number',
          description: 'Maximum items per category (default: 50)',
          default: 50,
        },
        includeSignals: {
          type: 'boolean',
          description:
            'Include signal/staking activity (default: true)',
          default: true,
        },
        includeOnChain: {
          type: 'boolean',
          description:
            'Include on-chain token balance and transfers (default: false)',
          default: false,
        },
      },
      required: ['userId'],
    },
    endpoint: '/api/memory/activity',
    method: 'GET',
  },
  {
    name: 'getTrendingContent',
    description:
      'Get trending content in a DAO based on recent signal activity, replies, and quadratic weights. Use this to understand what topics are currently popular or active.',
    parameters: {
      type: 'object',
      properties: {
        daoId: {
          type: 'string',
          description: 'The DAO organization ID',
        },
        forumId: {
          type: 'string',
          description: 'Optional: Specific forum to get trending from',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 10)',
          default: 10,
        },
        timeWindow: {
          type: 'number',
          description:
            'Time window in hours to consider for trending (default: 24)',
          default: 24,
        },
      },
      required: ['daoId'],
    },
    endpoint: '/api/memory/trending',
    method: 'GET',
  },
  {
    name: 'getVerifiableReferences',
    description:
      'Get verifiable on-chain references (smart contract addresses, transaction hashes, block explorer links) for DAO and optionally specific content. Use this to provide proof and verification in responses.',
    parameters: {
      type: 'object',
      properties: {
        daoId: {
          type: 'string',
          description: 'The DAO organization ID',
        },
        contentId: {
          type: 'string',
          description:
            'Optional: Specific content ID to get verification for',
        },
      },
      required: ['daoId'],
    },
    endpoint: '/api/memory/verify',
    method: 'GET',
  },
  {
    name: 'getContentOnChainProof',
    description:
      'Get comprehensive on-chain proof for specific content including signal registry logs, token transfers from signalers, IPFS links, and quadratic voting weights. Use this when you need to verify claims or provide detailed on-chain evidence.',
    parameters: {
      type: 'object',
      properties: {
        contentId: {
          type: 'string',
          description: 'The content ID to get on-chain proof for',
        },
      },
      required: ['contentId'],
    },
    endpoint: '/api/memory/verify/content',
    method: 'POST',
  },
  {
    name: 'getDaoTokenInfo',
    description:
      'Get comprehensive information about a DAO\'s governance token including on-chain deployment, transfers, holder metrics, and explorer links.',
    parameters: {
      type: 'object',
      properties: {
        daoId: {
          type: 'string',
          description: 'The DAO organization ID',
        },
      },
      required: ['daoId'],
    },
    endpoint: '/api/memory/dao/token',
    method: 'GET',
  },
  {
    name: 'getUserDaoTokens',
    description:
      'Get user\'s token balance and activity for a specific DAO including on-chain transfers and signal placements.',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User\'s wallet address',
        },
        daoId: {
          type: 'string',
          description: 'The DAO organization ID',
        },
      },
      required: ['userId', 'daoId'],
    },
    endpoint: '/api/memory/dao/user-tokens',
    method: 'GET',
  },
];

/**
 * Helper to convert tool specs to Agent Commons format
 */
export function formatToolSpecsForAgentCommons() {
  return memoryToolSpecs.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
    // Store endpoint info for dynamic invocation
    apiSpec: {
      endpoint: tool.endpoint,
      method: tool.method,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    },
  }));
}
