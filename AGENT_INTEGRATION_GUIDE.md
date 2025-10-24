# AgentCommons Integration Guide

## Overview

This guide documents the integration of AgentCommons agents into the Common Lobbyist Protocol. The integration enables each DAO to have its own AI-powered community agent that can interact with members, provide insights on content, and reflect the collective will of the community.

## Features Implemented

### 1. **Automated Agent Creation**
- When a DAO is created, an agent is automatically created via the AgentCommons API
- Default persona and instructions are generated based on the DAO name
- Agent settings are stored in the Organization model

### 2. **Agent Chat Widget**
- Collapsible, non-intrusive chat widget available on all forum pages
- Real-time streaming responses using Server-Sent Events (SSE)
- Session management for conversation continuity
- Only visible when agent is enabled for the DAO

### 3. **Content Insights**
- Integrated into the content editor (posts and comments)
- Three types of insights available:
  - **Alignment Check**: Analyzes how content aligns with community priorities
  - **Sentiment Prediction**: Predicts how the community might respond
  - **Suggestions**: Provides improvement suggestions
- Non-intrusive, expandable interface
- Only appears when content is being written

### 4. **Agent Configuration UI**
- Dedicated settings interface for DAO creators
- Customize agent persona and instructions
- Adjust advanced parameters (temperature, max tokens)
- Enable/disable agent functionality

## Architecture

### Backend Components

#### 1. **AgentCommons Service** ([lib/services/agentcommons.ts](lib/services/agentcommons.ts))
- TypeScript client for AgentCommons API
- Handles agent creation, updates, and chat operations
- Supports both streaming and non-streaming responses
- Methods:
  - `createAgent(params)` - Create a new agent
  - `getAgent(agentId)` - Retrieve agent details
  - `updateAgent(agentId, params)` - Update agent configuration
  - `runAgent(params)` - Run agent (non-streaming)
  - `runAgentStream(params)` - Run agent (streaming)
  - `getDefaultPersona(daoName)` - Generate default persona
  - `getDefaultInstructions(daoName)` - Generate default instructions

#### 2. **Database Schema** ([models/Organization.ts](models/Organization.ts))
Extended Organization model with agent configuration:
```typescript
agent: {
  agentId: string;          // AgentCommons agent ID
  enabled: boolean;         // Whether agent is active
  persona: string;          // Agent character/voice
  instructions: string;     // Operational guidelines
  sessionId: string;        // Main session ID
  temperature: number;      // 0-2, controls randomness
  maxTokens: number;        // Max response length
  topP: number;             // Nucleus sampling parameter
  presencePenalty: number;  // -2 to 2
  frequencyPenalty: number; // -2 to 2
  createdAt: Date;          // Creation timestamp
}
```

#### 3. **API Routes**

##### Agent Chat ([app/api/agent/[organizationId]/chat/route.ts](app/api/agent/[organizationId]/chat/route.ts))
```
POST /api/agent/:organizationId/chat
```
- Streams chat responses using Server-Sent Events
- Requires authentication
- Body: `{ message: string, sessionId?: string }`
- Response: SSE stream with token chunks

##### Content Insights ([app/api/agent/[organizationId]/insights/route.ts](app/api/agent/[organizationId]/insights/route.ts))
```
POST /api/agent/:organizationId/insights
```
- Generates insights on user content
- Requires authentication
- Body: `{ content: string, type: 'alignment' | 'sentiment' | 'suggestions' }`
- Response: `{ insights: string, type: string }`

##### Agent Configuration ([app/api/agent/[organizationId]/route.ts](app/api/agent/[organizationId]/route.ts))
```
GET /api/agent/:organizationId
PUT /api/agent/:organizationId
```
- GET: Retrieve agent configuration
- PUT: Update configuration (creator only)
- PUT Body: `{ persona?, instructions?, temperature?, maxTokens?, enabled? }`

#### 4. **DAO Creation Flow** ([app/api/organization/route.ts](app/api/organization/route.ts))
Enhanced to automatically create agent:
1. Create organization in database
2. Call AgentCommons API to create agent
3. Store agent details in organization.agent
4. If agent creation fails, log error but don't fail DAO creation

### Frontend Components

#### 1. **AgentChatWidget** ([components/agent/AgentChatWidget.tsx](components/agent/AgentChatWidget.tsx))
Collapsible chat interface:
- Floating button when collapsed
- Expandable chat window (96px × 600px)
- Minimize/maximize functionality
- Streaming message display
- Message history
- Typing indicators
- Only shown when agent is enabled

