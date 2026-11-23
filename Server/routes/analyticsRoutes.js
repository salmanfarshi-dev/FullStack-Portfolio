import express from "express";

import protectAdmin from "../middleware/authMiddleware.js";

import {
  trackAnalyticsEvent,
  getAnalyticsOverview,
} from "../controllers/analyticsController.js";

const router = express.Router();

// Public: Track Website Events
router.post("/track", trackAnalyticsEvent);

// Admin: Analytics Overview
router.get("/overview", protectAdmin, getAnalyticsOverview);

export default router;
