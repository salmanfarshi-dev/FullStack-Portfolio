import express from "express";

import protectAdmin from "../middleware/authMiddleware.js";

import {
  createSkill,
  getAllSkills,
  getPublicSkills,
  updateSkill,
  deleteSkill,
} from "../controllers/skillController.js";

const router = express.Router();

// Public Route
router.get("/", getPublicSkills);

// Admin Only Routes
router.get("/admin", protectAdmin, getAllSkills);
router.post("/", protectAdmin, createSkill);
router.patch("/:id", protectAdmin, updateSkill);
router.delete("/:id", protectAdmin, deleteSkill);

export default router;
