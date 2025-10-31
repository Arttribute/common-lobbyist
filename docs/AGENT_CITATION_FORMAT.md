# Agent Citation Format Guide

This document describes how the Common Lobbyist agent should format search results as minimal, clickable citations for users.

## Overview

When the agent uses the `lobbyistSemanticSearch` tool to find relevant DAO content, it must present results in a specific format that:
- Is easy to read and scan
- Provides clickable links to the actual content
- Shows relevance scores
- Displays on-chain significance (supporters and token weights)
- Explains WHY each result is relevant
- DOES NOT quote content verbatim

## Tool: lobbyistSemanticSearch

The agent has access to the `lobbyistSemanticSearch` tool with the following parameters:

### Required Parameters
- **query** (string): Natural language search query based on user's question
- **daoId** (string): The DAO/organization ID from conversation context

### Optional Parameters (with defaults)
- **limit** (string): Number of results - "10" (range: "5" to "20")
- **minScore** (string): Minimum similarity threshold - "0.7" (range: "0.5" to "0.9")
- **includeOnChainData** (string): ALWAYS set to "true"

### Example Tool Call

```json
{
  "tool": "lobbyistSemanticSearch",
  "arguments": {
    "query": "proposals about token distribution",
    "daoId": "6903ce7747fab6b98e1a83cf",
    "limit": "10",
    "minScore": "0.7",
    "includeOnChainData": "true"
  }
}
```

## Citation Format

### Format Structure

For each search result, the agent should present:

```markdown
**[Title or Content Preview](link)** • Score% match
Supported by N members • X tokens staked

Brief 1-2 sentence explanation of relevance.
```

### Complete Example

When a user asks: "What are the latest discussions about security?"

**Agent Response:**

```markdown
I found 3 relevant discussions about security:

1. **[Vulnerability disclosure: incorrect blob preimages](https://app.com/organization/123/forum/456?contentId=789)** • 72% match
   Supported by 0 members

   This discusses a medium-severity bug in Optimism's fault proof stack and the disclosure process followed, directly addressing your question about security discussions.

2. **[Smart Contract Audit Proposal](https://app.com/organization/123/forum/456?contentId=790)** • 85% match
   Supported by 45 members • 3,200 tokens staked

   The community is strongly supporting this proposal for a comprehensive security audit, showing high concern for security measures.

3. **[Security Best Practices Update](https://app.com/organization/123/forum/456?contentId=791)** • 68% match
   Supported by 12 members • 850 tokens staked

   This proposes updating the DAO's security guidelines based on recent industry standards.
```

## Component Breakdown

### 1. Title with Link

**For Posts:**
```markdown
**[Full Title of the Post](link)**
```

**For Comments:**
```markdown
**[First 60 characters of comment text...](link)**
```

### 2. Relevance Score

Show the similarity score as a percentage with "match":
- `85% match` - High relevance (score >= 0.8)
- `72% match` - Medium relevance (score >= 0.7)
- `65% match` - Lower relevance (score < 0.7)

### 3. On-Chain Significance

**If content has supporters:**
```markdown
Supported by 25 members • 1,500 tokens staked
```

**If content has no supporters:**
```markdown
Supported by 0 members
```

**Format rules:**
- Show number of unique supporters
- Show token weight (use the quadratic weight or total raw amount)
- Use bullet point (•) to separate
- Omit token amount if zero

### 4. Relevance Explanation

Provide 1-2 sentences that:
- Explain WHY this result matches the user's question
- Highlight key aspects relevant to the query
- DO NOT quote the content verbatim
- Use your own words to summarize

## Search Result Data Format

The tool returns results in this structure:

```typescript
{
  success: true,
  data: {
    query: "search query",
    totalResults: 3,
    results: [
      {
        id: "6903fd7684905b3f224c87a9",
        title: "Vulnerability disclosure: incorrect blob preimages",
        type: "post",
        score: 0.72,
        relevance: "Medium",
        onchain: {
          supporters: 0,
          totalWeight: "0",
          totalRaw: "0"
        },
        link: "https://app.com/organization/123/forum/456?contentId=789",
        author: "0xD9303DFc71728f209EF64DD1AD97F5a557AE0Fab",
        createdAt: "2025-10-31T00:06:14.353Z"
      }
    ]
  }
}
```

## Markdown Formatting Rules

