import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import journeyRoutes from "./routes/journeyRoutes.js";
import socialRoutes from "./routes/socialRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";
import websiteSettingsRoutes from "./routes/websiteSettingsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";



const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Request parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/skills", skillRoutes);
app.use("/api/v1/about", aboutRoutes);
app.use("/api/v1/hero", heroRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use("/api/v1/journeys", journeyRoutes);
app.use("/api/v1/socials", socialRoutes);
app.use("/api/v1/resume", resumeRoutes);
app.use("/api/v1/seo", seoRoutes);
app.use("/api/v1/settings", websiteSettingsRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/activity-logs", activityLogRoutes);
app.use("/api/v1/backups", backupRoutes);
app.use("/api/v1/admin", adminRoutes);


// Health Check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Salman Farshi API is running!",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

export default app;
