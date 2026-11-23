import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150,
    },

    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },

    source: {
      type: String,
      default: "portfolio",
      trim: true,
    },

    subscribedAt: {
      type: Date,
      default: Date.now,
    },

    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

newsletterSchema.index({ status: 1, createdAt: -1 });

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

export default Newsletter;
