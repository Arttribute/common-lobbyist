# Memory System Setup Guide

This guide explains how to set up and use the semantic search and memory system for DAO content with on-chain verification.

## Overview

The memory system provides:
- **Semantic search** on DAO content (posts, comments, proposals)
- **On-chain verification** with governance token data and staking information
- **Contextual retrieval** for AI agents with verifiable blockchain references
- **Tool specifications** for Agent Commons dynamic tool registration

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Agent Commons                            │
│  (Agents use memory tools for semantic search)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Tool Calls
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Memory API Routes                           │
│  /api/memory/search, /api/memory/activity, etc.             │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌────────────────┐           ┌────────────────┐
│ Memory Service │           │ OnChain Service│
│ (Semantic)     │           │ (Blockscout)   │
└────────┬───────┘           └────────┬───────┘
         │                            │
         ▼                            ▼
┌─────────────────┐          ┌─────────────────┐
│  MongoDB Atlas  │          │  Base Sepolia   │
│ Vector Search   │          │   Blockchain    │
└─────────────────┘          └─────────────────┘
```

## Setup Instructions

### 1. MongoDB Atlas Vector Search Index

The Content model already has an `embeddings` field with vector support. You need to create a vector search index in MongoDB Atlas:

#### Step 1: Login to MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster
3. Click on "Atlas Search" in the left menu

#### Step 2: Create Vector Search Index
1. Click "Create Index"
2. Select "JSON Editor"
3. Use the following index definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embeddings.vector",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "daoId"
    },
    {
      "type": "filter",
      "path": "forumId"
    },
    {
      "type": "filter",
      "path": "authorId"
    },
    {
      "type": "filter",
      "path": "status"
    }
  ]
}
```

4. Name the index: `vector_index`
5. Select your database and collection: `contents`
6. Click "Create Search Index"

#### Step 3: Wait for Index to Build
The index will take a few minutes to build. You'll see a status indicator.

### 2. Environment Variables

Ensure these are set in your `.env.local`:

```bash
# OpenAI for embeddings
OPENAI_API_KEY=your_openai_api_key

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Next.js App URL (NO trailing slash)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Agent Commons API (if using)
AGENT_COMMONS_API_URL=http://localhost:4000
```

### 3. Install Dependencies

The required packages are already in `package.json`:

```bash
npm install
```

### 4. Index Existing Content

Run the indexer script to generate embeddings for existing content:

```bash
# Index all DAOs
npm run index-content -- --all

# Index specific DAO
npm run index-content -- --daoId=<dao_mongodb_id>

# Check indexing status
npm run index-content -- --status

# Check status for specific DAO
npm run index-content -- --status --daoId=<dao_mongodb_id>
```

Add this script to your `package.json`:

```json
{
  "scripts": {
    "index-content": "ts-node scripts/index-content.ts"
  }
}
```

### 5. Automatic Indexing

To automatically index new content when it's created, add this to your content creation API:

```typescript
import { memoryService } from '@/lib/services/memory';

// After creating content
const content = await Content.create({
  // ... content data
});

// Index asynchronously (don't block response)
memoryService.indexContent(content._id.toString()).catch(console.error);
```

## API Endpoints

### Search and Context

#### `POST /api/memory/search`
Semantic search on DAO content

```typescript
const response = await fetch('/api/memory/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'proposals about token distribution',
    daoId: 'dao_id',
    limit: 10,
    minScore: 0.7,
    includeOnChainData: true,
  }),
});
```

#### `GET /api/memory/search/context?contentId=<id>&includeOnChain=true`
Get full context for a content item

### Activity and Trending

#### `GET /api/memory/activity?userId=<address>&daoId=<id>&includeOnChain=true`
Get user's activity and contributions

#### `GET /api/memory/trending?daoId=<id>&limit=10&timeWindow=24`
Get trending content based on recent activity

### On-Chain Verification

#### `GET /api/memory/verify?daoId=<id>&contentId=<id>`
Get verifiable on-chain references

#### `POST /api/memory/verify/content`
Get comprehensive on-chain proof

#### `GET /api/memory/dao/token?daoId=<id>`
Get DAO token information

#### `GET /api/memory/dao/user-tokens?userId=<address>&daoId=<id>`
Get user's token balance and activity

### Indexing

#### `POST /api/memory/index`
Index content with embeddings

```typescript
// Index single content
{ contentId: 'content_id' }

// Batch index
{ contentIds: ['id1', 'id2', 'id3'] }

// Index all DAO content
{ daoId: 'dao_id' }
```

#### `GET /api/memory/index/status?daoId=<id>`
Check indexing status

## Agent Commons Integration

### 1. Get Tool Specifications

```bash
curl http://localhost:3000/api/memory/register-tools
```

This returns tool specifications formatted for Agent Commons.

### 2. Register Tools with Agent Commons

The memory system provides 8 tools for agents:

1. **searchDaoContent** - Semantic search on DAO content
2. **getContentContext** - Get comprehensive context for content
3. **getUserActivity** - Get user's participation and contributions
4. **getTrendingContent** - Get currently popular/active content
5. **getVerifiableReferences** - Get on-chain proof links
6. **getContentOnChainProof** - Get detailed on-chain evidence
7. **getDaoTokenInfo** - Get DAO token information
8. **getUserDaoTokens** - Get user's token balance and activity

