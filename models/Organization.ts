// models/Organization.ts
import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    onchain: {
      chainId: { type: Number, required: true },
      factory: { type: String, required: true },
      registry: { type: String, required: true },
      token: { type: String, required: true },
    },
    settings: {
      qvEnabled: { type: Boolean, default: false },
      minSybilScore: { type: Number, min: 0, max: 1, default: 0 },
      decay: {
        halfLifeDays: { type: Number, min: 1, default: 90 },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Organization ||
  mongoose.model("Organization", OrganizationSchema);
