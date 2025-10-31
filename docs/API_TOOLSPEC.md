# API Toolspec Documentation

This document contains the complete toolspec for all Memory API endpoints. These specifications can be used to integrate the Common Lobbyist Memory API with AI agents, automation tools, and other services.

## Overview

The Memory API provides endpoints for semantic search, content indexing, trending analysis, user activity tracking, and on-chain verification. All endpoints return JSON responses following a consistent format.

## Base URL

Replace `https://common-lobbyist.vercel.app/` with your actual deployment URL:

- **Production**: `https://your-production-domain.com/`
- **Development**: `http://localhost:3000/`

## Complete Toolspec

```json
[
  {
    "name": "semanticSearch",
    "description": "Perform semantic search on DAO content with optional on-chain data. Search through indexed content using natural language queries.",
    "apiSpec": {
      "path": "/api/memory/search",
      "method": "POST",
      "baseUrl": "https://common-lobbyist.vercel.app/",
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "parameters": {
      "type": "object",
      "required": ["query"],
      "properties": {
        "query": {
          "type": "string",
          "description": "The search query to find relevant content"
        },
        "daoId": {
          "type": "string",
          "description": "Filter by specific DAO ID"
        },
        "forumId": {
          "type": "string",
          "description": "Filter by specific forum ID"
        },
        "authorId": {
          "type": "string",
          "description": "Filter by specific author ID"
        },
        "limit": {
          "type": "number",
          "description": "Maximum number of results to return (default: 10)",
          "default": 10
        },
        "minScore": {
          "type": "number",
          "description": "Minimum similarity score threshold (default: 0.7)",
          "default": 0.7
        },
        "includeOnChainData": {
          "type": "boolean",
          "description": "Include on-chain data in results (default: false)",
          "default": false
        }
      }
    }
  },
  {
    "name": "getContentContext",
    "description": "Get full context for a specific content item, optionally including on-chain proof.",
    "apiSpec": {
      "path": "/api/memory/search?contentId={contentId}&includeOnChain={includeOnChain}",
      "method": "GET",
      "baseUrl": "https://common-lobbyist.vercel.app/",
      "headers": {
        "Accept": "application/json"
      }
    },
    "parameters": {
      "type": "object",
      "required": ["contentId"],
      "properties": {
        "contentId": {
          "type": "string",
          "description": "The ID of the content to retrieve context for"
        },
        "includeOnChain": {
          "type": "boolean",
          "description": "Include on-chain proof data (default: false)",
          "default": false
        }
      }
    }
  },
  {
    "name": "indexContent",
    "description": "Index content with vector embeddings for semantic search. Can index single content, batch of content IDs, or all content for a DAO.",
    "apiSpec": {
      "path": "/api/memory/index",
      "method": "POST",
      "baseUrl": "https://common-lobbyist.vercel.app/",
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "parameters": {
      "type": "object",
      "properties": {
        "contentId": {
          "type": "string",
          "description": "Single content ID to index"
        },
        "contentIds": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Array of content IDs for batch indexing"
        },
        "daoId": {
          "type": "string",
          "description": "DAO ID to index all content for"
        }
      }
    }
  },
  {
    "name": "getIndexStatus",
    "description": "Check indexing status for a DAO, showing total, indexed, and pending content.",
    "apiSpec": {
      "path": "/api/memory/index?daoId={daoId}",
      "method": "GET",
      "baseUrl": "https://common-lobbyist.vercel.app/",
      "headers": {
        "Accept": "application/json"
      }
    },
    "parameters": {
      "type": "object",
      "required": ["daoId"],
      "properties": {
        "daoId": {
          "type": "string",
          "description": "The DAO ID to check index status for"
        }
      }
    }
  },
  {
    "name": "getTrendingContent",
    "description": "Get trending content based on recent signal activity within a specified time window.",
    "apiSpec": {
      "path": "/api/memory/trending?daoId={daoId}&forumId={forumId}&limit={limit}&timeWindow={timeWindow}",
      "method": "GET",
      "baseUrl": "https://common-lobbyist.vercel.app/",
      "headers": {
        "Accept": "application/json"
      }
    },
    "parameters": {
      "type": "object",
      "required": ["daoId"],
      "properties": {
        "daoId": {
          "type": "string",
          "description": "The DAO ID to get trending content for"
        },
        "forumId": {
          "type": "string",
          "description": "Optional forum ID to filter trending content"
        },
        "limit": {
          "type": "number",
          "description": "Maximum number of trending items to return (default: 10)",
          "default": 10
        },
        "timeWindow": {
          "type": "number",
          "description": "Time window in hours for trending calculation (default: 24)",
          "default": 24
        }
      }
    }
  },
  {
    "name": "getUserActivity",
    "description": "Get user's activity including authored content and signal history, optionally with on-chain data.",
    "apiSpec": {
      "path": "/api/memory/activity?userId={userId}&daoId={daoId}&limit={limit}&includeSignals={includeSignals}&includeOnChain={includeOnChain}",
      "method": "GET",
      "baseUrl": "https://common-lobbyist.vercel.app/",
      "headers": {
        "Accept": "application/json"
      }
    },
    "parameters": {
      "type": "object",
      "required": ["userId"],
      "properties": {
        "userId": {
          "type": "string",
          "description": "The user ID to get activity for"
        },
        "daoId": {
          "type": "string",
          "description": "Optional DAO ID to filter activity"
        },
        "limit": {
          "type": "number",
          "description": "Maximum number of activity items to return (default: 50)",
          "default": 50
        },
        "includeSignals": {
          "type": "boolean",
          "description": "Include signal history (default: true)",
          "default": true
        },
        "includeOnChain": {
          "type": "boolean",
          "description": "Include on-chain activity data (default: false)",
          "default": false
        }
      }
    }
  },
  {
    "name": "getVerifiableReferences",
    "description": "Get verifiable on-chain references for a DAO and optionally specific content.",
    "apiSpec": {
      "path": "/api/memory/verify?daoId={daoId}&contentId={contentId}",
      "method": "GET",
      "baseUrl": "https://common-lobbyist.vercel.app/",
      "headers": {
        "Accept": "application/json"
      }
    },
    "parameters": {
      "type": "object",
      "required": ["daoId"],
      "properties": {
        "daoId": {
          "type": "string",
          "description": "The DAO ID to get verifiable references for"
        },
        "contentId": {
          "type": "string",
          "description": "Optional content ID to get specific content references"
        }
      }
    }
  },
  {
    "name": "getContentOnChainProof",
    "description": "Get comprehensive on-chain proof for specific content, including all blockchain verifications.",
    "apiSpec": {
      "path": "/api/memory/verify",
      "method": "POST",
      "baseUrl": "https://common-lobbyist.vercel.app/",
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "parameters": {
      "type": "object",
      "required": ["contentId"],
      "properties": {
        "contentId": {
          "type": "string",
          "description": "The content ID to get on-chain proof for"
        }
      }
    }
  },
  {
    "name": "getDaoTokenInfo",
    "description": "Get comprehensive DAO token information including token details and statistics.",
    "apiSpec": {
      "path": "/api/memory/dao/token?daoId={daoId}",
      "method": "GET",
      "baseUrl": "https://common-lobbyist.vercel.app/",
      "headers": {
        "Accept": "application/json"
      }
    },
    "parameters": {
      "type": "object",
      "required": ["daoId"],
      "properties": {
        "daoId": {
          "type": "string",
          "description": "The DAO ID to get token information for"
        }
      }
    }
  },
  {
    "name": "getUserDaoTokens",
    "description": "Get user's token balance and activity for a specific DAO.",
    "apiSpec": {
      "path": "/api/memory/dao/user-tokens?userId={userId}&daoId={daoId}",
      "method": "GET",
      "baseUrl": "https://common-lobbyist.vercel.app/",
      "headers": {
        "Accept": "application/json"
      }
    },
    "parameters": {
      "type": "object",
      "required": ["userId", "daoId"],
      "properties": {
        "userId": {
          "type": "string",
          "description": "The user ID to get token balance for"
        },
        "daoId": {
          "type": "string",
          "description": "The DAO ID to get user tokens for"
        }
      }
    }
  }
]
```

