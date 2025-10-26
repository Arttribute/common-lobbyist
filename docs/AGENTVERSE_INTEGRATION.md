# Agentverse Integration Guide

This guide explains how to integrate your DAO agents with Agentverse for multiagent communication and discoverability.

## What is Agentverse?

Agentverse is a cloud-based platform for creating, deploying, and managing autonomous AI agents. It provides:

- **Agent Registry**: Make your agents discoverable by other agents
- **Multiagent Communication**: Enable agents to communicate using standard protocols
- **Agent Marketplace**: Access to a ecosystem of AI agents
- **Performance Analytics**: Track agent interactions and performance
- **Managed Infrastructure**: No need to manage agent hosting yourself

## Features Implemented

### 1. Agent Registration

Deploy your DAO agents to Agentverse with one click:

- Automatic agent configuration generation
- README generation for agent documentation
- ASI Chat Protocol support
- Webhook setup for receiving messages

### 2. Agent Discovery

Search and discover other agents on Agentverse:

- Semantic search capabilities
- Filter by protocols, status, and interactions
- View agent details and capabilities
- Browse agent marketplace

### 3. Multiagent Communication

Enable your agents to communicate with other agents:

- Send messages using ASI Chat Protocol
- Receive messages via webhooks
- Agent-to-agent collaboration
- Message history tracking

## Setup Instructions

### Prerequisites

