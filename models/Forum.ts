// models/Forum.ts
import mongoose from "mongoose";

const ForumSchema = new mongoose.Schema({
  daoId: { type: mongoose.Schema.Types.ObjectId, ref: "Dao", required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
});

export default mongoose.models.Forum || mongoose.model("Forum", ForumSchema);
