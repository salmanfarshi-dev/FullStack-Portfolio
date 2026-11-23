import express from "express";

import protectAdmin from "../middleware/authMiddleware.js";

import {
  getActivityLogs,
  getActivityLogById,
  getActivitySummary,
  deleteOldActivityLogs,
} from "../controllers/activityLogController.js";

const router = express.Router();

// All routes require Admin Authentication
router.use(protectAdmin);

// Get Activity Summary
router.get("/summary", getActivitySummary);

// Get All Activity Logs
router.get("/", getActivityLogs);

// Delete Old Activity Logs
router.delete("/cleanup", deleteOldActivityLogs);

// Get Single Activity Log
router.get("/:id", getActivityLogById);

export default router;
