
import Admin from "../models/Admin.js";
import { Readable } from "stream";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import { createActivityLog } from "./activityLogController.js";

const COOKIE_NAME = "admin_token";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
});

// Get Admin Profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select(
      "name email profileImage isActive lastLoginAt createdAt"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Get Admin Profile Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile.",
    });
  }
};

// Update Admin Profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must contain at least 2 characters.",
        });
      }

      if (name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Name cannot exceed 100 characters.",
        });
      }

      admin.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid email address.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address.",
        });
      }

      const existingAdmin = await Admin.findOne({
        email: normalizedEmail,
        _id: { $ne: admin._id },
      });

      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: "This email is already in use.",
        });
      }

      admin.email = normalizedEmail;
    }

    await admin.save();

    await createActivityLog({
      admin: req.admin,
      action: "UPDATE_PROFILE",
      module: "system",
      description: "Updated admin profile details.",
      targetId: admin._id.toString(),
      targetName: admin.name,
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully.",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  } catch (error) {
    console.error("Update Admin Profile Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update admin profile.",
    });
  }
};

// Change Admin Password
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all password fields.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    if (newPassword.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password cannot exceed 128 characters.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password.",
      });
    }

    const admin = await Admin.findById(req.admin._id).select("+password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    const isPasswordCorrect = await admin.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Update password
    admin.password = newPassword;

    // Invalidate all previously issued JWT tokens
    admin.tokenVersion = (admin.tokenVersion ?? 0) + 1;

    await admin.save();

    await createActivityLog({
      admin: req.admin,
      action: "CHANGE_PASSWORD",
      module: "system",
      description: "Changed admin account password.",
      targetId: admin._id.toString(),
      targetName: admin.name,
      req,
    });

    // Clear the current authentication cookie
    res.clearCookie(COOKIE_NAME, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    console.error("Change Admin Password Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};

const uploadProfileImageToCloudinary = (file) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({
    folder: "salman-farshi/profile",
    resource_type: "image",
    transformation: [{ width: 600, height: 600, crop: "fill", gravity: "face" }, { quality: "auto", fetch_format: "auto" }],
  }, (error, result) => error ? reject(error) : resolve(result));
  Readable.from(file.buffer).pipe(stream);
});

const removeProfileImageFromCloudinary = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
  } catch (error) {
    console.error("Cloudinary profile image cleanup failed:", error.message);
  }
};

// Upload or replace admin profile photo
export const uploadAdminProfileImage = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ success: false, message: "Cloudinary is not configured." });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please choose an image file." });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin account not found." });

    const uploaded = await uploadProfileImageToCloudinary(req.file);
    const oldPublicId = admin.profileImage?.publicId || "";
    admin.profileImage = { url: uploaded.secure_url, publicId: uploaded.public_id };
    await admin.save();

    if (oldPublicId && oldPublicId !== uploaded.public_id) {
      await removeProfileImageFromCloudinary(oldPublicId);
    }

    await createActivityLog({
      admin: req.admin,
      action: "UPDATE_PROFILE_IMAGE",
      module: "system",
      description: "Updated admin profile photo.",
      targetId: admin._id.toString(),
      targetName: admin.name,
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully.",
      admin: { _id: admin._id, name: admin.name, email: admin.email, profileImage: admin.profileImage },
    });
  } catch (error) {
    console.error("Upload Admin Profile Image Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to upload profile photo." });
  }
};

// Remove admin profile photo
export const deleteAdminProfileImage = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin account not found." });

    const oldPublicId = admin.profileImage?.publicId || "";
    admin.profileImage = { url: "", publicId: "" };
    await admin.save();
    await removeProfileImageFromCloudinary(oldPublicId);

    await createActivityLog({
      admin: req.admin,
      action: "REMOVE_PROFILE_IMAGE",
      module: "system",
      description: "Removed admin profile photo.",
      targetId: admin._id.toString(),
      targetName: admin.name,
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Profile photo removed successfully.",
      admin: { _id: admin._id, name: admin.name, email: admin.email, profileImage: admin.profileImage },
    });
  } catch (error) {
    console.error("Delete Admin Profile Image Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to remove profile photo." });
  }
};
