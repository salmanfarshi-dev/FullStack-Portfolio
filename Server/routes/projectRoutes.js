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

// Admin Only Routes
router.get("/admin", protectAdmin, getAllProjects);
router.post("/", protectAdmin, createProject);
router.patch("/:id", protectAdmin, updateProject);
router.delete("/:id", protectAdmin, deleteProject);

// Public Single Project
router.get("/:slug", getProjectBySlug);

// Admin Only Routes
router.post("/", protectAdmin, createProject);
router.get("/admin", protectAdmin, getAllProjects);
router.patch("/:id", protectAdmin, updateProject);
router.delete("/:id", protectAdmin, deleteProject);

export default router;
