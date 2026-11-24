
import express from "express";

import protectAdmin from "../middleware/authMiddleware.js";

import {
  createProject,
  getAllProjects,
  getPublishedProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = express.Router();

// Public Routes
router.get("/", getPublishedProjects);
router.get("/admin", protectAdmin, getAllProjects);
router.get("/:slug", getProjectBySlug);

// Admin Only Routes
router.post("/", protectAdmin, createProject);
router.patch("/:id", protectAdmin, updateProject);
router.delete("/:id", protectAdmin, deleteProject);

export default router;
