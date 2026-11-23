import express from "express";

import {
  createSEO,
  getAdminSEO,
  getPublicSEO,
  updateSEO,
} from "../controllers/seoController.js";

import protectAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Route
router.get("/", getPublicSEO);

// Admin Routes
router.get("/admin", protectAdmin, getAdminSEO);
router.post("/", protectAdmin, createSEO);
router.patch("/:id", protectAdmin, updateSEO);

export default router;