Usage:
```tsx
<AgentChatWidget
  organizationId={orgId}
  organizationName={orgName}
/>
```

#### 2. **ContentInsights** ([components/agent/ContentInsights.tsx](components/agent/ContentInsights.tsx))
Insights panel for content creation:
- Three insight types (alignment, sentiment, suggestions)
- Expandable/collapsible interface
- Loading states
- Error handling

Usage:
```tsx
<ContentInsights
  organizationId={orgId}
  content={contentText}
/>
```

#### 3. **AgentSettings** ([components/agent/AgentSettings.tsx](components/agent/AgentSettings.tsx))
Configuration interface for DAO creators:
- Persona editor (textarea)
- Instructions editor (textarea)
- Temperature slider (0-1)
- Max tokens input
- Enable/disable toggle
- Save functionality with feedback

Usage:
```tsx
<AgentSettings
  organizationId={orgId}
  organizationName={orgName}
  isCreator={true/false}
/>
```

#### 4. **ContentEditor Enhancement** ([components/forum/content-editor.tsx](components/forum/content-editor.tsx))
Modified to include ContentInsights:
- New props: `organizationId`, `enableAgentInsights`
- Automatically shows insights when content is present
- Combines title and text for post insights

### Integration Points

#### Forum Pages
Agent chat widget added to:
1. **Forum List Page** ([app/forum/[organizationId]/[forumId]/page.tsx](app/forum/[organizationId]/[forumId]/page.tsx))
2. **Post Detail Page** ([app/forum/[organizationId]/[forumId]/post/[postId]/page.tsx](app/forum/[organizationId]/[forumId]/post/[postId]/page.tsx))

Conditional rendering:
```tsx
{dao && dao.agent?.enabled && (
  <AgentChatWidget
    organizationId={organizationId}
    organizationName={dao.name}
  />
)}
```

## Environment Variables

Add to your `.env.local`:

```bash
# AgentCommons API Configuration
NEXT_PUBLIC_AGENTCOMMONS_API_URL=https://api.agentcommons.com
AGENTCOMMONS_API_KEY=your_api_key_here  # Optional, if required
```

## Usage Guide

### For DAO Creators

#### 1. Creating a DAO with an Agent
When creating a DAO, an agent is automatically created with default settings. You can optionally provide custom configuration:

```typescript
// In DAO creation request
{
  name: "My DAO",
  // ... other DAO fields
  agent: {
    persona: "Custom persona...",
    instructions: "Custom instructions...",
    temperature: 0.7
  }
}
```

#### 2. Configuring the Agent
1. Navigate to DAO settings
2. Use the `AgentSettings` component
3. Customize persona and instructions
4. Adjust advanced parameters
5. Save configuration

#### 3. Enabling/Disabling the Agent
Use the toggle in AgentSettings to enable or disable the agent without deleting it.

### For DAO Members

#### 1. Chatting with the Agent
1. Navigate to any forum page
2. Click the floating chat button (bottom-right)
3. Type your message and press Enter or click Send
4. Agent responds in real-time with streaming

#### 2. Getting Content Insights
1. Start writing a post or comment
2. ContentInsights panel appears automatically
3. Click one of three insight buttons:
   - **Check Alignment**: See how your content aligns with community priorities
   - **Predict Response**: Understand potential community reactions
   - **Get Suggestions**: Receive improvement recommendations
4. Read insights and refine your content

## Default Agent Configuration

### Default Persona
```
You are the autonomous advocate for [DAO Name], a decentralized autonomous
organization. You represent the collective voice and will of the community,
synthesizing discussions, proposals, and signals into clear, actionable insights.

Your purpose is to:
- Listen to community members and understand their perspectives
- Identify emerging consensus and important dissenting views
- Articulate the community's shared positions with clarity and nuance
- Help members understand how their contributions align with community priorities
- Maintain a living collective memory of what the community values most

You are transparent, data-driven, and committed to representing the authentic
voice of the community.
```

### Default Instructions
```
As the [DAO Name] community agent, follow these guidelines:

1. Context Awareness: Always consider the full context of ongoing discussions,
   including token signals placed on comments and proposals.

2. Balanced Perspective: Present multiple viewpoints when they exist.

3. Signal-Weighted Memory: Give more weight to ideas that have received token
   signals, but don't ignore unsignaled contributions.

4. Clarity and Conciseness: Communicate clearly and directly.

5. Helpful Guidance: When members ask for feedback, assess alignment, suggest
   improvements, and note relevant past discussions.

6. Neutral Facilitation: Don't advocate for specific outcomes.

7. Transparency: Be specific about sources and context.

8. Respectful Engagement: Treat all community members with respect.
```

