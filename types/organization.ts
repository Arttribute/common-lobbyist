/**
 * TypeScript type definitions for Organization and Agent
 */

export interface AgentConfig {
  agentId?: string;
  enabled: boolean;
  persona?: string;
  instructions?: string;
  sessionId?: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  createdAt?: Date;
}

export interface OnchainConfig {
  chainId: number;
  factory: string;
  registry: string;
  token: string;
  deployedAt?: Date;
  txHash?: string;
}

export interface OrganizationSettings {
  qvEnabled: boolean;
  minSybilScore: number;
  decay: {
    halfLifeDays: number;
  };
}

export interface Organization {
  _id: string;
  name: string;
  description?: string;
  tokenName: string;
  tokenSymbol: string;
  initialSupply: string;
  onchain: OnchainConfig;
  settings: OrganizationSettings;
  creatorAddress: string;
  agent?: AgentConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationDTO {
  name: string;
  description?: string;
  tokenName: string;
  tokenSymbol: string;
  initialSupply: string;
  creatorAddress: string;
  agent?: Partial<AgentConfig>;
}

export interface UpdateAgentDTO {
  persona?: string;
  instructions?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  enabled?: boolean;
}
