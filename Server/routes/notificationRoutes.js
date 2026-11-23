import express from "express";

import protectAdmin from "../middleware/authMiddleware.js";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

// All routes require Admin Authentication
router.use(protectAdmin);

// Get Notifications
router.get("/", getNotifications);

// Mark All as Read
router.patch("/read-all", markAllNotificationsAsRead);

// Delete All Notifications
router.delete("/delete-all", deleteAllNotifications);

// Mark Single Notification as Read
router.patch("/:id/read", markNotificationAsRead);

// Delete Single Notification
router.delete("/:id", deleteNotification);

export default router;
