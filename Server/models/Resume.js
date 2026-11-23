import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Resume title is required"],
      trim: true,
      maxlength: 150,
      default: "My Professional Resume",
    },

    fileUrl: {
      type: String,
      required: [true, "Resume file URL is required"],
      trim: true,
      maxlength: 1000,
    },

    publicId: {
      type: String,
      default: "",
      trim: true,
    },

    fileName: {
      type: String,
      default: "Salman-Farshi-CV.pdf",
      trim: true,
      maxlength: 255,
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    fileFormat: {
      type: String,
      default: "pdf",
      lowercase: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Only one active resume record
resumeSchema.index({ isVisible: 1 });

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
