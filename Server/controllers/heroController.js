import mongoose from "mongoose";
import Hero from "../models/Hero.js";

const allowedFields = [
  "greeting",
  "name",
  "role",
  "headline",
  "description",
  "profileImage",
  "availability",
  "isAvailable",
  "primaryButton",
  "secondaryButton",
  "isVisible",
];

// Get Hero Information (Public)
export const getPublicHero = async (req, res) => {
  try {
    const hero = await Hero.findOne({ isVisible: true });

    return res.status(200).json({
      success: true,
      hero,
    });
  } catch (error) {
    console.error("Get Public Hero Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hero information.",
    });
  }
};

// Get Hero Information (Admin)
export const getAdminHero = async (req, res) => {
  try {
    const hero = await Hero.findOne();

    return res.status(200).json({
      success: true,
      hero,
    });
  } catch (error) {
    console.error("Get Admin Hero Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hero information.",
    });
  }
};

// Create Hero Information (Admin)
export const createHero = async (req, res) => {
  try {
    const existingHero = await Hero.findOne();

    if (existingHero) {
      return res.status(409).json({
        success: false,
        message: "Hero information already exists. Please update it instead.",
      });
    }

    const { headline, description } = req.body;

    if (
      typeof headline !== "string" ||
      !headline.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Headline and description are required.",
      });
    }

    const heroData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        heroData[field] = req.body[field];
      }
    }

    const hero = await Hero.create(heroData);

    return res.status(201).json({
      success: true,
      message: "Hero information created successfully.",
      hero,
    });
  } catch (error) {
    console.error("Create Hero Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create hero information.",
    });
  }
};

// Update Hero Information (Admin)
export const updateHero = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Hero ID.",
      });
    }

    const hero = await Hero.findById(id);

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "Hero information not found.",
      });
    }

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.headline !== undefined &&
      (typeof updates.headline !== "string" || !updates.headline.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Headline cannot be empty.",
      });
    }

    if (
      updates.description !== undefined &&
      (typeof updates.description !== "string" || !updates.description.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Description cannot be empty.",
      });
    }

    if (
      updates.name !== undefined &&
      (typeof updates.name !== "string" || !updates.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty.",
      });
    }

    for (const field of ["primaryButton", "secondaryButton"]) {
      if (updates[field] !== undefined) {
        if (
          typeof updates[field] !== "object" ||
          updates[field] === null ||
          Array.isArray(updates[field])
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field} data.`,
          });
        }

        const allowedButtonFields = ["text", "link"];
        const buttonData = {};

        for (const key of allowedButtonFields) {
          if (updates[field][key] !== undefined) {
            buttonData[key] = updates[field][key];
          }
        }

        updates[field] = {
          ...hero[field].toObject(),
          ...buttonData,
        };
      }
    }

    Object.assign(hero, updates);

    await hero.save();

    return res.status(200).json({
      success: true,
      message: "Hero information updated successfully.",
      hero,
    });
  } catch (error) {
    console.error("Update Hero Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update hero information.",
    });
  }
};
