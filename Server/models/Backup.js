import mongoose from "mongoose";

const backupSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    type: {
      type: String,
      enum: ["full", "projects", "contacts", "newsletter", "custom"],
      required: true,
    },

    format: {
      type: String,
      enum: ["json", "csv", "mongodb"],
      default: "json",
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },

    fileSize: {
      type: Number,
      default: 0,
      min: 0,
    },

    recordCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    errorMessage: {
      type: String,
      default: "",
      maxlength: 500,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

backupSchema.index({ admin: 1, createdAt: -1 });
backupSchema.index({ status: 1, createdAt: -1 });

const Backup = mongoose.model("Backup", backupSchema);

export default Backup;
