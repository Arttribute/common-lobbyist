// models/Organization.ts
import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    // Token details for on-chain deployment
    tokenName: { type: String, required: true },
    tokenSymbol: { type: String, required: true },
    initialSupply: { type: String, required: true }, // Store as string to handle large numbers

    onchain: {
      chainId: { type: Number, required: true },
      factory: { type: String, required: true }, // DAOFactory address
      registry: { type: String, required: true }, // SignalRegistry address (deployed per DAO)
      token: { type: String, required: true }, // GovernanceToken address (deployed per DAO)
      deployedAt: { type: Date }, // Timestamp when contracts were deployed
      txHash: { type: String }, // Transaction hash of deployment
    },

    settings: {
      qvEnabled: { type: Boolean, default: true }, // Quadratic voting enabled by default
      minSybilScore: { type: Number, min: 0, max: 1, default: 0 },
      decay: {
        halfLifeDays: { type: Number, min: 1, default: 90 },
      },
    },

    // Creator wallet address
    creatorAddress: { type: String, required: true },

    // Agent configuration
    agent: {
      agentId: { type: String }, // AgentCommons agent ID
      enabled: { type: Boolean, default: true }, // Whether agent is active
      persona: { type: String }, // Agent persona/character
      instructions: { type: String }, // Custom instructions for agent
      sessionId: { type: String }, // Main agent session ID
      temperature: { type: Number, min: 0, max: 2, default: 0.7 },
      maxTokens: { type: Number, default: 2000 },
      topP: { type: Number, min: 0, max: 1, default: 1 },
      presencePenalty: { type: Number, min: -2, max: 2, default: 0 },
      frequencyPenalty: { type: Number, min: -2, max: 2, default: 0 },
      createdAt: { type: Date }, // When agent was created
    },
  },
  { timestamps: true }
);

export default mongoose.models.Organization ||
  mongoose.model("Organization", OrganizationSchema);
