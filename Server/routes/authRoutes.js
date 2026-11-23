
import express from "express";

import {
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import protectAdmin from "../middleware/authMiddleware.js";
import authRateLimiter from "../middleware/authRateLimiter.js";
import passwordResetRateLimiter from "../middleware/passwordResetRateLimiter.js";

const router = express.Router();

// Admin Login
router.post("/login", authRateLimiter, loginAdmin);

// Forgot Password
router.post(
  "/forgot-password",
  passwordResetRateLimiter,
  forgotPassword
);

// Reset Password
router.post(
  "/reset-password",
  passwordResetRateLimiter,
  resetPassword
);

// Get Current Admin
router.get("/me", protectAdmin, getCurrentAdmin);

// Admin Logout
router.post("/logout", protectAdmin, logoutAdmin);

export default router;
