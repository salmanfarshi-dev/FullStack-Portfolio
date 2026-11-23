import mongoose from "mongoose";
import About from "../models/About.js";

// Get About Information (Public)
export const getPublicAbout = async (req, res) => {
  try {
    const about = await About.findOne({ isVisible: true });

    return res.status(200).json({
      success: true,
      about,
    });
  } catch (error) {
    console.error("Get Public About Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch about information.",
    });
  }
};

// Get About Information (Admin)
export const getAdminAbout = async (req, res) => {
  try {
    const about = await About.findOne();

    return res.status(200).json({
      success: true,
      about,
    });
  } catch (error) {
    console.error("Get Admin About Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch about information.",
    });
  }
};

// Create About Information (Admin)
export const createAbout = async (req, res) => {
  try {
    const existingAbout = await About.findOne();

    if (existingAbout) {
      return res.status(409).json({
        success: false,
        message: "About information already exists. Please update it instead.",
      });
    }

    const { description } = req.body;

    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "About description is required.",
      });
    }

    const allowedFields = [
      "heading",
      "subtitle",
      "description",
      "profileImage",
      "location",
      "experience",
      "resumeUrl",
      "isVisible",
    ];

    const aboutData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        aboutData[field] = req.body[field];
      }
    }

    const about = await About.create(aboutData);

    return res.status(201).json({
      success: true,
      message: "About information created successfully.",
      about,
    });
  } catch (error) {
    console.error("Create About Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create about information.",
    });
  }
};

// Update About Information (Admin)
export const updateAbout = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid About ID.",
      });
    }

    const about = await About.findById(id);

    if (!about) {
      return res.status(404).json({
        success: false,
        message: "About information not found.",
      });
    }

    const allowedFields = [
      "heading",
      "subtitle",
      "description",
      "profileImage",
      "location",
      "experience",
      "resumeUrl",
      "isVisible",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.description !== undefined &&
      (typeof updates.description !== "string" || !updates.description.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "About description cannot be empty.",
      });
    }

    if (
      updates.heading !== undefined &&
      (typeof updates.heading !== "string" || !updates.heading.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Heading cannot be empty.",
      });
    }

    Object.assign(about, updates);

    await about.save();

    return res.status(200).json({
      success: true,
      message: "About information updated successfully.",
      about,
    });
  } catch (error) {
    console.error("Update About Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update about information.",
    });
  }
};
