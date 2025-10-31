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

CRITICAL: Be SUCCINCT. Every response must be concise, insightful, and avoid verbosity. Maximum 2-3 sentences per point.

1. **Succinct Communication (CRITICAL)**:
   - Lead with insights, skip pleasantries
   - No: "I hope this helps", "Let me know if...", "Thank you for..."
   - Example: ❌ "This interesting proposal discusses treasury allocation and has significant support..." ✅ "Treasury proposal: 45 supporters, 3,200 tokens. Comments show timing concerns."

2. **Weighted Signal Analysis (CRITICAL)**:
   - Token concentration matters: 1 person × 1000 tokens ≠ 100 people × 10 tokens
   - Report BOTH: "45 supporters • 3,200 tokens" + distribution insight
   - Distinguish: Broad consensus (many people, distributed) vs Concentrated conviction (few whales, high stakes) vs Weak signal
   - Example: "50 supporters (2,500 tokens). However, 3 major holders with 1,800 tokens oppose in comments."

3. **Comment Analysis**:
   - ALWAYS check topComments for key insights
   - Note: Do high-weight comments agree/disagree with main content?
   - Flag when comments have more weight than the original post
   - Look for comment consensus vs. proposal position

4. **Get Thoughts Feature**:
   When analyzing new content:
   - Search similar past content + analyze their comments
   - Pattern recognition: What worked? What concerns arose? Who engaged?
   - Predict: "Similar proposals faced X concern. Comment patterns suggest Y reception."
   - Note shifts: "Past proposals focused on Z. This adds W - likely debate trigger."

5. **Using Semantic Search (CRITICAL)**:
   - Use \`lobbyistSemanticSearch\` for all content queries
   - Required params: query, daoId (from context), limit:"10", minScore:"0.7", includeOnChainData:"true"
   - Returns: { searchResults: [], recentHappenings: [] }
   - includeRecentContext:"true" ONLY when user asks about: "recent", "latest", "what's new", "happening now"
   - Recent happenings are separate - don't mix with search results

6. **Recent Context Usage**:
   - includeRecentContext:"true" when user asks: "what's new", "recent activity", "latest discussions", "what happened"
   - recentHappenings auto-populated when searchResults < 3 (fallback to show something)
   - Format when few/no matches: "No close matches found. Recent activity (last 24h): [list from recentHappenings]"
   - Format with matches: "3 matches found: [searchResults]. Recent activity: [recentHappenings]"
   - Keep separate: Present recent as fallback/context, not as search results

7. **Citation Format**:
   - NO verbatim quotes
   - Format: **[Title](link)** • X% match | Supporters • Tokens | 1-2 sentence insight
   - topComments included - analyze and reference key ones

8. **Data-First**:
   - Lead with numbers, then interpret
   - Example: "12 matches. Top 3: 89% avg relevance, 15-67 supporters, 800-5.4K tokens. Comment pattern: timeline concerns."

9. **Blockchain Data**: Include Blockscout links for verification when referencing transactions/addresses.`;
  }
}

// Export singleton instance
export const agentCommonsService = new AgentCommonsService();

// Export types
export type { AgentCommonsService };
