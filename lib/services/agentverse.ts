/**
 * Agentverse Service
 * Handles agent registration, discovery, and multiagent communication with Agentverse
 */

// Helper functions to get env vars dynamically (not cached at module load time)
// This ensures we always read the current environment variable value
function getAgentverseApiBase(): string {
  return process.env.AGENTVERSE_API_URL || 'https://agentverse.ai/v1';
}

function getAgentverseApiKey(): string | undefined {
  return process.env.AGENTVERSE_API_KEY;
}

// Types based on Agentverse API documentation
export interface AgentverseAgent {
  name: string;
  address: string;
  domain?: string;
  running: boolean;
  compiled: boolean;
  code_digest?: string;
  wallet_address?: string;
  created: string;
  updated: string;
  avatar_url?: string;
  readme?: string;
  description?: string;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  interactions: number;
  protocols?: string[];
}

export interface AgentSearchParams {
  text?: string;
  exact_match?: boolean;
  semantic_search?: boolean;
  filters?: {
    state?: 'running' | 'stopped';
    category?: string;
    agent_type?: string;
    protocol_digest?: string;
    has_readme?: boolean;
    min_interactions?: number;
  };
  sort?: {
    by: 'relevancy' | 'created' | 'updated' | 'interactions';
    order?: 'asc' | 'desc';
  };
  offset?: number;
  limit?: number;
}

export interface AgentSearchResponse {
  agents: AgentverseAgent[];
  pagination: {
    offset: number;
    limit: number;
    num_hits: number;
    total: number;
  };
  search_id?: string;
}

export interface AgentRegistrationParams {
  name: string;
  description?: string;
  readme?: string;
  protocols?: string[];
  webhook_url?: string;
  endpoint_url?: string;
  avatar_url?: string;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  metadata?: Record<string, any>;
}

export interface AgentRegistrationResponse {
  address: string;
  name: string;
  domain?: string;
  created: string;
  api_key?: string;
}

export interface AgentMessage {
  from: string;
  to: string;
  protocol: string;
  payload: Record<string, any>;
  timestamp?: string;
}

export interface AgentMessageResponse {
  success: boolean;
  message_id?: string;
  error?: string;
}

/**
 * Search for agents on Agentverse
 */
export async function searchAgents(
  params: AgentSearchParams = {}
): Promise<AgentSearchResponse> {
  try {
    const apiKey = getAgentverseApiKey();
    const response = await fetch(`${getAgentverseApiBase()}/search/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agentverse search failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching Agentverse agents:', error);
    throw error;
  }
}

/**
 * Register an agent with Agentverse
 */
export async function registerAgent(
  params: AgentRegistrationParams
): Promise<AgentRegistrationResponse> {
  const apiKey = getAgentverseApiKey();
  if (!apiKey) {
    throw new Error('AGENTVERSE_API_KEY is not configured');
  }

  try {
    const response = await fetch(`${getAgentverseApiBase()}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent registration failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error registering agent with Agentverse:', error);
    throw error;
  }
}

/**
 * Update an existing agent on Agentverse
 */
export async function updateAgent(
  agentAddress: string,
  params: Partial<AgentRegistrationParams>
): Promise<AgentverseAgent> {
  const apiKey = getAgentverseApiKey();
  if (!apiKey) {
    throw new Error('AGENTVERSE_API_KEY is not configured');
  }

  try {
    const response = await fetch(`${getAgentverseApiBase()}/agents/${agentAddress}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent update failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating agent on Agentverse:', error);
    throw error;
  }
}

/**
 * Get agent details from Agentverse
 */
export async function getAgent(agentAddress: string): Promise<AgentverseAgent> {
  try {
    const apiKey = getAgentverseApiKey();
    const response = await fetch(`${getAgentverseApiBase()}/agents/${agentAddress}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get agent: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting agent from Agentverse:', error);
    throw error;
  }
}

/**
 * Delete an agent from Agentverse
 */
export async function deleteAgent(agentAddress: string): Promise<{ success: boolean }> {
  const apiKey = getAgentverseApiKey();
  if (!apiKey) {
    throw new Error('AGENTVERSE_API_KEY is not configured');
  }

  try {
    const response = await fetch(`${getAgentverseApiBase()}/agents/${agentAddress}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent deletion failed: ${response.status} ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting agent from Agentverse:', error);
    throw error;
  }
}

/**
 * Send a message from one agent to another via Agentverse
 */
export async function sendAgentMessage(
  message: AgentMessage
): Promise<AgentMessageResponse> {
  const apiKey = getAgentverseApiKey();
  if (!apiKey) {
    throw new Error('AGENTVERSE_API_KEY is not configured');
  }

  try {
    const response = await fetch(`${getAgentverseApiBase()}/agents/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Message sending failed: ${response.status} ${errorText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      message_id: result.message_id,
    };
  } catch (error) {
    console.error('Error sending agent message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get messages for an agent (inbox)
 */
export async function getAgentMessages(
  agentAddress: string,
  limit: number = 50
): Promise<AgentMessage[]> {
  const apiKey = getAgentverseApiKey();
  if (!apiKey) {
    throw new Error('AGENTVERSE_API_KEY is not configured');
  }

  try {
    const response = await fetch(
      `${getAgentverseApiBase()}/agents/${agentAddress}/messages?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get messages: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return result.messages || [];
  } catch (error) {
    console.error('Error getting agent messages:', error);
    throw error;
  }
}

/**
 * Generate Agentverse agent configuration for a DAO agent
 */
export function generateAgentverseConfig(params: {
  daoName: string;
  agentName: string;
  description: string;
  webhookUrl: string;
  persona?: string;
  tools?: string[];
}): AgentRegistrationParams {
  const { daoName, agentName, description, webhookUrl, persona, tools } = params;

  return {
    name: `${daoName} - ${agentName}`,
    description: description || `AI agent for ${daoName} DAO`,
    readme: generateAgentReadme({ daoName, agentName, description, persona, tools }),
    protocols: ['asi-chat'], // ASI Chat Protocol
    webhook_url: webhookUrl,
    metadata: {
      dao_name: daoName,
      agent_type: 'dao-governance',
      tools: tools || [],
      created_by: 'common-lobbyist',
    },
  };
}

/**
 * Generate a README for the agent
 */
function generateAgentReadme(params: {
  daoName: string;
  agentName: string;
  description: string;
  persona?: string;
  tools?: string[];
}): string {
  const { daoName, agentName, description, persona, tools } = params;

  return `# ${agentName}

## Description
${description}

## DAO
Part of **${daoName}** decentralized autonomous organization.

${persona ? `## Persona\n${persona}\n` : ''}

## Capabilities
This agent can assist with:
- DAO governance and proposal analysis
- Community engagement and discussions
- Content signal analysis and insights
- Token transfer tracking
- On-chain activity monitoring
${tools && tools.length > 0 ? `\n### Available Tools\n${tools.map(t => `- ${t}`).join('\n')}` : ''}

## Communication
This agent implements the ASI Chat Protocol and can communicate with other agents on Agentverse.

---
*Powered by Common Lobbyist - DAO Governance Platform*
`;
}

/**
 * Check if Agentverse is properly configured
 */
export function isAgentverseConfigured(): boolean {
  return !!getAgentverseApiKey();
}

/**
 * Validate agent address format
 */
export function isValidAgentAddress(address: string): boolean {
  // Agentverse addresses are typically in format: agent1q...
  return /^agent1[a-z0-9]{38,}$/.test(address);
}
