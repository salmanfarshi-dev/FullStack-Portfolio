import rateLimit from "express-rate-limit";

const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many password reset requests. Please try again after 15 minutes.",
  },
});

export default passwordResetRateLimiter;
