
import express from "express";

import {
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
} from "../controllers/authController.js";

import protectAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

// Public login endpoint
router.post("/login", loginAdmin);

// Protected endpoints
router.get("/me", protectAdmin, getCurrentAdmin);
router.post("/logout", protectAdmin, logoutAdmin);

export default router;
