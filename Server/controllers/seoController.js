import mongoose from "mongoose";
import SEO from "../models/SEO.js";

const allowedFields = [
  "siteTitle",
  "metaDescription",
  "metaKeywords",
  "author",
  "canonicalUrl",
  "ogTitle",
  "ogDescription",
  "ogImage",
  "ogType",
  "twitterCard",
  "twitterHandle",
  "favicon",
  "robotsIndex",
  "robotsFollow",
  "isVisible",
];

const isValidUrl = (value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

// Get Public SEO Settings
export const getPublicSEO = async (req, res) => {
  try {
    const seo = await SEO.findOne({ isVisible: true });

    return res.status(200).json({
      success: true,
      seo,
    });
  } catch (error) {
    console.error("Get Public SEO Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch SEO settings.",
    });
  }
};

// Get SEO Settings (Admin)
export const getAdminSEO = async (req, res) => {
  try {
    const seo = await SEO.findOne();

    return res.status(200).json({
      success: true,
      seo,
    });
  } catch (error) {
    console.error("Get Admin SEO Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch SEO settings.",
    });
  }
};

// Create SEO Settings
export const createSEO = async (req, res) => {
  try {
    const { siteTitle, metaDescription } = req.body;

    if (
      typeof siteTitle !== "string" ||
      !siteTitle.trim() ||
      typeof metaDescription !== "string" ||
      !metaDescription.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Site title and meta description are required.",
      });
    }

    const existingSEO = await SEO.findOne();

    if (existingSEO) {
      return res.status(409).json({
        success: false,
        message: "SEO settings already exist. Please update them.",
      });
    }

    const seoData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        seoData[field] = req.body[field];
      }
    }

    const urlFields = ["canonicalUrl", "ogImage", "favicon"];

    for (const field of urlFields) {
      if (seoData[field] !== undefined && !isValidUrl(seoData[field])) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field} URL.`,
        });
      }
    }

    const seo = await SEO.create(seoData);

    return res.status(201).json({
      success: true,
      message: "SEO settings created successfully.",
      seo,
    });
  } catch (error) {
    console.error("Create SEO Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create SEO settings.",
    });
  }
};

// Update SEO Settings
export const updateSEO = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SEO settings ID.",
      });
    }

    const seo = await SEO.findById(id);

    if (!seo) {
      return res.status(404).json({
        success: false,
        message: "SEO settings not found.",
      });
    }

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.siteTitle !== undefined &&
      (typeof updates.siteTitle !== "string" || !updates.siteTitle.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Site title cannot be empty.",
      });
    }

    if (
      updates.metaDescription !== undefined &&
      (typeof updates.metaDescription !== "string" ||
        !updates.metaDescription.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Meta description cannot be empty.",
      });
    }

    if (updates.metaKeywords !== undefined) {
      if (
        !Array.isArray(updates.metaKeywords) ||
        !updates.metaKeywords.every(
          (keyword) => typeof keyword === "string" && keyword.trim(),
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Meta keywords must be an array of strings.",
        });
      }
    }

    const urlFields = ["canonicalUrl", "ogImage", "favicon"];

    for (const field of urlFields) {
      if (updates[field] !== undefined && !isValidUrl(updates[field])) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field} URL.`,
        });
      }
    }

    Object.assign(seo, updates);

    await seo.save();

    return res.status(200).json({
      success: true,
      message: "SEO settings updated successfully.",
      seo,
    });
  } catch (error) {
    console.error("Update SEO Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update SEO settings.",
    });
  }
};
