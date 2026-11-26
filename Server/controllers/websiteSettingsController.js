import mongoose from "mongoose";
import WebsiteSettings from "../models/WebsiteSettings.js";
import { createActivityLog } from "./activityLogController.js";

const allowedFields = [
  "siteName",
  "tagline",
  "logo",
  "favicon",
  "contactEmail",
  "contactPhone",
  "location",
  "copyrightText",
  "primaryColor",
  "secondaryColor",
  "maintenanceMode",
  "maintenanceMessage",
  "isWebsiteEnabled",
  "allowContactMessages",
  "allowNewsletterSubscriptions",
  "showPreloader",
  "enableAnalytics",
  "timezone",
];

const booleanFields = [
  "maintenanceMode",
  "isWebsiteEnabled",
  "allowContactMessages",
  "allowNewsletterSubscriptions",
  "showPreloader",
  "enableAnalytics",
];

const urlFields = ["logo", "favicon"];

const isValidUrl = (value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const validateSettings = (data) => {
  for (const field of booleanFields) {
    if (data[field] !== undefined && typeof data[field] !== "boolean") {
      return `${field} must be a boolean value.`;
    }
  }

  for (const field of urlFields) {
    if (
      data[field] !== undefined &&
      (typeof data[field] !== "string" || !isValidUrl(data[field]))
    ) {
      return `${field} must be a valid HTTP or HTTPS URL.`;
    }
  }

  if (
    data.contactEmail !== undefined &&
    data.contactEmail !== "" &&
    (typeof data.contactEmail !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail))
  ) {
    return "Please provide a valid contact email.";
  }

  for (const field of ["primaryColor", "secondaryColor"]) {
    if (
      data[field] !== undefined &&
      (typeof data[field] !== "string" ||
        !/^#[0-9A-Fa-f]{6}$/.test(data[field]))
    ) {
      return `${field} must be a valid HEX color.`;
    }
  }

  return null;
};

// Get Public Website Settings
export const getPublicWebsiteSettings = async (req, res) => {
  try {
    const settings = await WebsiteSettings.findOne().select(
      "-contactPhone -maintenanceMessage",
    );

    if (!settings) {
      return res.status(200).json({
        success: true,
        settings: null,
      });
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get Public Settings Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch website settings.",
    });
  }
};

// Get All Settings (Admin)
export const getAdminWebsiteSettings = async (req, res) => {
  try {
    const settings = await WebsiteSettings.findOne();

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get Admin Settings Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch website settings.",
    });
  }
};

// Create Website Settings
export const createWebsiteSettings = async (req, res) => {
  try {
    const existingSettings = await WebsiteSettings.findOne();

    if (existingSettings) {
      return res.status(409).json({
        success: false,
        message: "Website settings already exist. Please update them.",
      });
    }

    const settingsData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        settingsData[field] = req.body[field];
      }
    }

    if (
      settingsData.siteName !== undefined &&
      (typeof settingsData.siteName !== "string" ||
        !settingsData.siteName.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Site name cannot be empty.",
      });
    }

    const validationError = validateSettings(settingsData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const settings = await WebsiteSettings.create(settingsData);

    await createActivityLog({
      admin: req.admin,
      action: "CREATE",
      module: "settings",
      description: "Created website settings.",
      targetId: settings._id.toString(),
      targetName: settings.siteName || "Website Settings",
      req,
    });

    return res.status(201).json({
      success: true,
      message: "Website settings created successfully.",
      settings,
    });
  } catch (error) {
    console.error("Create Website Settings Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create website settings.",
    });
  }
};

// Update Website Settings
export const updateWebsiteSettings = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid settings ID.",
      });
    }

    const settings = await WebsiteSettings.findById(id);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Website settings not found.",
      });
    }

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.siteName !== undefined &&
      (typeof updates.siteName !== "string" || !updates.siteName.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Site name cannot be empty.",
      });
    }

    if (
      updates.maintenanceMessage !== undefined &&
      typeof updates.maintenanceMessage !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Maintenance message must be a string.",
      });
    }

    const validationError = validateSettings(updates);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    Object.assign(settings, updates);

    await settings.save();

    await createActivityLog({
      admin: req.admin,
      action: "UPDATE",
      module: "settings",
      description: "Updated website settings.",
      targetId: settings._id.toString(),
      targetName: settings.siteName || "Website Settings",
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Website settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error("Update Website Settings Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update website settings.",
    });
  }
};