### 3. Register with Agent

```typescript
// Get tool specs
const toolSpecs = await fetch('http://localhost:3000/api/memory/register-tools').then(r => r.json());

// For each tool, register with Agent Commons
for (const tool of toolSpecs.data.tools) {
  await fetch(`${AGENT_COMMONS_URL}/v1/agents/${agentId}/tools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      toolId: tool.function.name,
      usageComments: tool.function.description,
    }),
  });
}
```

### 4. Tool Invocation Flow

When an agent calls a memory tool:

```
1. Agent decides to search DAO content
   ↓
2. Agent Commons calls tool: searchDaoContent
   ↓
3. Tool handler routes to: POST /api/memory/search
   ↓
4. Memory service performs semantic search
   ↓
5. Results returned to agent with similarity scores
   ↓
6. Agent can follow up with getContentContext or getVerifiableReferences
```

## Usage Examples

### Example 1: Semantic Search

```typescript
// Search for proposals about governance
const results = await fetch('/api/memory/search', {
  method: 'POST',
  body: JSON.stringify({
    query: 'governance proposals for voting rights',
    daoId: '507f1f77bcf86cd799439011',
    limit: 5,
    includeOnChainData: true,
  }),
});

// Results include:
// - Matching content with similarity scores
// - On-chain signal data (who staked, how much)
// - Quadratic voting weights
// - DAO token information
```

### Example 2: User Activity with On-Chain Data

```typescript
// Get comprehensive user activity
const activity = await fetch(
  '/api/memory/activity?' + new URLSearchParams({
    userId: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    daoId: '507f1f77bcf86cd799439011',
    includeOnChain: 'true',
  })
);

// Returns:
// - Authored posts and comments
// - Content user has signaled (staked on)
// - Token balance
// - Recent token transfers
// - Total staked across content
```

### Example 3: Verifiable Agent Response

```typescript
// Agent retrieves verification data
const proof = await fetch(
  '/api/memory/verify?' + new URLSearchParams({
    daoId: '507f1f77bcf86cd799439011',
    contentId: '507f1f77bcf86cd799439012',
  })
);

// Agent can now respond with verifiable claims:
// "This proposal has 25 supporters who staked 1,500 tokens.
//  You can verify this on-chain at:
//  https://base-sepolia.blockscout.com/address/0x..."
```

## Monitoring and Maintenance

### Check Index Status

```bash
# Overall status
npm run index-content -- --status

# Specific DAO
npm run index-content -- --status --daoId=507f1f77bcf86cd799439011
```

### Reindex Content

If you need to regenerate embeddings:

```bash
# Delete existing embeddings in MongoDB
db.contents.updateMany(
  { daoId: ObjectId("507f1f77bcf86cd799439011") },
  { $unset: { embeddings: "" } }
)

# Reindex
npm run index-content -- --daoId=507f1f77bcf86cd799439011
```

### Monitor Search Performance

MongoDB Atlas provides search analytics:
1. Go to Atlas Search
2. Click on your `vector_index`
3. View query performance and usage stats

## Troubleshooting

### Issue: Vector search returns no results

**Solution:**
1. Verify the index is built: Check MongoDB Atlas Search status
2. Ensure content is indexed: Run `npm run index-content -- --status`
3. Check embedding model: Verify `text-embedding-3-small` (1536 dimensions)

### Issue: OpenAI API rate limits

**Solution:**
1. The indexer processes in batches of 5 with delays
2. For large DAOs, index incrementally
3. Consider using a paid OpenAI tier with higher limits

### Issue: Similarity scores too low

**Solution:**
1. Lower `minScore` parameter (try 0.5 or 0.6)
2. Ensure query text is substantive (not single words)
3. Check that content has meaningful text (not just titles)

## Performance Optimization

1. **Indexing**: Run during off-peak hours for large batches
2. **Caching**: Consider caching frequent queries
3. **Batch Operations**: Use batch indexing for multiple content items
4. **Filters**: Always filter by `daoId` to improve search performance
5. **Limits**: Use reasonable `limit` values (10-50) for searches

## Security Considerations

1. **API Rate Limiting**: Add rate limiting to memory API routes
2. **Authentication**: Protect sensitive endpoints with auth middleware
3. **Input Validation**: Memory routes validate all inputs
4. **On-Chain Data**: All blockchain data is read-only
5. **Privacy**: Embeddings don't expose raw content to unauthorized users

## Next Steps

1. Set up MongoDB Atlas Vector Search index
2. Index existing DAO content
3. Test semantic search API
4. Register tools with Agent Commons agents
5. Monitor search usage and performance
6. Set up automatic indexing for new content

For questions or issues, refer to the source code in:
- `lib/services/memory.ts` - Semantic search service
- `lib/services/onchain.ts` - On-chain data service
- `lib/services/embedding.ts` - Embedding generation
- `lib/tools/memory-tools.ts` - Agent tool specifications
