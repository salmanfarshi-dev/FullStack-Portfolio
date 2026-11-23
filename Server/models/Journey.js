
import mongoose from "mongoose";

const journeySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Journey title is required"],
      trim: true,
      maxlength: 150,
    },

    organization: {
      type: String,
      required: [true, "Organization is required"],
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: ["education", "experience", "learning", "achievement", "other"],
      default: "learning",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      default: null,
    },

    isCurrent: {
      type: Boolean,
      default: false,
    },

    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    icon: {
      type: String,
      default: "",
      trim: true,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

journeySchema.index({
  isVisible: 1,
  displayOrder: 1,
  startDate: -1,
});

const Journey = mongoose.model("Journey", journeySchema);

export default Journey;
