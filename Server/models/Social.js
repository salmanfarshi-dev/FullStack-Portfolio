import mongoose from "mongoose";

const socialSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, "Social platform is required"],
      trim: true,
      maxlength: 50,
    },

    username: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    url: {
      type: String,
      required: [true, "Social profile URL is required"],
      trim: true,
      maxlength: 500,
    },

    icon: {
      type: String,
      required: [true, "Social icon is required"],
      trim: true,
    },

    color: {
      type: String,
      default: "#AAB3C7",
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
  },
);

socialSchema.index({
  isVisible: 1,
  displayOrder: 1,
});

const Social = mongoose.model("Social", socialSchema);

export default Social;
