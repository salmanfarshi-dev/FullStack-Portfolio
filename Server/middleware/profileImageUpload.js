import multer from "multer";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const storage = multer.memoryStorage();

const profileImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error("Only JPG, PNG, WEBP or AVIF images are allowed."));
    }
    callback(null, true);
  },
}).single("image");

export default (req, res, next) => {
  profileImageUpload(req, res, (error) => {
    if (!error) return next();
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "Profile image must be 5 MB or smaller."
      : error.message || "Unable to upload image.";
    return res.status(400).json({ success: false, message });
  });
};
