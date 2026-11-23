
import express from "express";

import protectAdmin from "../middleware/authMiddleware.js";

import {
  getPublicHero,
  getAdminHero,
  createHero,
  updateHero,
} from "../controllers/heroController.js";

const router = express.Router();

// Public Route
router.get("/", getPublicHero);

// Admin Only Routes
router.get("/admin", protectAdmin, getAdminHero);
router.post("/", protectAdmin, createHero);
router.patch("/:id", protectAdmin, updateHero);

export default router;
