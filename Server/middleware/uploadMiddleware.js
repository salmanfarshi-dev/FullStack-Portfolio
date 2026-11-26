import multer from "multer";

const storage = multer.memoryStorage();

const uploadResume = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const isPdf = file.mimetype === "application/pdf" && file.originalname.toLowerCase().endsWith(".pdf");
    if (!isPdf) return callback(new Error("Only PDF files are allowed."));
    callback(null, true);
  },
}).single("resume");

export default (req, res, next) => {
  uploadResume(req, res, (error) => {
    if (!error) return next();
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "PDF must be 10 MB or smaller."
      : error.message || "Unable to upload file.";
    return res.status(400).json({ success: false, message });
  });
};
