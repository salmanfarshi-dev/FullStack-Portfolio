import mongoose from "mongoose";
import Social from "../models/Social.js";
import { createActivityLog } from "./activityLogController.js";

const allowedFields = [
  "platform",
  "username",
  "url",
  "icon",
  "color",
  "isVisible",
  "displayOrder",
];

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

// Get Public Social Links
export const getPublicSocials = async (req, res) => {
  try {
    const socials = await Social.find({ isVisible: true }).sort({
      displayOrder: 1,
    });

    return res.status(200).json({
      success: true,
      total: socials.length,
      socials,
    });
  } catch (error) {
    console.error("Get Public Socials Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch social links.",
    });
  }
};

// Get All Social Links (Admin)
export const getAllSocials = async (req, res) => {
  try {
    const socials = await Social.find().sort({
      displayOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: socials.length,
      socials,
    });
  } catch (error) {
    console.error("Get All Socials Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch social links.",
    });
  }
};

// Create Social Link
export const createSocial = async (req, res) => {
  try {
    const { platform, url, icon } = req.body;

    if (
      typeof platform !== "string" ||
      !platform.trim() ||
      typeof url !== "string" ||
      !url.trim() ||
      typeof icon !== "string" ||
      !icon.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Platform, URL and icon are required.",
      });
    }

    if (!isValidUrl(url.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid HTTP or HTTPS URL.",
      });
    }

    const socialData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        socialData[field] = req.body[field];
      }
    }

    const social = await Social.create(socialData);
    await createActivityLog({ admin: req.admin, action: "social_created", module: "socials", description: `Created social link "${social.platform}".`, targetId: social._id.toString(), targetName: social.platform, req });

    return res.status(201).json({
      success: true,
      message: "Social link created successfully.",
      social,
    });
  } catch (error) {
    console.error("Create Social Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create social link.",
    });
  }
};

// Update Social Link
export const updateSocial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid social link ID.",
      });
    }

    const social = await Social.findById(id);

    if (!social) {
      return res.status(404).json({
        success: false,
        message: "Social link not found.",
      });
    }

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.platform !== undefined &&
      (typeof updates.platform !== "string" || !updates.platform.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Platform cannot be empty.",
      });
    }

    if (
      updates.icon !== undefined &&
      (typeof updates.icon !== "string" || !updates.icon.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Icon cannot be empty.",
      });
    }

    if (updates.url !== undefined) {
      if (typeof updates.url !== "string" || !isValidUrl(updates.url.trim())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid HTTP or HTTPS URL.",
        });
      }
    }

    Object.assign(social, updates);

    await social.save();
    await createActivityLog({ admin: req.admin, action: "social_updated", module: "socials", description: `Updated social link "${social.platform}".`, targetId: social._id.toString(), targetName: social.platform, req });

    return res.status(200).json({
      success: true,
      message: "Social link updated successfully.",
      social,
    });
  } catch (error) {
    console.error("Update Social Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update social link.",
    });
  }
};

// Delete Social Link
export const deleteSocial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid social link ID.",
      });
    }

    const social = await Social.findByIdAndDelete(id);

    if (!social) {
      return res.status(404).json({
        success: false,
        message: "Social link not found.",
      });
    }

    await createActivityLog({ admin: req.admin, action: "social_deleted", module: "socials", description: `Deleted social link "${social.platform}".`, targetId: social._id.toString(), targetName: social.platform, req });

    return res.status(200).json({
      success: true,
      message: "Social link deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Social Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete social link.",
    });
  }
};
