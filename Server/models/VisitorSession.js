import mongoose from "mongoose";

const visitorSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    currentPage: { type: String, default: "/" },
    device: { type: String, default: "unknown", enum: ["desktop", "mobile", "tablet", "unknown"] },
    browser: { type: String, default: "unknown", maxlength: 50 },
    lastSeen: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

visitorSessionSchema.index({ lastSeen: 1 });
visitorSessionSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 86400 });

const VisitorSession = mongoose.model("VisitorSession", visitorSessionSchema);

export default VisitorSession;
