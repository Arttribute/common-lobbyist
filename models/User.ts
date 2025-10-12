// models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    wallets: { type: [String], required: true, unique: true },
    handles: {
      farcaster: { type: String, unique: true, sparse: true },
      discord: { type: String, unique: true, sparse: true },
    },
    sybilScore: {
      source: { type: String },
      score: { type: Number, min: 0, max: 1 },
      lastUpdated: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
