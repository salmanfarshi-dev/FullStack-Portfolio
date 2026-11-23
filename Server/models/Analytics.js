import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ["page_view", "project_click", "resume_download", "contact_submit"],
    },

    sessionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    page: {
      type: String,
      default: "/",
      trim: true,
      maxlength: 500,
    },

    referrer: {
      type: String,
      default: "direct",
      trim: true,
      maxlength: 500,
    },

    source: {
      type: String,
      enum: ["direct", "search", "social", "referral", "other"],
      default: "direct",
    },

    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
    },

    browser: {
      type: String,
      default: "unknown",
      maxlength: 50,
    },

    country: {
      type: String,
      default: "unknown",
      maxlength: 100,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    projectTitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },
  },
  {
    timestamps: true,
  },
);

analyticsSchema.index({ eventType: 1, createdAt: -1 });
analyticsSchema.index({ sessionId: 1, createdAt: -1 });
analyticsSchema.index({ source: 1, createdAt: -1 });
analyticsSchema.index({ device: 1, createdAt: -1 });

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
