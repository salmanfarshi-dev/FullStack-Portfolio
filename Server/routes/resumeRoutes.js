
import express from "express";

import {
  createResume,
  getAdminResume,
  getPublicResume,
  updateResume,
  deleteResume,
  trackResumeDownload,
} from "../controllers/resumeController.js";

import protectAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/", getPublicResume);
router.post("/download", trackResumeDownload);

// Admin Routes
router.get("/admin", protectAdmin, getAdminResume);
router.post("/", protectAdmin, createResume);
router.patch("/:id", protectAdmin, updateResume);
router.delete("/:id", protectAdmin, deleteResume);

export default router;
