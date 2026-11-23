import mongoose from "mongoose";

const websiteSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: "Salman Farshi",
    },

    tagline: {
      type: String,
      default: "Building Modern Web Experiences",
      trim: true,
      maxlength: 200,
    },

    logo: {
      type: String,
      default: "",
      trim: true,
    },

    favicon: {
      type: String,
      default: "",
      trim: true,
    },

    contactEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    contactPhone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 30,
    },

    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    copyrightText: {
      type: String,
      default: "© {year} Salman Farshi. All rights reserved.",
      trim: true,
      maxlength: 200,
    },

    primaryColor: {
      type: String,
      default: "#22D3EE",
      trim: true,
    },

    secondaryColor: {
      type: String,
      default: "#8B5CF6",
      trim: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    maintenanceMessage: {
      type: String,
      default:
        "We are currently improving our website. Please check back soon.",
      trim: true,
      maxlength: 500,
    },

    isWebsiteEnabled: {
      type: Boolean,
      default: true,
    },

    allowContactMessages: {
      type: Boolean,
      default: true,
    },

    allowNewsletterSubscriptions: {
      type: Boolean,
      default: true,
    },

    showPreloader: {
      type: Boolean,
      default: true,
    },

    enableAnalytics: {
      type: Boolean,
      default: true,
    },

    timezone: {
      type: String,
      default: "Asia/Dhaka",
    },
  },
  {
    timestamps: true,
  },
);

const WebsiteSettings = mongoose.model(
  "WebsiteSettings",
  websiteSettingsSchema,
);

export default WebsiteSettings;
