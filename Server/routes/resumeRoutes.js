import express from "express";
import {
  getAdminResume,
  getPublicResume,
  updateResume,
  deleteResume,
  trackResumeDownload,
  uploadResume,
} from "../controllers/resumeController.js";
import protectAdmin from "../middleware/authMiddleware.js";
import resumeUpload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getPublicResume);
router.post("/download", trackResumeDownload);
router.get("/admin", protectAdmin, getAdminResume);
router.post("/upload", protectAdmin, resumeUpload, uploadResume);
router.patch("/:id", protectAdmin, updateResume);
router.delete("/:id", protectAdmin, deleteResume);

export default router;