### DO:
- ✅ Use **bold** for titles with markdown links: `**[Title](link)**`
- ✅ Show scores as percentages: `72% match`
- ✅ Use bullet point (•) to separate: `25 members • 1,500 tokens`
- ✅ Add blank line between results for readability
- ✅ Provide context in your own words

### DON'T:
- ❌ Quote content verbatim
- ❌ Use HTML tags
- ❌ Include full content text
- ❌ Show raw similarity scores (use percentages instead)
- ❌ Include unnecessary metadata

## Complete Examples

### Example 1: Question about Governance

**User:** "What proposals are there about changing voting systems?"

**Agent Response:**

```markdown
I found 5 proposals about voting system changes:

1. **[Quadratic Voting Implementation](link)** • 87% match
   Supported by 67 members • 5,420 tokens staked

   This is the most supported proposal for implementing quadratic voting to give more balanced representation across token holders.

2. **[Delegation Mechanism Update](link)** • 82% match
   Supported by 45 members • 3,100 tokens staked

   Proposes improvements to the delegation system to make it easier for members to delegate their voting power.

3. **[Vote Weight Calculation Reform](link)** • 78% match
   Supported by 32 members • 2,200 tokens

   Discusses alternative vote weight calculations to address concerns about token concentration.

4. **[Snapshot Integration Proposal](link)** • 71% match
   Supported by 28 members • 1,800 tokens staked

   Suggests integrating with Snapshot for off-chain voting to reduce gas costs.

5. **[Time-locked Voting Discussion](link)** • 69% match
   Supported by 15 members • 950 tokens staked

   Community discussion about implementing time-locked voting to prevent last-minute vote swings.
```

### Example 2: Question with No Strong Results

**User:** "Are there any discussions about space exploration?"

**Agent Response:**

```markdown
I searched for content about space exploration but didn't find any directly relevant discussions in this DAO.

This DAO's focus appears to be on governance and token economics. You might want to:
- Check if there's a different DAO focused on that topic
- Start a new discussion if you'd like to introduce this topic
- Rephrase your question to match this DAO's focus areas
```

### Example 3: Comment Results

**User:** "What do people think about the treasury allocation?"

**Agent Response:**

```markdown
I found several perspectives on treasury allocation:

1. **[Full Treasury Allocation Proposal](link)** • 91% match
   Supported by 89 members • 12,500 tokens staked

   This is the main proposal outlining a comprehensive treasury allocation strategy with broad community support.

2. **["I think we should allocate more funds to development and..."](link)** • 79% match
   Supported by 23 members • 1,650 tokens staked

   A highly-supported comment suggesting increased development funding within the treasury plan.

3. **["The proposed allocation seems too conservative. We shou..."](link)** • 76% match
   Supported by 18 members • 1,200 tokens staked

   Critical perspective arguing for more aggressive treasury deployment.

4. **["What about setting aside an emergency fund? I propose..."](link)** • 73% match
   Supported by 31 members • 2,100 tokens staked

   Popular suggestion to include an emergency reserve in the allocation plan.
```

## Adaptive Formatting

### Few Results (1-3)
Provide more detailed explanations (2-3 sentences per result)

### Many Results (10+)
Keep explanations concise (1 sentence per result) and consider grouping by theme

### No Results
Explain why no results were found and suggest alternatives or clarifications

### Low Relevance Results (all scores < 0.7)
Acknowledge the low match quality and ask if the user wants to:
- Rephrase their question
- Search more broadly
- Ask about a different topic

## Integration with Other Tools

After presenting search results, the agent can use other tools for deeper analysis:

- **get_content_signals**: Get detailed signal history for a specific result
- **get_user_signal_activity**: Show who has signaled the content
- **get_transaction_details**: Verify specific on-chain transactions

## Testing Your Citation Format

To verify proper formatting, check that:

1. ✅ All titles are clickable markdown links
2. ✅ Scores are shown as percentages (not decimals)
3. ✅ On-chain data is clearly displayed
4. ✅ No verbatim content quotes
5. ✅ Explanations are in the agent's own words
6. ✅ Format is consistent across all results
7. ✅ Blank lines separate results for readability

## Related Documentation

- [Memory Query Examples](./MEMORY_QUERY_EXAMPLES.md) - Example search queries
- [Memory System Summary](./MEMORY_SYSTEM_SUMMARY.md) - System architecture
- [API Toolspec](./API_TOOLSPEC.md) - API specifications

---

**Last Updated**: 2025
**Status**: ✅ Active Guidelines
