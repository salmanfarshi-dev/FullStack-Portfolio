import Notification from "../models/Notification.js";
import Admin from "../models/Admin.js";
import { createActivityLog } from "./activityLogController.js";

// Create Notification for Active Admins
export const createNotification = async ({
  type,
  title,
  message,
  link = "",
  metadata = {},
  io,
}) => {
  try {
    const admins = await Admin.find({ isActive: true }).select("_id");

    if (!admins.length) return;

    const notifications = await Notification.insertMany(
      admins.map((admin) => ({
        recipient: admin._id,
        type,
        title,
        message,
        link,
        metadata,
      })),
    );

    // Send Real-time Notification
    if (io) {
      admins.forEach((admin) => {
        const adminNotifications = notifications
          .filter(
            (notification) =>
              notification.recipient.toString() === admin._id.toString(),
          )
          .map((notification) => ({
            _id: notification._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            link: notification.link,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
          }));

        adminNotifications.forEach((notification) => {
          io.emit("new-notification", notification);
        });
      });
    }

    return notifications;
  } catch (error) {
    console.error("Create Notification Error:", error.message);
  }
};

// Get All Admin Notifications
export const getNotifications = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {
      recipient: req.admin._id,
    };

    if (req.query.status === "unread") {
      filter.isRead = false;
    } else if (req.query.status === "read") {
      filter.isRead = true;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Notification.countDocuments(filter),

      Notification.countDocuments({
        recipient: req.admin._id,
        isRead: false,
      }),
    ]);

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Notifications Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
};

// Mark Single Notification as Read
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.admin._id,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    await createActivityLog({
      admin: req.admin,
      action: "MARK_READ",
      module: "notifications",
      description: "Marked a notification as read.",
      targetId: notification._id.toString(),
      targetName: notification.title,
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
};

// Mark All Notifications as Read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.admin._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    await createActivityLog({
      admin: req.admin,
      action: "MARK_ALL_READ",
      module: "notifications",
      description: `Marked ${result.modifiedCount} notifications as read.`,
      metadata: { modifiedCount: result.modifiedCount },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
};

// Delete Single Notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.admin._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    await createActivityLog({
      admin: req.admin,
      action: "DELETE",
      module: "notifications",
      description: "Deleted a notification.",
      targetId: notification._id.toString(),
      targetName: notification.title,
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};

// Delete All Notifications
export const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.admin._id,
    });

    await createActivityLog({
      admin: req.admin,
      action: "DELETE_ALL",
      module: "notifications",
      description: `Deleted ${result.deletedCount} notifications.`,
      metadata: { deletedCount: result.deletedCount },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "All notifications deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete notifications.",
    });
  }
};
