// models/ChatSession.ts
import mongoose from "mongoose";

const ChatSessionSchema = new mongoose.Schema(
  {
    // AgentCommons session ID (used for continuity with AgentCommons API)
    sessionId: { type: String, required: true, unique: true },

    // Reference to the organization this session belongs to
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    // Reference to the agent used in this session
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },

    // User information (wallet address or Privy user ID)
    userId: { type: String, required: true },
    owner: { type: String, required: true }, // Wallet address

    // Session metadata
    title: { type: String, default: "New Chat" }, // Display name for session

    // Activity tracking
    lastMessageAt: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 },

    // Status
    archived: { type: Boolean, default: false },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Indexes for efficient queries
ChatSessionSchema.index({ organizationId: 1, userId: 1 }); // Get user's sessions for an org
ChatSessionSchema.index({ sessionId: 1 }, { unique: true }); // Lookup by sessionId
ChatSessionSchema.index({ owner: 1, archived: 1 }); // Get user's active sessions
ChatSessionSchema.index({ lastMessageAt: -1 }); // Sort by most recent

export default mongoose.models.ChatSession ||
  mongoose.model("ChatSession", ChatSessionSchema);
