import Admin from "../models/Admin.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import About from "../models/About.js";
import Hero from "../models/Hero.js";
import Contact from "../models/Contact.js";
import Newsletter from "../models/Newsletter.js";
import Journey from "../models/Journey.js";
import Social from "../models/Social.js";
import Resume from "../models/Resume.js";
import SEO from "../models/SEO.js";
import WebsiteSettings from "../models/WebsiteSettings.js";
import Analytics from "../models/Analytics.js";
import Notification from "../models/Notification.js";
import ActivityLog from "../models/ActivityLog.js";

import Backup from "../models/Backup.js";
import { createActivityLog } from "./activityLogController.js";

// Available Backup Collections
const backupCollections = {
  projects: Project,
  contacts: Contact,
  newsletter: Newsletter,
};

// Export JSON Backup
export const exportBackup = async (req, res) => {
  try {
    const type = req.query.type || "full";

    const allowedTypes = ["full", "projects", "contacts", "newsletter"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid backup type.",
      });
    }

    let collections = {};

    if (type === "full") {
      const [
        admins,
        projects,
        skills,
        about,
        hero,
        contacts,
        newsletter,
        journeys,
        socials,
        resumes,
        seo,
        websiteSettings,
        analytics,
        notifications,
        activityLogs,
      ] = await Promise.all([
        Admin.find().select("-password").lean(),
        Project.find().lean(),
        Skill.find().lean(),
        About.find().lean(),
        Hero.find().lean(),
        Contact.find().select("-ipAddress -userAgent").lean(),
        Newsletter.find().lean(),
        Journey.find().lean(),
        Social.find().lean(),
        Resume.find().lean(),
        SEO.find().lean(),
        WebsiteSettings.find().lean(),
        Analytics.find().select("-sessionId").lean(),
        Notification.find().lean(),
        ActivityLog.find().select("-ipAddress -userAgent -metadata").lean(),
      ]);

      collections = {
        admins,
        projects,
        skills,
        about,
        hero,
        contacts,
        newsletter,
        journeys,
        socials,
        resumes,
        seo,
        websiteSettings,
        analytics,
        notifications,
        activityLogs,
      };
    } else {
      const Model = backupCollections[type];

      const records = await Model.find()
        .select(type === "contacts" ? "-ipAddress -userAgent" : "")
        .lean();

      collections[type] = records;
    }

    const recordCount = Object.values(collections).reduce(
      (total, records) => total + records.length,
      0,
    );

    const backupData = {
      backupInfo: {
        type,
        format: "json",
        createdAt: new Date().toISOString(),
        createdBy: req.admin.name,
        recordCount,
      },
      collections,
    };

    const buffer = Buffer.from(JSON.stringify(backupData, null, 2), "utf-8");

    const fileName = `salman-farshi-${type}-backup-${Date.now()}.json`;

    // Save Backup History
    await Backup.create({
      admin: req.admin._id,
      type,
      format: "json",
      fileName,
      fileSize: buffer.length,
      recordCount,
      status: "completed",
      completedAt: new Date(),
    });

    await createActivityLog({
      admin: req.admin,
      action: "EXPORT_BACKUP",
      module: "system",
      description: `Exported ${type} backup (${recordCount} records).`,
      targetId: fileName,
      targetName: fileName,
      metadata: { type, recordCount, fileSize: buffer.length },
      req,
    });

    // Download JSON File
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Export Backup Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to export backup.",
    });
  }
};

// Get Backup History
export const getBackupHistory = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [backups, total] = await Promise.all([
      Backup.find()
        .populate("admin", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Backup.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      backups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Backup History Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch backup history.",
    });
  }
};

// Delete Backup History Record
export const deleteBackupHistory = async (req, res) => {
  try {
    const backup = await Backup.findByIdAndDelete(req.params.id);

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "Backup record not found.",
      });
    }

    await createActivityLog({
      admin: req.admin,
      action: "DELETE_BACKUP_HISTORY",
      module: "system",
      description: "Deleted a backup history record.",
      targetId: backup._id.toString(),
      targetName: backup.fileName,
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Backup history deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete backup history.",
    });
  }
};
