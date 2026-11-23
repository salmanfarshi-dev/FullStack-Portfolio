import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    adminName: {
      type: String,
      default: "System",
      trim: true,
      maxlength: 100,
    },

    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    module: {
      type: String,
      required: true,
      enum: [
        "auth",
        "projects",
        "skills",
        "about",
        "hero",
        "contact",
        "newsletter",
        "journeys",
        "socials",
        "resume",
        "seo",
        "settings",
        "analytics",
        "notifications",
        "system",
      ],
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    targetId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    targetName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    ipAddress: {
      type: String,
      default: "",
      maxlength: 100,
    },

    userAgent: {
      type: String,
      default: "",
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["success", "failed", "warning"],
      default: "success",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

activityLogSchema.index({ admin: 1, createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
