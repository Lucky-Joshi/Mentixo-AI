const express = require("express");
const multer = require("multer");
const { handleUpload } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");
const { checkUploadLimit } = require("../middleware/usageMiddleware");

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP, and PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/", protect, checkUploadLimit, upload.single("file"), handleUpload);

module.exports = router;