## Technical Considerations

### Authentication
- All API routes require JWT authentication via Privy
- Auth token passed in `Authorization: Bearer <token>` header
- User wallet address extracted from token for permissions

### Streaming Implementation
- Uses Server-Sent Events (SSE) for chat streaming
- Events formatted as `data: {...}\n\n`
- Frontend uses ReadableStream and TextDecoder
- Token-by-token display for real-time feel

### Error Handling
- Agent creation errors don't fail DAO creation
- Chat errors show user-friendly messages
- Insights failures display error state
- Network errors handled gracefully

### Performance
- Lazy loading of agent components
- Conditional rendering based on agent.enabled
- Session management for conversation continuity
- Optimistic UI updates

## Future Enhancements

Potential improvements for future iterations:

1. **Agent Memory Integration**
   - Store chat history in database
   - Enable cross-session context
   - Implement RAG over DAO discussions

2. **Proactive Agent Actions**
   - Automatic summaries of discussions
   - Trend identification
   - Proposal analysis

3. **Multi-Agent Coordination**
   - Agent-to-agent communication
   - Cross-DAO collaboration
   - Agent spaces/rooms

4. **Advanced Analytics**
   - Track agent usage metrics
   - Measure impact on engagement
   - A/B test different configurations

5. **Voice Integration**
   - Voice chat with agent
   - Audio summaries
   - Voice-to-text for accessibility

## Troubleshooting

### Agent Not Appearing
- Check `dao.agent?.enabled` is true
- Verify environment variables are set
- Check browser console for errors

### Chat Not Streaming
- Verify SSE endpoint is accessible
- Check network tab for streaming response
- Ensure user is authenticated

### Insights Not Loading
- Check authentication token
- Verify content is not empty
- Check API endpoint logs

### Configuration Not Saving
- Verify user is DAO creator
- Check authentication
- Review API response in network tab

## API Reference

### AgentCommons Endpoints Used

```
POST /v1/agents
- Create a new agent
- Body: { name, persona, instructions, owner, temperature, ... }
- Returns: { data: { agentId, ... } }

GET /v1/agents/:agentId
- Get agent details
- Returns: { data: { agentId, persona, ... } }

PUT /v1/agents/:agentId
- Update agent configuration
- Body: { persona?, instructions?, temperature?, ... }
- Returns: { data: { agentId, ... } }

POST /v1/agents/run
- Run agent (non-streaming)
- Headers: { x-initiator: walletAddress }
- Body: { agentId, messages[], sessionId? }
- Returns: { sessionId, response: { role, content }, toolCalls? }

POST /v1/agents/run/stream
- Run agent (streaming)
- Headers: { x-initiator: walletAddress }
- Body: { agentId, messages[], sessionId? }
- Returns: SSE stream
```

## Files Modified/Created

### Created Files
1. `/lib/services/agentcommons.ts` - AgentCommons API client
2. `/types/organization.ts` - TypeScript types
3. `/app/api/agent/[organizationId]/chat/route.ts` - Chat API
4. `/app/api/agent/[organizationId]/insights/route.ts` - Insights API
5. `/app/api/agent/[organizationId]/route.ts` - Config API
6. `/components/agent/AgentChatWidget.tsx` - Chat widget
7. `/components/agent/ContentInsights.tsx` - Insights component
8. `/components/agent/AgentSettings.tsx` - Settings component

### Modified Files
1. `/models/Organization.ts` - Added agent schema
2. `/app/api/organization/route.ts` - Added agent creation
3. `/components/forum/content-editor.tsx` - Integrated insights
4. `/app/forum/[organizationId]/[forumId]/page.tsx` - Added chat widget
5. `/app/forum/[organizationId]/[forumId]/post/[postId]/page.tsx` - Added chat widget

## Summary

The AgentCommons integration successfully enables each DAO in the Common Lobbyist Protocol to have its own AI-powered community agent. The implementation is:

- **Non-intrusive**: Chat widget and insights are optional, expandable features
- **Flexible**: DAO creators can customize agent behavior
- **Scalable**: Built on AgentCommons infrastructure
- **User-friendly**: Simple, elegant interfaces for all interactions
- **Robust**: Comprehensive error handling and fallbacks

The agents serve as continuous community advocates, helping members understand alignment, predict responses, and engage more effectively with their DAOs.
