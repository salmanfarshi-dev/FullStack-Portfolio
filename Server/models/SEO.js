import mongoose from "mongoose";

const seoSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: "Salman Farshi | Frontend Developer",
    },

    metaDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 320,
    },

    metaKeywords: {
      type: [String],
      default: [],
    },

    author: {
      type: String,
      default: "Salman Farshi",
      trim: true,
      maxlength: 100,
    },

    canonicalUrl: {
      type: String,
      default: "",
      trim: true,
    },

    ogTitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    ogDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 320,
    },

    ogImage: {
      type: String,
      default: "",
      trim: true,
    },

    ogType: {
      type: String,
      enum: ["website", "article", "profile"],
      default: "website",
    },

    twitterCard: {
      type: String,
      enum: ["summary", "summary_large_image"],
      default: "summary_large_image",
    },

    twitterHandle: {
      type: String,
      default: "",
      trim: true,
    },

    favicon: {
      type: String,
      default: "",
      trim: true,
    },

    robotsIndex: {
      type: Boolean,
      default: true,
    },

    robotsFollow: {
      type: Boolean,
      default: true,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const SEO = mongoose.model("SEO", seoSchema);

export default SEO;
