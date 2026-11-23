import express from "express";

import protectAdmin from "../middleware/authMiddleware.js";

import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} from "../controllers/contactController.js";

const router = express.Router();

// Public Route
router.post("/", createContact);

// Admin Only Routes
router.get("/admin", protectAdmin, getAllContacts);
router.get("/admin/:id", protectAdmin, getContactById);
router.patch("/admin/:id", protectAdmin, updateContact);
router.delete("/admin/:id", protectAdmin, deleteContact);

export default router;
