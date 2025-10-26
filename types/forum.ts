// types/forum.ts

export interface ForumPost {
  _id: string;
  type: "post" | "comment" | "poll";
  content: {
    title?: string;
    text?: string;
    poll?: {
      options: Array<{ id: string; label: string }>;
      closesAt?: Date;
    };
  };
  authorId: string;
  createdAt: string;
  counters?: {
    replies: number;
    placedRaw: string;
    qWeight: string;
  };
  onchain?: {
    totalRaw: string;
    totalQuadWeight: string;
  };
  userSignals?: Array<{
    userId: string;
    amount: string;
  }>;
  depth?: number;
  daoId?: string;
  rootId?: string;
  parentId?: string;
}

export interface Forum {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  daoId: string;
}

export interface Organization {
  _id: string;
  name: string;
  description?: string;
  tokenName: string;
  tokenSymbol: string;
  initialSupply: string;
  creatorAddress: string;
  onchain?: {
    chainId?: number;
    factory?: string;
    registry?: string;
    token?: string;
    deployedAt?: Date;
    txHash?: string;
    totalRaw?: string;
    totalQuadWeight?: string;
  };
  agent?: {
    agentId: string;
    enabled: boolean;
    persona: string;
    instructions: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
    createdAt: Date;
  } | null;
}
