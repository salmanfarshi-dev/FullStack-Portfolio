import express from "express";

import {
  createWebsiteSettings,
  getAdminWebsiteSettings,
  getPublicWebsiteSettings,
  updateWebsiteSettings,
} from "../controllers/websiteSettingsController.js";

import protectAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Route
router.get("/", getPublicWebsiteSettings);

// Admin Routes
router.get("/admin", protectAdmin, getAdminWebsiteSettings);
router.post("/", protectAdmin, createWebsiteSettings);
router.patch("/:id", protectAdmin, updateWebsiteSettings);

export default router;
