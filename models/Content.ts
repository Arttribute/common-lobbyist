import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["post", "comment", "poll"], required: true },

    daoId: { type: String, required: true },
    forumId: { type: String, required: true },

    rootId: { type: String, required: true },
    parentId: { type: String, default: null },

    path: { type: String, required: true }, // e.g., "cnt_root/cnt_child"
    depth: { type: Number, min: 0, required: true },

    authorId: { type: String, required: true },
    status: {
      type: String,
      enum: ["published", "draft", "deleted", "hidden"],
      default: "published",
    },

    content: {
      title: { type: String }, // required if type === "post"
      text: { type: String }, // required for post/comment; optional for poll intro
      poll: {
        options: [{ id: String, label: String }],
        closesAt: { type: Date },
      },
    },

    ipfs: {
      cid: { type: String }, // fill after upload
      pinned: { type: Boolean, default: false },
    },
    revisions: [{ cid: String, createdAt: Date }],

    // On-chain signal data - synced when tokens are placed
    onchain: {
      synced: { type: Boolean, default: false }, // Whether this content has been signaled on-chain
      lastSyncedAt: { type: Date }, // Last time on-chain data was synced
      totalRaw: { type: String, default: "0" }, // Total tokens placed (as string for BigInt)
      totalQuadWeight: { type: String, default: "0" }, // Quadratic weighted total
      supporters: { type: Number, default: 0 }, // Number of unique supporters
    },

    // Individual user signals - tracks how much each user has placed
    userSignals: [
      {
        userId: { type: String, required: true }, // wallet address or user ID
        amount: { type: String, required: true }, // amount of tokens placed (as string for BigInt)
        txHash: { type: String }, // transaction hash of the signal placement on Blockscout
        placedAt: { type: Date, default: () => new Date() },
        lastUpdatedAt: { type: Date, default: () => new Date() },
      },
    ],

    embeddings: {
      model: { type: String },
      vector: { type: [Number], index: "2dsphere" }, // Atlas will override to vector index
    },

    counters: {
      replies: { type: Number, default: 0 },
      placedRaw: { type: String, default: "0" }, // Deprecated: use onchain.totalRaw
      qWeight: { type: String, default: "0" }, // Deprecated: use onchain.totalQuadWeight
    },

    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
    lastActivityAt: { type: Date, default: () => new Date() },

    moderation: {
      flags: { type: Number, default: 0 },
      reason: { type: String },
    },

    links: [{ rel: String, href: String }],
  },
  { versionKey: false }
);

ContentSchema.pre("validate", function (next) {
  if (this.type === "post") {
    if (!this.content?.title)
      return next(new Error("Post requires content.title"));
    if (this.depth !== 0 || this.parentId !== null)
      return next(new Error("Post must be depth=0 with parentId=null"));
    if (this.rootId !== this._id?.toString())
      return next(new Error("Post rootId must equal its own _id"));
  }
  if (this.type === "comment") {
    if (!this.parentId) return next(new Error("Comment requires parentId"));
  }
  if (this.type === "poll") {
    if (!this.content?.poll?.options?.length)
      return next(new Error("Poll requires options"));
  }
  next();
});

export default mongoose.models.Content ||
  mongoose.model("Content", ContentSchema);
