import express from "express";

import protectAdmin from "../middleware/authMiddleware.js";

import {
  getPublicAbout,
  getAdminAbout,
  createAbout,
  updateAbout,
} from "../controllers/aboutController.js";

const router = express.Router();

// Public Route
router.get("/", getPublicAbout);

// Admin Only Routes
router.get("/admin", protectAdmin, getAdminAbout);
router.post("/", protectAdmin, createAbout);
router.patch("/:id", protectAdmin, updateAbout);

export default router;
