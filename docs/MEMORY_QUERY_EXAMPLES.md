# Memory System Query Examples

This document provides practical examples of semantic search queries and API usage for the Common Lobbyist Memory System.

## Table of Contents

- [Semantic Search Queries](#semantic-search-queries)
- [Content Context Queries](#content-context-queries)
- [User Activity Queries](#user-activity-queries)
- [Trending Content Queries](#trending-content-queries)
- [On-Chain Verification Queries](#on-chain-verification-queries)
- [Advanced Query Patterns](#advanced-query-patterns)
- [Agent Integration Examples](#agent-integration-examples)

---

## Semantic Search Queries

### Example 1: Find Governance Proposals

**Query:** "proposals about changing voting mechanisms"

```bash
curl -X POST https://your-domain.com/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "proposals about changing voting mechanisms",
    "daoId": "507f1f77bcf86cd799439011",
    "limit": 10,
    "minScore": 0.7,
    "includeOnChainData": true
  }'
```

**Use Case:** Finding discussions about governance reforms

**Expected Results:**
- Posts about quadratic voting
- Proposals for voting weight changes
- Discussions on governance improvements
- Comments on voting system updates

---

### Example 2: Find Token Economic Discussions

**Query:** "token distribution and tokenomics strategies"

```bash
curl -X POST https://your-domain.com/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "token distribution and tokenomics strategies",
    "daoId": "507f1f77bcf86cd799439011",
    "forumId": "forum123",
    "limit": 5,
    "minScore": 0.75
  }'
```

**Use Case:** Research token economic models

**Expected Results:**
- Token allocation proposals
- Economic incentive discussions
- Distribution mechanism debates
- Tokenomics analysis posts

---

### Example 3: Find Technical Implementation Discussions

**Query:** "smart contract security and audit recommendations"

```bash
curl -X POST https://your-domain.com/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "smart contract security and audit recommendations",
    "daoId": "507f1f77bcf86cd799439011",
    "limit": 15,
    "minScore": 0.65
  }'
```

**Use Case:** Finding technical security discussions

**Expected Results:**
- Audit reports
- Security concern posts
- Contract upgrade proposals
- Best practice discussions

---

### Example 4: Find Community Feedback

**Query:** "user experience problems and interface issues"

```bash
curl -X POST https://your-domain.com/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "user experience problems and interface issues",
    "daoId": "507f1f77bcf86cd799439011",
    "limit": 20,
    "minScore": 0.6
  }'
```

**Use Case:** Gathering user feedback and bug reports

**Expected Results:**
- Bug reports
- UX improvement suggestions
- Feature requests
- Usability complaints

---

### Example 5: Find Content by Specific Author

**Query:** "treasury management strategies"

```bash
curl -X POST https://your-domain.com/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "treasury management strategies",
    "daoId": "507f1f77bcf86cd799439011",
    "authorId": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "limit": 10
  }'
```

**Use Case:** Find specific author's contributions on a topic

---

### Example 6: Find Recent Proposals

**Query:** "new governance initiatives from last month"

```bash
curl -X POST https://your-domain.com/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "new governance initiatives from last month",
    "daoId": "507f1f77bcf86cd799439011",
    "limit": 10,
    "minScore": 0.7
  }'
```

**Use Case:** Stay updated on recent DAO activities

---

## Content Context Queries

### Example 7: Get Full Context for a Proposal

```bash
curl "https://your-domain.com/api/memory/search?contentId=507f1f77bcf86cd799439012&includeOnChain=true"
```

**Use Case:** Deep dive into a specific proposal with all context

**Returns:**
- The content itself
- Parent/child relationships
- Similar content
- On-chain proof data
- User signals and staking info

---

### Example 8: Get Context Without On-Chain Data

```bash
curl "https://your-domain.com/api/memory/search?contentId=507f1f77bcf86cd799439012&includeOnChain=false"
```

**Use Case:** Quick context lookup without blockchain data

---

## User Activity Queries

### Example 9: Get User's Complete Activity

```bash
curl "https://your-domain.com/api/memory/activity?userId=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&daoId=507f1f77bcf86cd799439011&includeOnChain=true"
```

**Use Case:** Analyze a user's participation and reputation

**Returns:**
- Authored posts and comments
- Content user has signaled
- Token balance
- Recent transfers
- Total staked amount

---

### Example 10: Get User Activity Across All DAOs

```bash
curl "https://your-domain.com/api/memory/activity?userId=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&limit=100"
```

**Use Case:** User's cross-DAO activity profile

---

### Example 11: Get User's Recent Contributions

```bash
curl "https://your-domain.com/api/memory/activity?userId=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&daoId=507f1f77bcf86cd799439011&limit=20&includeSignals=false"
```

**Use Case:** See what a user has posted recently

---

## Trending Content Queries

### Example 12: Get Today's Trending Content

```bash
curl "https://your-domain.com/api/memory/trending?daoId=507f1f77bcf86cd799439011&limit=10&timeWindow=24"
```

**Use Case:** See what's hot in the DAO today

**Returns:**
- Top 10 trending posts
- Recent signal activity
- Stats on trending topics

---

### Example 13: Get This Week's Trending

```bash
curl "https://your-domain.com/api/memory/trending?daoId=507f1f77bcf86cd799439011&limit=20&timeWindow=168"
```

**Use Case:** Weekly trending analysis (168 hours = 7 days)

---

### Example 14: Get Trending in Specific Forum

```bash
curl "https://your-domain.com/api/memory/trending?daoId=507f1f77bcf86cd799439011&forumId=forum123&limit=10&timeWindow=24"
```

**Use Case:** Forum-specific trending topics

---

## On-Chain Verification Queries

### Example 15: Get DAO's Verifiable References

```bash
curl "https://your-domain.com/api/memory/verify?daoId=507f1f77bcf86cd799439011"
```

**Use Case:** Get all blockchain verification links for a DAO

**Returns:**
- Smart contract addresses
- Blockscout explorer links
- Token contract info
- Registry addresses

---

### Example 16: Get Content's On-Chain Proof

```bash
curl -X POST https://your-domain.com/api/memory/verify \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "507f1f77bcf86cd799439012"
  }'
```

**Use Case:** Verify a specific post's on-chain data

**Returns:**
- Number of supporters
- Total tokens staked
- Quadratic weight
- Transaction hashes
- Timestamps
- Blockscout links

---

### Example 17: Get DAO Token Information

```bash
curl "https://your-domain.com/api/memory/dao/token?daoId=507f1f77bcf86cd799439011"
```

**Use Case:** Get comprehensive DAO token data

**Returns:**
- Token contract address
- Total supply
- Token symbol and name
- Contract verification link

---

### Example 18: Get User's Token Balance

```bash
curl "https://your-domain.com/api/memory/dao/user-tokens?userId=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&daoId=507f1f77bcf86cd799439011"
```

**Use Case:** Check user's token holdings and activity

**Returns:**
- Current balance
- Recent transfers
- Staking activity
- Token allocation history

---

## Advanced Query Patterns

### Example 19: Multi-Step Research Flow

```javascript
// Step 1: Search for proposals
const searchResults = await fetch('/api/memory/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'treasury allocation proposals',
    daoId: '507f1f77bcf86cd799439011',
    limit: 5,
    includeOnChainData: true
  })
}).then(r => r.json());

// Step 2: Get detailed context for top result
const topProposal = searchResults.data.results[0];
const context = await fetch(
  `/api/memory/search?contentId=${topProposal._id}&includeOnChain=true`
).then(r => r.json());

// Step 3: Get author's activity
const authorActivity = await fetch(
  `/api/memory/activity?userId=${topProposal.authorId}&daoId=${topProposal.daoId}`
).then(r => r.json());

// Step 4: Verify on-chain data
const proof = await fetch('/api/memory/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contentId: topProposal._id })
}).then(r => r.json());
```

**Use Case:** Comprehensive research with verification

---

### Example 20: Trending + Context Analysis

```javascript
// Get trending content
const trending = await fetch(
  '/api/memory/trending?daoId=507f1f77bcf86cd799439011&limit=5&timeWindow=24'
).then(r => r.json());

// Get full context for each trending item
const trendingWithContext = await Promise.all(
  trending.data.trending.map(item =>
    fetch(`/api/memory/search?contentId=${item._id}&includeOnChain=true`)
      .then(r => r.json())
  )
);
```

**Use Case:** Detailed trending analysis

---

### Example 21: User Reputation Scoring

```javascript
// Get user's complete activity
const activity = await fetch(
  '/api/memory/activity?userId=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&daoId=507f1f77bcf86cd799439011&includeOnChain=true'
).then(r => r.json());

// Calculate reputation score
const reputationScore = {
  postsCreated: activity.data.activity.authored?.length || 0,
  totalStaked: activity.data.onChainActivity?.totalStaked || '0',
  tokenBalance: activity.data.onChainActivity?.balance || '0',
  signalCount: activity.data.activity.signaled?.length || 0
};
```

**Use Case:** Custom reputation system

---

## Agent Integration Examples

### Example 22: Agent Answers "What are people discussing?"

```typescript
// Agent receives question: "What are people discussing in the DAO?"

// Step 1: Get trending content
const trending = await fetch(
  '/api/memory/trending?daoId=507f1f77bcf86cd799439011&limit=5&timeWindow=24'
).then(r => r.json());

// Step 2: Semantic search for related discussions
const discussions = await fetch('/api/memory/search', {
  method: 'POST',
  body: JSON.stringify({
    query: 'recent community discussions and debates',
    daoId: '507f1f77bcf86cd799439011',
    limit: 10
  })
}).then(r => r.json());

// Agent response:
// "The DAO is currently discussing:
// 1. Treasury allocation proposal (45 supporters, 2,300 tokens staked)
// 2. Governance voting reform (32 supporters, 1,800 tokens)
// 3. Token distribution mechanics (28 supporters, 1,500 tokens)
//
// You can verify this data on-chain: [Blockscout links]"
```

---

### Example 23: Agent Verifies Claims

```typescript
// User asks: "Is there really support for the new voting proposal?"

// Step 1: Search for the proposal
const results = await fetch('/api/memory/search', {
  method: 'POST',
  body: JSON.stringify({
    query: 'new voting proposal',
    daoId: '507f1f77bcf86cd799439011',
    limit: 1,
    includeOnChainData: true
  })
}).then(r => r.json());

// Step 2: Get on-chain proof
const proof = await fetch('/api/memory/verify', {
  method: 'POST',
  body: JSON.stringify({ contentId: results.data.results[0]._id })
}).then(r => r.json());

// Agent response:
// "Yes, the voting proposal has verifiable support:
// - 67 unique supporters
// - 5,420 tokens staked (raw amount)
// - Quadratic weight: 248.3
// - Verified on-chain at: https://base-sepolia.blockscout.com/..."
```

---

### Example 24: Agent Finds Expert Contributors

```typescript
// User asks: "Who knows about tokenomics in this DAO?"

// Step 1: Search for tokenomics content
const content = await fetch('/api/memory/search', {
  method: 'POST',
  body: JSON.stringify({
    query: 'tokenomics token economics distribution',
    daoId: '507f1f77bcf86cd799439011',
    limit: 20
  })
}).then(r => r.json());

// Step 2: Analyze authors
const authorIds = [...new Set(content.data.results.map(r => r.authorId))];

// Step 3: Get activity for top contributors
const expertProfiles = await Promise.all(
  authorIds.slice(0, 5).map(authorId =>
    fetch(`/api/memory/activity?userId=${authorId}&daoId=507f1f77bcf86cd799439011&includeOnChain=true`)
      .then(r => r.json())
  )
);

// Agent response:
// "Top tokenomics contributors:
// 1. 0x742d... - 12 posts on tokenomics, 850 tokens staked
// 2. 0x8a3f... - 8 posts, 1,200 tokens staked
// 3. 0x5c7e... - 6 posts, 650 tokens staked"
```

---

## Natural Language Query Examples

Here are example queries that work well with semantic search:

### Governance & Voting
- "proposals to change how we vote"
- "quadratic voting implementation ideas"
- "governance reform suggestions"
- "voting power distribution concerns"
- "delegation mechanism proposals"

### Token Economics
- "token distribution strategies"
- "inflation rate discussions"
- "staking rewards mechanisms"
- "token utility improvements"
- "economic incentive designs"

### Treasury & Finance
- "treasury allocation proposals"
- "budget planning discussions"
- "funding request approvals"
- "financial sustainability concerns"
- "grant program ideas"

### Technical & Development
- "smart contract upgrade proposals"
- "security audit recommendations"
- "technical implementation details"
- "blockchain integration suggestions"
- "scalability improvement ideas"

### Community & Operations
- "community engagement strategies"
- "onboarding process improvements"
- "moderation policy discussions"
- "communication tools suggestions"
- "conflict resolution approaches"

---

## Query Optimization Tips

### 1. Use Specific, Descriptive Queries
✅ Good: "proposals about implementing quadratic voting mechanisms"
❌ Bad: "voting"

### 2. Adjust minScore Based on Query Type
- Specific technical terms: 0.75-0.85
- General concepts: 0.65-0.75
- Broad searches: 0.5-0.65

### 3. Combine Filters for Precision
```json
{
  "query": "governance proposals",
  "daoId": "specific-dao",
  "forumId": "governance-forum",
  "minScore": 0.7
}
```

### 4. Use Appropriate Limits
- Quick overview: 5-10 results
- Deep research: 20-50 results
- Trending analysis: 10-15 results

### 5. Include On-Chain Data When Needed
- For verification: `includeOnChainData: true`
- For speed: `includeOnChainData: false`

---

## Common Query Patterns

### Research Pattern
1. Semantic search for broad topic
2. Get context for relevant results
3. Verify with on-chain data
4. Get author activity for credibility

### Monitoring Pattern
1. Get trending content
2. Search for related discussions
3. Track user activity
4. Monitor on-chain signals

### Verification Pattern
1. Search for specific claim
2. Get content context
3. Fetch on-chain proof
4. Cross-reference with other sources

### Discovery Pattern
1. Broad semantic search
2. Analyze result patterns
3. Deep dive on interesting threads
4. Follow related content

---

## Testing Your Queries

Use these test queries to verify your setup:

```bash
# Test 1: Basic search
curl -X POST http://localhost:3000/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "daoId": "your-dao-id"}'

# Test 2: Trending
curl "http://localhost:3000/api/memory/trending?daoId=your-dao-id&limit=5"

# Test 3: User activity
curl "http://localhost:3000/api/memory/activity?userId=your-user-id"
```

---

## Related Documentation

- [Memory System Setup](./MEMORY_SYSTEM_SETUP.md) - Setup instructions
- [Memory System Summary](./MEMORY_SYSTEM_SUMMARY.md) - System overview
- [API Toolspec](./API_TOOLSPEC.md) - Complete API specifications

---

**Last Updated**: 2025
**Status**: ✅ Ready to Use
