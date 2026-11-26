import mongoose from "mongoose";
import { Readable } from "stream";
import Resume from "../models/Resume.js";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import { createActivityLog } from "./activityLogController.js";

const uploadPdfToCloudinary = (file) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({
    resource_type: "raw",
    folder: "salman-farshi/resume",
    format: "pdf",
    use_filename: false,
    unique_filename: true,
    access_mode: "public",
  }, (error, result) => error ? reject(error) : resolve(result));
  Readable.from(file.buffer).pipe(stream);
});

const deleteCloudinaryPdf = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw", invalidate: true });
  } catch (error) {
    console.error("Cloudinary old resume cleanup failed:", error.message);
  }
};

// Public resume
export const getPublicResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ isVisible: true }).select("-publicId");
    return res.status(200).json({ success: true, resume });
  } catch (error) {
    console.error("Get Public Resume Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch resume." });
  }
};

// Admin resume
export const getAdminResume = async (req, res) => {
  try {
    const resume = await Resume.findOne();
    return res.status(200).json({ success: true, resume });
  } catch (error) {
    console.error("Get Admin Resume Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch resume." });
  }
};

// Upload or replace PDF
export const uploadResume = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ success: false, message: "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to Server/.env." });
    }
    if (!req.file) return res.status(400).json({ success: false, message: "Please choose a PDF file." });

    const title = typeof req.body.title === "string" && req.body.title.trim()
      ? req.body.title.trim().slice(0, 150) : "My Professional Resume";
    const description = typeof req.body.description === "string" ? req.body.description.trim().slice(0, 500) : "";
    const isVisible = req.body.isVisible === undefined ? true : req.body.isVisible === "true";

    const uploaded = await uploadPdfToCloudinary(req.file);
    const existing = await Resume.findOne();
    const oldPublicId = existing?.publicId;

    const resumeData = {
      title,
      fileUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileFormat: "pdf",
      description,
      isVisible,
      lastUpdated: new Date(),
    };

    let resume;
    if (existing) {
      Object.assign(existing, resumeData);
      resume = await existing.save();
    } else {
      resume = await Resume.create(resumeData);
    }

    if (oldPublicId && oldPublicId !== uploaded.public_id) await deleteCloudinaryPdf(oldPublicId);

    await createActivityLog({
      admin: req.admin,
      action: existing ? "resume_replaced" : "resume_uploaded",
      module: "resume",
      description: existing ? "Replaced the portfolio resume PDF." : "Uploaded a portfolio resume PDF.",
      targetId: resume._id.toString(),
      targetName: resume.fileName,
      metadata: { fileSize: resume.fileSize, fileFormat: "pdf" },
      req,
    });

    return res.status(existing ? 200 : 201).json({ success: true, message: existing ? "Resume replaced successfully." : "Resume uploaded successfully.", resume });
  } catch (error) {
    console.error("Upload Resume Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to upload resume." });
  }
};

export const updateResume = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid resume ID." });
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });

    const updates = {};
    if (req.body.title !== undefined) {
      if (typeof req.body.title !== "string" || !req.body.title.trim()) return res.status(400).json({ success: false, message: "Resume title cannot be empty." });
      updates.title = req.body.title.trim().slice(0, 150);
    }
    if (req.body.description !== undefined) updates.description = String(req.body.description).trim().slice(0, 500);
    if (req.body.isVisible !== undefined) updates.isVisible = Boolean(req.body.isVisible);
    Object.assign(resume, updates);
    await resume.save();

    await createActivityLog({ admin: req.admin, action: "resume_updated", module: "resume", description: "Updated resume details or visibility.", targetId: resume._id.toString(), targetName: resume.fileName, req });
    return res.status(200).json({ success: true, message: "Resume updated successfully.", resume });
  } catch (error) {
    console.error("Update Resume Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update resume." });
  }
};

export const trackResumeDownload = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate({ isVisible: true }, { $inc: { downloadCount: 1 } }, { new: true, projection: { downloadCount: 1 } });
    if (!resume) return res.status(404).json({ success: false, message: "Resume is currently unavailable." });
    return res.status(200).json({ success: true, message: "Resume download tracked.", downloadCount: resume.downloadCount });
  } catch (error) {
    console.error("Track Resume Download Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to track resume download." });
  }
};

export const deleteResume = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid resume ID." });
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    await deleteCloudinaryPdf(resume.publicId);
    await createActivityLog({ admin: req.admin, action: "resume_deleted", module: "resume", description: "Deleted the portfolio resume PDF.", targetId: resume._id.toString(), targetName: resume.fileName, req });
    return res.status(200).json({ success: true, message: "Resume deleted successfully." });
  } catch (error) {
    console.error("Delete Resume Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete resume." });
  }
};
