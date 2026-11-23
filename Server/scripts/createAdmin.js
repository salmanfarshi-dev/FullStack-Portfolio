import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

const createAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    // Check required environment variables
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "Please provide ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env",
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("Admin password must be at least 12 characters long.");
    }

    await connectDB();

    const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

    // Prevent duplicate admin accounts
    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (existingAdmin) {
      console.log("An admin account with this email already exists.");
      return;
    }

    // Create admin account
    await Admin.create({
      name: ADMIN_NAME.trim(),
      email: normalizedEmail,
      password: ADMIN_PASSWORD,
    });

    console.log("--------------------------------");
    console.log("Admin account created successfully!");
    console.log(`Admin Email: ${normalizedEmail}`);
    console.log("--------------------------------");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();
