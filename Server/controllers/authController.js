import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/Admin.js";
import { sendPasswordResetEmail } from "../services/passwordResetEmailService.js";
import { createActivityLog } from "./activityLogController.js";

const COOKIE_NAME = "admin_token";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
});

// Generate JWT Token
const generateToken = (admin) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      id: admin._id,
      tokenVersion: admin.tokenVersion ?? 0,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );
};

// Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const admin = await Admin.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await admin.comparePassword(password);

    if (!isPasswordCorrect) {
      await createActivityLog({
        admin,
        action: "login_failed",
        module: "auth",
        description: "A failed administrator login attempt was detected.",
        status: "failed",
        req,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generateToken(admin);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    await createActivityLog({
      admin,
      action: "login",
      module: "auth",
      description: "Administrator signed in successfully.",
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during login.",
    });
  }
};

// Get Logged-in Admin
export const getCurrentAdmin = async (req, res) => {
  return res.status(200).json({
    success: true,
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      lastLoginAt: req.admin.lastLoginAt,
    },
  });
};

// Admin Logout
export const logoutAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
      admin.tokenVersion = (admin.tokenVersion ?? 0) + 1;
      await admin.save();

      await createActivityLog({
        admin,
        action: "logout",
        module: "auth",
        description: "Administrator signed out.",
        req,
      });
    }

    res.clearCookie(COOKIE_NAME, getCookieOptions());

    return res.status(200).json({
      success: true,
      message:
        "Admin logged out successfully. All sessions have been invalidated.",
    });
  } catch (error) {
    console.error("Admin Logout Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to logout.",
    });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({
      email: normalizedEmail,
      isActive: true,
    });

    const genericResponse = {
      success: true,
      message:
        "If an active admin account exists with this email, a password reset link will be sent.",
    };

    if (!admin) return res.status(200).json(genericResponse);

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await admin.save();

    const clientUrl = process.env.CLIENT_URL;

    if (!clientUrl) {
      admin.resetPasswordToken = null;
      admin.resetPasswordExpires = null;
      await admin.save();
      console.error("CLIENT_URL is not configured.");
      return res.status(500).json({
        success: false,
        message: "Password reset service is currently unavailable.",
      });
    }

    const resetUrl = `${clientUrl.replace(/\/$/, "")}/admin/reset-password?token=${resetToken}`;
    const emailSent = await sendPasswordResetEmail(admin, resetUrl);

    if (!emailSent) {
      admin.resetPasswordToken = null;
      admin.resetPasswordExpires = null;
      await admin.save();
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to process your password reset request.",
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (
      typeof token !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data.",
      });
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 128 characters.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
      isActive: true,
    }).select("+resetPasswordToken +resetPasswordExpires +password");

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link.",
      });
    }

    const isSamePassword = await admin.comparePassword(newPassword);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password.",
      });
    }

    admin.password = newPassword;
    admin.tokenVersion = (admin.tokenVersion ?? 0) + 1;
    admin.resetPasswordToken = null;
    admin.resetPasswordExpires = null;
    await admin.save();

    await createActivityLog({
      admin,
      action: "password_reset",
      module: "auth",
      description: "Administrator password was reset successfully.",
      req,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
};