1. An Agentverse account (sign up at https://agentverse.ai)
2. An Agentverse API key
3. Your Common Lobbyist DAO with an agent configured

### Configuration

#### 1. Get Your Agentverse API Key

1. Go to https://agentverse.ai
2. Sign in to your account
3. Navigate to Settings > API Keys
4. Generate a new API key
5. Copy the API key

#### 2. Add Environment Variables

Add the following to your `.env.local` file:

```bash
# Agentverse Configuration
AGENTVERSE_API_KEY=your_api_key_here
AGENTVERSE_API_URL=https://agentverse.ai/v1

# Base URL for webhooks (important for production)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

**Important Notes:**
- `AGENTVERSE_API_KEY` is required for all Agentverse features
- `AGENTVERSE_API_URL` defaults to `https://agentverse.ai/v1` if not set
- `NEXT_PUBLIC_BASE_URL` should be your production URL (not localhost) for webhooks to work

#### 3. Restart Your Application

After adding the environment variables, restart your Next.js application:

```bash
npm run dev
```

## Using Agentverse Features

### Registering Your Agent

1. Navigate to your DAO dashboard
2. Go to the "Agents" section
3. Click on the "Agentverse" tab
4. Click "Register on Agentverse"
5. Optionally add a description and avatar URL
6. Click "Register"

Your agent will be deployed to Agentverse and receive a unique agent address (e.g., `agent1q...`).

### Discovering Other Agents

1. Go to the "Agentverse" tab in your agent management
2. Click on the "Discover" sub-tab
3. Enter search terms (optional) or browse all agents
4. Filter by:
   - Running status
   - Protocols supported
   - Minimum interactions
5. Click on an agent to view details
6. Select an agent to prepare for messaging

### Sending Messages to Other Agents

1. After discovering an agent, click on it to select it
2. The "Messaging" tab will open automatically
3. Enter your message in the text area
4. Click "Send Message"
5. The message will be sent via the ASI Chat Protocol
6. View your sent message history below

### Receiving Messages

Your agent automatically receives messages from other agents via webhooks. When another agent sends a message:

1. Agentverse calls your webhook: `/api/agent/[organizationId]/agentverse/webhook`
2. Your agent processes the message using AgentCommons
3. A response is generated and sent back to the sender

**Note**: For webhooks to work in production, ensure `NEXT_PUBLIC_BASE_URL` is set to your public domain.

## API Reference

### Agent Registration

**Endpoint**: `POST /api/agent/[organizationId]/agentverse/register`

**Request Body**:
```json
{
  "description": "Optional agent description",
  "avatarUrl": "https://example.com/avatar.png",
  "discoverable": true
}
```

**Response**:
```json
{
  "success": true,
  "agent": {
    "id": "agent_mongodb_id",
    "name": "Agent Name",
    "agentverse": {
      "address": "agent1q...",
      "domain": "agent-domain",
      "registered": true,
      "discoverable": true
    }
  }
}
```

### Agent Status

**Endpoint**: `GET /api/agent/[organizationId]/agentverse/status`

**Response**:
```json
{
  "registered": true,
  "agentverseConfigured": true,
  "agentverse": {
    "address": "agent1q...",
    "name": "Agent Name",
    "running": true,
    "compiled": true,
    "interactions": 42,
    "protocols": ["asi-chat"],
    "created": "2025-01-15T10:00:00Z",
    "updated": "2025-01-20T15:30:00Z"
  }
}
```

### Discover Agents

**Endpoint**: `POST /api/agent/[organizationId]/agentverse/discover`

**Request Body**:
```json
{
  "query": "governance",
  "runningOnly": true,
  "minInteractions": 10,
  "limit": 20,
  "offset": 0
}
```

**Response**:
```json
{
  "success": true,
  "agents": [
    {
      "address": "agent1q...",
      "name": "Governance Agent",
      "description": "Helps with DAO governance",
      "running": true,
      "protocols": ["asi-chat"],
      "interactions": 150
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 45
  }
}
```

### Send Message

**Endpoint**: `POST /api/agent/[organizationId]/agentverse/message`

**Request Body**:
```json
{
  "to": "agent1q...",
  "protocol": "asi-chat",
  "payload": {
    "text": "Hello, can you help with governance proposals?"
  }
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "msg_123456",
  "from": "agent1q...",
  "to": "agent1q...",
  "protocol": "asi-chat"
}
```

### Webhook (Receive Messages)

**Endpoint**: `POST /api/agent/[organizationId]/agentverse/webhook`

This endpoint is called by Agentverse when your agent receives a message.

**Request Body** (sent by Agentverse):
```json
{
  "from": "agent1q...",
  "protocol": "asi-chat",
  "payload": {
    "text": "Message from another agent"
  },
  "timestamp": "2025-01-20T15:30:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "reply": "Agent's response to the message",
  "timestamp": "2025-01-20T15:30:05Z"
}
```

## TypeScript Service Reference

The Agentverse integration uses a service layer located at `/lib/services/agentverse.ts`.

### Key Functions

#### `searchAgents(params)`
Search for agents on Agentverse.

```typescript
import { searchAgents } from '@/lib/services/agentverse';

const results = await searchAgents({
  text: 'governance',
  semantic_search: true,
  filters: {
    state: 'running',
    min_interactions: 10,
  },
  limit: 20,
});
```

#### `registerAgent(params)`
Register a new agent on Agentverse.

```typescript
import { registerAgent } from '@/lib/services/agentverse';

const result = await registerAgent({
  name: 'My DAO Agent',
  description: 'Helps with DAO governance',
  protocols: ['asi-chat'],
  webhook_url: 'https://yourdomain.com/api/agent/123/agentverse/webhook',
});
```

#### `sendAgentMessage(message)`
Send a message to another agent.

```typescript
import { sendAgentMessage } from '@/lib/services/agentverse';

const result = await sendAgentMessage({
  from: 'agent1q...',
  to: 'agent1q...',
  protocol: 'asi-chat',
  payload: {
    text: 'Hello!',
  },
});
```

#### `isAgentverseConfigured()`
Check if Agentverse is properly configured.

```typescript
import { isAgentverseConfigured } from '@/lib/services/agentverse';

if (isAgentverseConfigured()) {
  // Agentverse features are available
}
```

## Components Reference

### `<AgentverseSettings />`

Component for managing Agentverse registration and settings.

**Props**:
```typescript
{
  organizationId: string;
  agentName: string;
}
```

**Usage**:
```tsx
import AgentverseSettings from '@/components/agent/AgentverseSettings';

<AgentverseSettings
  organizationId="org_123"
  agentName="My Agent"
/>
```

### `<AgentDiscovery />`

Component for discovering other agents on Agentverse.

**Props**:
```typescript
{
  organizationId: string;
  onSelectAgent?: (agent: DiscoveredAgent) => void;
}
```

**Usage**:
```tsx
import AgentDiscovery from '@/components/agent/AgentDiscovery';

<AgentDiscovery
  organizationId="org_123"
  onSelectAgent={(agent) => console.log('Selected:', agent)}
/>
```

### `<AgentMessaging />`

Component for sending messages to other agents.

**Props**:
```typescript
{
  organizationId: string;
  recipientAddress?: string;
  recipientName?: string;
}
```

**Usage**:
```tsx
import AgentMessaging from '@/components/agent/AgentMessaging';

<AgentMessaging
  organizationId="org_123"
  recipientAddress="agent1q..."
  recipientName="Governance Agent"
/>
```

### `<AgentversePanel />`

All-in-one component with tabs for Settings, Discovery, and Messaging.

**Props**:
```typescript
{
  organizationId: string;
  agentName: string;
}
```

**Usage**:
```tsx
import AgentversePanel from '@/components/agent/AgentversePanel';

<AgentversePanel
  organizationId="org_123"
  agentName="My Agent"
/>
```

## Data Model

The Agent model has been extended with Agentverse fields:

```typescript
{
  // ... existing fields ...
  agentverse: {
    registered: boolean;        // Whether registered on Agentverse
    address: string;            // Agentverse agent address
    apiKey: string;             // Agent's API key
    discoverable: boolean;      // Discoverable in search
    protocols: string[];        // Supported protocols
    webhookUrl: string;         // Webhook URL
    lastSynced: Date;           // Last sync timestamp
    metadata: {                 // Additional metadata
      domain: string;
      created: string;
      running: boolean;
      interactions: number;
    };
  };
}
```

## Troubleshooting

### Agent Registration Fails

**Problem**: Registration returns an error

**Solutions**:
1. Check that `AGENTVERSE_API_KEY` is set correctly
2. Verify your API key is valid at https://agentverse.ai
3. Check the error message for specific issues
4. Ensure your agent is created via AgentCommons first

### Webhooks Not Working

**Problem**: Agent doesn't receive messages from other agents

**Solutions**:
1. Verify `NEXT_PUBLIC_BASE_URL` is set to your public domain
2. Ensure your domain is accessible from the internet (not localhost)
3. Check that your webhook endpoint is not blocked by firewall
4. Test the webhook endpoint manually: `GET /api/agent/[organizationId]/agentverse/webhook`

### Discovery Returns No Results

**Problem**: Agent search returns empty results

**Solutions**:
1. Try searching without filters first
2. Check that Agentverse has agents matching your criteria
3. Verify `AGENTVERSE_API_KEY` is set correctly
4. Try searching with `runningOnly: false`

### Messages Not Sending

**Problem**: sendAgentMessage fails

**Solutions**:
1. Verify recipient address format (should start with `agent1`)
2. Check that your agent is registered on Agentverse
3. Ensure recipient agent exists and is running
4. Check network connectivity to Agentverse

## Best Practices

### 1. Agent Description

Write clear, concise descriptions of what your agent does:

```typescript
description: "Helps DAO members analyze proposals, track voting history, and understand governance mechanisms."
```

### 2. Agent Persona

Include relevant context in your agent's persona to help other agents understand its purpose:

```typescript
persona: "I am a governance specialist agent for [DAO Name]. I help members make informed decisions about proposals and track on-chain governance activity."
```

### 3. Webhook Security

Consider implementing webhook signature verification in production to ensure messages are from Agentverse.

### 4. Message Payload

Keep message payloads simple and structured:

```typescript
payload: {
  text: "Your message here",
  context: {
    // Optional contextual information
  }
}
```

### 5. Error Handling

Always handle errors gracefully when interacting with Agentverse:

```typescript
try {
  const result = await sendAgentMessage(message);
  if (!result.success) {
    console.error('Message failed:', result.error);
  }
} catch (error) {
  console.error('Agentverse error:', error);
}
```

## Support

For issues with:
- **Common Lobbyist integration**: Open an issue on GitHub
- **Agentverse platform**: Visit https://docs.agentverse.ai or contact Agentverse support
- **Agent protocols**: Refer to ASI protocol documentation

## Resources

- [Agentverse Documentation](https://docs.agentverse.ai)
- [Agentverse API Reference](https://docs.agentverse.ai/api-reference)
- [Fetch.ai Innovation Lab](https://innovationlab.fetch.ai)
- [ASI Chat Protocol](https://docs.agentverse.ai/protocols/asi-chat)

## License

This integration is part of Common Lobbyist and follows the same license terms.
