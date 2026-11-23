import express from "express";

import protectAdmin from "../middleware/authMiddleware.js";

import {
  subscribeNewsletter,
  getAllSubscribers,
  updateSubscriber,
  deleteSubscriber,
} from "../controllers/newsletterController.js";

const router = express.Router();

// Public Route
router.post("/subscribe", subscribeNewsletter);

// Admin Only Routes
router.get("/admin", protectAdmin, getAllSubscribers);
router.patch("/admin/:id", protectAdmin, updateSubscriber);
router.delete("/admin/:id", protectAdmin, deleteSubscriber);

export default router;
