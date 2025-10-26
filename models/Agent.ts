// models/Agent.ts
import mongoose from "mongoose";

const AgentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    // AgentCommons integration
    agentId: { type: String }, // AgentCommons agent ID
    enabled: { type: Boolean, default: true }, // Whether agent is active

    // Agentverse integration
    agentverse: {
      registered: { type: Boolean, default: false }, // Whether agent is registered on Agentverse
      address: { type: String }, // Agentverse agent address (e.g., agent1q...)
      apiKey: { type: String }, // Agentverse API key for this agent
      discoverable: { type: Boolean, default: true }, // Whether agent is discoverable on Agentverse
      protocols: [{ type: String }], // Supported protocols (e.g., ['asi-chat'])
      webhookUrl: { type: String }, // Webhook URL for receiving messages
      lastSynced: { type: Date }, // Last sync with Agentverse
      metadata: { type: mongoose.Schema.Types.Mixed }, // Additional Agentverse metadata
    },

    // Agent configuration
    persona: { type: String }, // Agent persona/character
    instructions: { type: String }, // Custom instructions for agent
    sessionId: { type: String }, // Main agent session ID

    // AI parameters
    temperature: { type: Number, min: 0, max: 2, default: 0.7 },
    maxTokens: { type: Number, default: 2000 },
    topP: { type: Number, min: 0, max: 1, default: 1 },
    presencePenalty: { type: Number, min: -2, max: 2, default: 0 },
    frequencyPenalty: { type: Number, min: -2, max: 2, default: 0 },

    // Metadata
    createdBy: { type: String, required: true }, // Wallet address of creator
    isDefault: { type: Boolean, default: false }, // Whether this is the default agent for the organization
  },
  { timestamps: true }
);

// Index for efficient queries
AgentSchema.index({ organizationId: 1 });
AgentSchema.index({ agentId: 1 }, { unique: true, sparse: true });
AgentSchema.index({ "agentverse.address": 1 }, { unique: true, sparse: true });

export default mongoose.models.Agent || mongoose.model("Agent", AgentSchema);
