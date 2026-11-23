import mongoose from "mongoose";
import Resume from "../models/Resume.js";

const allowedFields = [
  "title",
  "fileUrl",
  "publicId",
  "fileName",
  "fileSize",
  "fileFormat",
  "description",
  "isVisible",
];

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

// Get Public Resume
export const getPublicResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ isVisible: true }).select(
      "-publicId",
    );

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error("Get Public Resume Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume.",
    });
  }
};

// Get Resume (Admin)
export const getAdminResume = async (req, res) => {
  try {
    const resume = await Resume.findOne();

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error("Get Admin Resume Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume.",
    });
  }
};

// Create Resume
export const createResume = async (req, res) => {
  try {
    const { title, fileUrl } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof fileUrl !== "string" ||
      !isValidUrl(fileUrl.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid resume title and file URL are required.",
      });
    }

    if (
      req.body.fileFormat !== undefined &&
      req.body.fileFormat.toLowerCase() !== "pdf"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only PDF resumes are supported.",
      });
    }

    const existingResume = await Resume.findOne();

    if (existingResume) {
      return res.status(409).json({
        success: false,
        message: "A resume already exists. Please update it instead.",
      });
    }

    const resumeData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        resumeData[field] = req.body[field];
      }
    }

    resumeData.fileFormat = "pdf";
    resumeData.lastUpdated = new Date();

    const resume = await Resume.create(resumeData);

    return res.status(201).json({
      success: true,
      message: "Resume created successfully.",
      resume,
    });
  } catch (error) {
    console.error("Create Resume Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create resume.",
    });
  }
};

// Update Resume
export const updateResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID.",
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" || !updates.title.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Resume title cannot be empty.",
      });
    }

    if (
      updates.fileUrl !== undefined &&
      (typeof updates.fileUrl !== "string" ||
        !isValidUrl(updates.fileUrl.trim()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid resume URL.",
      });
    }

    if (
      updates.fileFormat !== undefined &&
      (typeof updates.fileFormat !== "string" ||
        updates.fileFormat.toLowerCase() !== "pdf")
    ) {
      return res.status(400).json({
        success: false,
        message: "Only PDF resumes are supported.",
      });
    }

    if (updates.fileUrl !== undefined) {
      updates.lastUpdated = new Date();
    }

    Object.assign(resume, updates);

    await resume.save();

    return res.status(200).json({
      success: true,
      message: "Resume updated successfully.",
      resume,
    });
  } catch (error) {
    console.error("Update Resume Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update resume.",
    });
  }
};

// Track Resume Download
export const trackResumeDownload = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { isVisible: true },
      { $inc: { downloadCount: 1 } },
      {
        new: true,
        projection: { downloadCount: 1 },
      },
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume is currently unavailable.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume download tracked.",
      downloadCount: resume.downloadCount,
    });
  } catch (error) {
    console.error("Track Resume Download Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to track resume download.",
    });
  }
};

// Delete Resume
export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID.",
      });
    }

    const resume = await Resume.findByIdAndDelete(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Resume Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete resume.",
    });
  }
};
