# Memory System Quick Start

Get your semantic search and on-chain verification system running in 15 minutes.

## Prerequisites

- MongoDB Atlas account
- OpenAI API key
- Node.js and npm installed

## Quick Setup (5 Steps)

### 1. Create MongoDB Atlas Vector Search Index (5 min)

1. Login to [MongoDB Atlas](https://cloud.mongodb.com)
2. Go to your cluster → "Atlas Search" → "Create Index"
3. Select "JSON Editor" and paste:

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
      "path": "status"
    }
  ]
}
```

4. Name it `vector_index`
5. Select database and `contents` collection
6. Click "Create" and wait for it to build (~3 minutes)

### 2. Set Environment Variables (1 min)

Add to `.env.local`:

```bash
OPENAI_API_KEY=sk-your-key-here
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Add Index Script to package.json (1 min)

```json
{
  "scripts": {
    "index-content": "ts-node scripts/index-content.ts"
  }
}
```

### 4. Index Your Content (5-10 min)

```bash
# Install dependencies if needed
npm install

# Index all DAO content
npm run index-content -- --all

# Or index specific DAO
npm run index-content -- --daoId=YOUR_DAO_ID
```

### 5. Test It (2 min)

```bash
# Start your Next.js app
npm run dev

# Test semantic search
curl -X POST http://localhost:3000/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "proposals about governance",
    "daoId": "YOUR_DAO_ID",
    "limit": 5
  }'
```

## What You Get

### 8 Agent Tools Ready to Use

1. **searchDaoContent** - Semantic search
2. **getContentContext** - Full context retrieval
3. **getUserActivity** - User participation data
4. **getTrendingContent** - Trending analysis
5. **getVerifiableReferences** - On-chain proof
6. **getContentOnChainProof** - Detailed verification
7. **getDaoTokenInfo** - Token information
8. **getUserDaoTokens** - User token data

### API Endpoints Available

- `POST /api/memory/search` - Semantic search
- `GET /api/memory/search/context` - Get content context
- `GET /api/memory/activity` - User activity
- `GET /api/memory/trending` - Trending content
- `GET /api/memory/verify` - Verifiable references
- `POST /api/memory/verify/content` - On-chain proof
- `GET /api/memory/dao/token` - DAO token info
- `GET /api/memory/dao/user-tokens` - User tokens
- `POST /api/memory/index` - Index content
- `GET /api/memory/register-tools` - Get tool specs

## Register with Agent Commons

Get tool specifications:

```bash
curl http://localhost:3000/api/memory/register-tools
```

Register with your agent:

```typescript
// Fetch tool specs
const { data } = await fetch('http://localhost:3000/api/memory/register-tools')
  .then(r => r.json());

// Register each tool
for (const tool of data.tools) {
  await fetch(`http://localhost:4000/v1/agents/${agentId}/tools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      toolId: tool.function.name,
      usageComments: tool.function.description
    })
  });
}
```

## Example Agent Queries

Your agent can now answer questions like:

- "What are the most supported proposals in the DAO?"
- "Show me recent discussions about token distribution"
- "What has user 0x123... contributed to the DAO?"
- "What's trending in governance discussions this week?"
- "Verify the on-chain data for this proposal"

All responses include:
- ✅ Semantic search results with similarity scores
- ✅ On-chain verification data (token stakes, signals)
- ✅ Blockscout explorer links for proof
- ✅ IPFS content addresses

## Check Status

```bash
# View indexing progress
npm run index-content -- --status

# Status for specific DAO
npm run index-content -- --status --daoId=YOUR_DAO_ID
```

## Automatic Indexing

Add to your content creation endpoint:

```typescript
import { memoryService } from '@/lib/services/memory';

// After creating content
const content = await Content.create({ /* ... */ });

// Index asynchronously
memoryService.indexContent(content._id.toString())
  .catch(console.error);
```

## Documentation

- **Full Setup Guide**: [docs/MEMORY_SYSTEM_SETUP.md](docs/MEMORY_SYSTEM_SETUP.md)
- **System Summary**: [docs/MEMORY_SYSTEM_SUMMARY.md](docs/MEMORY_SYSTEM_SUMMARY.md)
- **This Quick Start**: [MEMORY_SYSTEM_QUICKSTART.md](MEMORY_SYSTEM_QUICKSTART.md)

## Troubleshooting

**No search results?**
- Verify MongoDB Atlas index is built
- Check content is indexed: `npm run index-content -- --status`

**Rate limits?**
- The indexer batches requests with delays
- For large DAOs, index during off-peak hours

**Low similarity scores?**
- Lower `minScore` parameter (try 0.5)
- Ensure content has substantive text

## Files Created

```
lib/services/
  ├── embedding.ts          # OpenAI embeddings
  ├── memory.ts             # Semantic search
  └── onchain.ts            # Blockchain data

lib/tools/
  └── memory-tools.ts       # Agent tool specs

app/api/memory/
  ├── search/route.ts
  ├── activity/route.ts
  ├── trending/route.ts
  ├── verify/route.ts
  ├── dao/token/route.ts
  ├── dao/user-tokens/route.ts
  ├── index/route.ts
  └── register-tools/route.ts

scripts/
  └── index-content.ts      # CLI indexer

docs/
  ├── MEMORY_SYSTEM_SETUP.md
  └── MEMORY_SYSTEM_SUMMARY.md
```

## Next Steps

1. ✅ Create MongoDB Vector Search index
2. ✅ Index your DAO content
3. ✅ Test semantic search API
4. ✅ Register tools with Agent Commons
5. Monitor usage and optimize

---

**Ready to go!** Your agents can now search DAO content semantically with on-chain verification.
