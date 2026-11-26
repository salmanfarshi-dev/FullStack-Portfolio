import ActivityLog from "../models/ActivityLog.js";

// Create Activity Log
export const createActivityLog = async ({
  admin = null,
  adminName = "System",
  action,
  module,
  description,
  targetId = "",
  targetName = "",
  status = "success",
  metadata = {},
  req = null,
}) => {
  try {
    const safeMetadata =
      metadata && typeof metadata === "object" && !Array.isArray(metadata)
        ? { ...metadata }
        : {};

    // Never store sensitive information
    const sensitiveKeys = [
      "password",
      "token",
      "jwt",
      "secret",
      "apikey",
      "authorization",
      "cookie",
    ];

    sensitiveKeys.forEach((key) => {
      delete safeMetadata[key];
    });

    const log = await ActivityLog.create({
      admin: admin?._id || admin || null,
      adminName: admin?.name || adminName,
      action,
      module,
      description,
      targetId,
      targetName,
      status,
      metadata: safeMetadata,
      ipAddress: req?.ip || "",
      userAgent: req?.get("user-agent") || "",
    });

    return log;
  } catch (error) {
    // Logging failure should not break the main operation
    console.error("Activity Log Error:", error.message);
    return null;
  }
};

// Get All Activity Logs (Admin)
export const getActivityLogs = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.module) {
      const allowedModules = [
        "auth",
        "projects",
        "skills",
        "about",
        "hero",
        "contact",
        "newsletter",
        "journeys",
        "socials",
        "resume",
        "seo",
        "settings",
        "analytics",
        "notifications",
        "system",
      ];

      if (!allowedModules.includes(req.query.module)) {
        return res.status(400).json({
          success: false,
          message: "Invalid activity module.",
        });
      }

      filter.module = req.query.module;
    }

    if (req.query.status) {
      if (!["success", "failed", "warning"].includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid activity status.",
        });
      }

      filter.status = req.query.status;
    }

    if (req.query.from || req.query.to) {
      const from = req.query.from ? new Date(`${req.query.from}T00:00:00.000Z`) : null;
      const to = req.query.to ? new Date(`${req.query.to}T23:59:59.999Z`) : null;

      if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime()))) {
        return res.status(400).json({
          success: false,
          message: "Invalid activity date range.",
        });
      }

      if (from && to && from > to) {
        return res.status(400).json({
          success: false,
          message: "The start date must be before or equal to the end date.",
        });
      }

      filter.createdAt = {};
      if (from) filter.createdAt.$gte = from;
      if (to) filter.createdAt.$lte = to;
    }

    if (req.query.search) {
      const search = String(req.query.search).trim().slice(0, 100);
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { action: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { adminName: { $regex: escapedSearch, $options: "i" } },
        { targetName: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate("admin", "name email")
        .select("-ipAddress -userAgent -metadata")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ActivityLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Activity Logs Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs.",
    });
  }
};

// Get Single Activity Log (Admin)
export const getActivityLogById = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id)
      .populate("admin", "name email")
      .select("-ipAddress -userAgent -metadata");

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Activity log not found.",
      });
    }

    return res.status(200).json({
      success: true,
      log,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity log.",
    });
  }
};

// Get Activity Summary (Admin)
export const getActivitySummary = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);

    if (![7, 30, 90].includes(days)) {
      return res.status(400).json({
        success: false,
        message: "Days must be 7, 30 or 90.",
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filter = {
      createdAt: { $gte: startDate },
    };

    const [total, successful, failed, warning, moduleStats, recentActivity] =
      await Promise.all([
        ActivityLog.countDocuments(filter),

        ActivityLog.countDocuments({
          ...filter,
          status: "success",
        }),

        ActivityLog.countDocuments({
          ...filter,
          status: "failed",
        }),

        ActivityLog.countDocuments({
          ...filter,
          status: "warning",
        }),

        ActivityLog.aggregate([
          { $match: filter },
          {
            $group: {
              _id: "$module",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]),

        ActivityLog.find(filter)
          .select("action module description adminName status createdAt")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

    return res.status(200).json({
      success: true,
      summary: {
        total,
        successful,
        failed,
        warning,
      },
      moduleStats,
      recentActivity,
    });
  } catch (error) {
    console.error("Activity Summary Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity summary.",
    });
  }
};

// Delete Old Activity Logs (Admin)
export const deleteOldActivityLogs = async (req, res) => {
  try {
    const days = Number(req.body.days);

    if (!Number.isInteger(days) || days < 90 || days > 3650) {
      return res.status(400).json({
        success: false,
        message: "Retention period must be between 90 and 3650 days.",
      });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    await createActivityLog({
      admin: req.admin,
      action: "CLEANUP",
      module: "system",
      description: `Deleted ${result.deletedCount} activity logs older than ${days} days.`,
      metadata: { days, deletedCount: result.deletedCount },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Old activity logs deleted successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete Old Logs Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete old activity logs.",
    });
  }
};
