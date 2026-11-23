import express from "express";

import {
  createSocial,
  getAllSocials,
  getPublicSocials,
  updateSocial,
  deleteSocial,
} from "../controllers/socialController.js";

import protectAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Route
router.get("/", getPublicSocials);

// Admin Routes
router.get("/admin", protectAdmin, getAllSocials);
router.post("/", protectAdmin, createSocial);
router.patch("/:id", protectAdmin, updateSocial);
router.delete("/:id", protectAdmin, deleteSocial);

export default router;