## Usage Examples

### Example 1: Semantic Search

```bash
curl -X POST https://common-lobbyist.vercel.app/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "governance proposals about token distribution",
    "daoId": "507f1f77bcf86cd799439011",
    "limit": 5,
    "minScore": 0.7,
    "includeOnChainData": true
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "query": "governance proposals about token distribution",
    "filters": {
      "daoId": "507f1f77bcf86cd799439011"
    },
    "totalResults": 5,
    "results": [
      {
        "_id": "...",
        "title": "Fair Token Distribution Model",
        "score": 0.87,
        "userSignals": [...]
      }
    ]
  }
}
```

### Example 2: Get Content Context

```bash
curl https://common-lobbyist.vercel.app/api/memory/search?contentId=507f1f77bcf86cd799439011&includeOnChain=true
```

### Example 3: Index Content

```bash
curl -X POST https://common-lobbyist.vercel.app/api/memory/index \
  -H "Content-Type: application/json" \
  -d '{
    "contentIds": ["id1", "id2", "id3"]
  }'
```

### Example 4: Get Trending Content

```bash
curl "https://common-lobbyist.vercel.app/api/memory/trending?daoId=507f1f77bcf86cd799439011&limit=10&timeWindow=24"
```

### Example 5: Get User Activity

```bash
curl "https://common-lobbyist.vercel.app/api/memory/activity?userId=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&daoId=507f1f77bcf86cd799439011&includeOnChain=true"
```

## Integration with AI Agents

### Using with Agent Commons

1. **Load the toolspec:**

   ```typescript
   const toolspec = await fetch(
     "https://common-lobbyist.vercel.app/api/memory/register-tools"
   ).then((r) => r.json());
   ```

2. **Register tools with your agent:**

   ```typescript
   for (const tool of toolspec.data.tools) {
     await registerTool(agentId, tool);
   }
   ```

3. **Agent can now use the tools:**
   - Search DAO content semantically
   - Retrieve context and related information
   - Access on-chain verification data
   - Track user activity and trending topics

### Using with Custom Implementations

The toolspec follows the standard JSON schema format and can be used with:

- OpenAI function calling
- Anthropic Claude tools
- LangChain agents
- Custom agent frameworks

## Response Format

All endpoints return responses in this format:

```json
{
  "success": true,
  "data": {
    // Endpoint-specific data
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Rate Limiting

Consider implementing rate limiting for production use:

- Semantic search: 100 requests/minute
- Indexing: 10 requests/minute
- Other endpoints: 200 requests/minute

## Authentication

Currently, the API endpoints are open. For production use, consider adding:

- API key authentication
- JWT token validation
- Rate limiting per user/API key

## Related Documentation

- [Memory System Setup](./MEMORY_SYSTEM_SETUP.md) - Detailed setup instructions
- [Memory System Summary](./MEMORY_SYSTEM_SUMMARY.md) - System overview and architecture
- [Agent Commons Integration](./AGENTVERSE_INTEGRATION.md) - Integration guide

## Support

For questions or issues:

1. Check the [Memory System Setup Guide](./MEMORY_SYSTEM_SETUP.md)
2. Review API route implementations in `app/api/memory/`
3. Examine service files in `lib/services/`

---

**Last Updated**: 2025
**API Version**: 1.0
**Status**: ✅ Production Ready
