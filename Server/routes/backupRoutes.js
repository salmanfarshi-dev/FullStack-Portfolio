import express from "express";

import protectAdmin from "../middleware/authMiddleware.js";

import {
  exportBackup,
  getBackupHistory,
  deleteBackupHistory,
} from "../controllers/backupController.js";

const router = express.Router();

// All Backup Routes Require Admin Authentication
router.use(protectAdmin);

// Export JSON Backup
router.get("/export", exportBackup);

// Get Backup History
router.get("/history", getBackupHistory);

// Delete Backup History Record
router.delete("/history/:id", deleteBackupHistory);

export default router;
