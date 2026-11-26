import express from "express";

import protectAdmin from "../middleware/authMiddleware.js";\nimport profileImageUpload from "../middleware/profileImageUpload.js";

import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,\n  uploadAdminProfileImage,\n  deleteAdminProfileImage,
} from "../controllers/adminController.js";

const router = express.Router();

// All Admin Profile Routes Require Authentication
router.use(protectAdmin);

// Get Admin Profile
router.get("/profile", getAdminProfile);

// Update Admin Profile
router.patch("/profile", updateAdminProfile);

// Change Admin Password
router.patch("/change-password", changeAdminPassword);

export default router;
