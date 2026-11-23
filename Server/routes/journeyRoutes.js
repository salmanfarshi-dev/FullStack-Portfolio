
import express from "express";

import {
  createJourney,
  getAllJourneys,
  getPublicJourneys,
  updateJourney,
  deleteJourney,
} from "../controllers/journeyController.js";

import protectAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/", getPublicJourneys);

// Admin Routes
router.get("/admin", protectAdmin, getAllJourneys);
router.post("/", protectAdmin, createJourney);
router.patch("/:id", protectAdmin, updateJourney);
router.delete("/:id", protectAdmin, deleteJourney);

export default router;
