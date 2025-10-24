/**
 * AgentCommons API Service Client
 *
 * Handles all interactions with the AgentCommons API for creating,
 * managing, and running DAO agents.
 */

const AGENTCOMMONS_API_URL =
  process.env.AGENTCOMMONS_API_URL ||
  process.env.NEXT_PUBLIC_AGENTCOMMONS_API_URL ||
  "https://api.agentcommons.io";
const AGENTCOMMONS_API_VERSION = "v1";

export interface AgentCreateParams {
  name: string;
  persona: string;
  instructions: string;
  owner: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  commonsOwned?: boolean;
}

export interface AgentUpdateParams {
  name?: string;
  persona?: string;
  instructions?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentRunParams {
  agentId: string;
  messages: Message[];
  sessionId?: string;
  initiator: string;
}

export interface Agent {
  agentId: string;
  name: string;
  persona: string;
  instructions: string;
  owner: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  createdAt: string;
}

export interface AgentRunResponse {
  sessionId: string;
  response: {
    role: "assistant";
    content: string;
  };
  toolCalls?: Array<{
    name: string;
    args: any;
    result: any;
  }>;
}

class AgentCommonsService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = `${AGENTCOMMONS_API_URL}/${AGENTCOMMONS_API_VERSION}`;
    this.apiKey = process.env.AGENTCOMMONS_API_KEY;

    console.log("AgentCommonsService initialized:", {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
      rawApiUrl: AGENTCOMMONS_API_URL,
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(
        `AgentCommons API Error: ${error.message || response.statusText}`
      );
    }

    const data = await response.json();
    return data.data || data;
  }

  /**
   * Create a new agent
   */
  async createAgent(params: AgentCreateParams): Promise<Agent> {
    return this.request<Agent>("/agents", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Get an agent by ID
   */
  async getAgent(agentId: string): Promise<Agent> {
    return this.request<Agent>(`/agents/${agentId}`);
  }

  /**
   * Get all agents for an owner
   */
  async getAgentsByOwner(owner: string): Promise<Agent[]> {
    return this.request<Agent[]>(`/agents?owner=${owner}`);
  }

  /**
   * Update an agent
   */
  async updateAgent(
    agentId: string,
    params: AgentUpdateParams
  ): Promise<Agent> {
    return this.request<Agent>(`/agents/${agentId}`, {
      method: "PUT",
      body: JSON.stringify(params),
    });
  }

  /**
   * Run an agent (non-streaming)
   */
  async runAgent(params: AgentRunParams): Promise<AgentRunResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-initiator": params.initiator,
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}/agents/run`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        agentId: params.agentId,
        messages: params.messages,
        sessionId: params.sessionId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(
        `AgentCommons API Error: ${error.message || response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Run an agent with streaming responses
   */
  async *runAgentStream(params: AgentRunParams): AsyncGenerator<string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-initiator": params.initiator,
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const url = `${this.baseUrl}/agents/run/stream`;
    console.log("Calling AgentCommons stream API:", {
      url,
      agentId: params.agentId,
      hasApiKey: !!this.apiKey,
      messageCount: params.messages.length,
      sessionId: params.sessionId,
    });

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        agentId: params.agentId,
        messages: params.messages,
        sessionId: params.sessionId,
      }),
    });

    console.log("AgentCommons stream response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      console.error("AgentCommons API error:", error);
      throw new Error(
        `AgentCommons API Error: ${error.message || response.statusText} (Status: ${response.status})`
      );
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              return;
            }

            try {
              const parsed = JSON.parse(data);

              // Handle different event types
              if (parsed.type === "token") {
                yield parsed.content;
              } else if (parsed.type === "final") {
                // Final message, include full response if needed
                if (parsed.payload?.response?.content) {
                  yield parsed.payload.response.content;
                }
              }
            } catch (e) {
              // Skip invalid JSON
              console.warn("Failed to parse SSE data:", data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Get default persona for a DAO agent
   */
  getDefaultPersona(daoName: string): string {
    return `You are the autonomous advocate for ${daoName}, a decentralized autonomous organization. You represent the collective voice and will of the community, synthesizing discussions, proposals, and signals into clear, actionable insights.

Your purpose is to:
- Listen to community members and understand their perspectives
- Identify emerging consensus and important dissenting views
- Articulate the community's shared positions with clarity and nuance
- Help members understand how their contributions align with community priorities
- Maintain a living collective memory of what the community values most

You are transparent, data-driven, and committed to representing the authentic voice of the community. You adapt as the community's priorities evolve, giving weight to ideas that receive token signals while remaining open to new perspectives.`;
  }

  /**
   * Get default instructions for a DAO agent
   */
  getDefaultInstructions(daoName: string): string {
    return `As the ${daoName} community agent, follow these guidelines:

1. **Context Awareness**: Always consider the full context of ongoing discussions, including token signals placed on comments and proposals.

2. **Balanced Perspective**: Present multiple viewpoints when they exist. Highlight both majority positions and important minority perspectives.

3. **Signal-Weighted Memory**: Give more weight to ideas and perspectives that have received token signals from community members, but don't ignore unsignaled contributions that may be valuable.

4. **Clarity and Conciseness**: Communicate clearly and directly. Avoid jargon unless it's standard in the community.

5. **Helpful Guidance**: When members ask for feedback on their posts or comments:
   - Assess alignment with current community priorities
   - Suggest improvements or considerations
   - Note relevant past discussions or proposals
   - Indicate potential support or concerns from the community

6. **Neutral Facilitation**: Don't advocate for specific outcomes. Instead, help the community understand itself and make better-informed decisions.

7. **Transparency**: When referencing data or past discussions, be specific about sources and context.

8. **Respectful Engagement**: Treat all community members with respect, regardless of their token holdings or influence.

9. **Blockchain Data Access**: You have access to tools for querying on-chain data via Blockscout. Use these when relevant:
   - When asked about specific content signals or votes, use tools to show exact on-chain data
   - Include Blockscout explorer links when discussing transactions or addresses
   - Provide context about token weights and signal distribution when analyzing community sentiment
   - Show recent activity and trending content based on on-chain signals
   - Help users understand their own signal activity and influence in the DAO

Always provide Blockscout explorer links when referencing specific transactions, addresses, or on-chain activity to allow users to verify the data themselves.`;
  }
}

// Export singleton instance
export const agentCommonsService = new AgentCommonsService();

// Export types
export type { AgentCommonsService };
