import mongoose from "mongoose";
import Skill from "../models/Skill.js";

const allowedCategories = ["frontend", "backend", "database", "tools", "other"];

const allowedFields = [
  "name",
  "category",
  "level",
  "icon",
  "color",
  "isVisible",
  "displayOrder",
];

// Create Skill
export const createSkill = async (req, res) => {
  try {
    const { name, category, level, icon, color, isVisible, displayOrder } =
      req.body;

    if (!name?.trim() || !category) {
      return res.status(400).json({
        success: false,
        message: "Skill name and category are required.",
      });
    }

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill category.",
      });
    }

    if (
      level !== undefined &&
      (!Number.isFinite(level) || level < 0 || level > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Skill level must be between 0 and 100.",
      });
    }

    const skill = await Skill.create({
      name: name.trim(),
      category,
      level,
      icon,
      color,
      isVisible,
      displayOrder,
    });

    return res.status(201).json({
      success: true,
      message: "Skill created successfully.",
      skill,
    });
  } catch (error) {
    console.error("Create Skill Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create skill.",
    });
  }
};

// Get All Skills (Admin)
export const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({
      displayOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: skills.length,
      skills,
    });
  } catch (error) {
    console.error("Get Skills Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch skills.",
    });
  }
};

// Get Visible Skills (Public)
export const getPublicSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ isVisible: true }).sort({
      displayOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: skills.length,
      skills,
    });
  } catch (error) {
    console.error("Get Public Skills Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch public skills.",
    });
  }
};

// Update Skill
export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID.",
      });
    }

    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.name !== undefined &&
      (typeof updates.name !== "string" || !updates.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Skill name cannot be empty.",
      });
    }

    if (
      updates.category !== undefined &&
      !allowedCategories.includes(updates.category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill category.",
      });
    }

    if (
      updates.level !== undefined &&
      (!Number.isFinite(updates.level) ||
        updates.level < 0 ||
        updates.level > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Skill level must be between 0 and 100.",
      });
    }

    if (updates.name !== undefined) {
      updates.name = updates.name.trim();
    }

    Object.assign(skill, updates);

    await skill.save();

    return res.status(200).json({
      success: true,
      message: "Skill updated successfully.",
      skill,
    });
  } catch (error) {
    console.error("Update Skill Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update skill.",
    });
  }
};

// Delete Skill
export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID.",
      });
    }

    const skill = await Skill.findByIdAndDelete(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Skill Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete skill.",
    });
  }
};
