const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const { auth } = require("../middlewares/auth.middleware");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure Cloudinary storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile-pictures", // Different folder for profile pics
    allowedFormats: ["jpg", "jpeg", "png", "gif"],
    transformation: [
      { width: 300, height: 300, crop: "fill" }, // Resize to 300x300
      { quality: "auto" },
    ],
  },
});

const profilePictureUpload = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for profile pictures"), false);
    }
  },
});

// Configure Cloudinary storage for resumes
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "resumes", // Folder for resume files
    allowedFormats: ["pdf", "doc", "docx"],
    resource_type: "raw", // Important: Use 'raw' for non-image files
  },
});

const resumeUpload = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for resumes
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF, DOC, and DOCX files
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed for resumes"), false);
    }
  },
});

// Upload profile picture
router.post(
  "/profile-picture",
  auth,
  profilePictureUpload.single("profilePicture"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }

      res.json({
        message: "Profile picture uploaded successfully",
        cloudinaryUrl: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Profile picture upload error:", error);
      res
        .status(500)
        .json({
          message: "Profile picture upload failed",
          error: error.message,
        });
    }
  }
);

// Upload resume to Cloudinary
router.post("/resume", auth, resumeUpload.single("resume"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    res.json({
      message: "Resume uploaded successfully to Cloudinary",
      url: req.file.path, // Cloudinary URL
      cloudinaryUrl: req.file.path, // Alias for compatibility
      publicId: req.file.filename, // Cloudinary public ID
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({ 
      message: "Resume upload failed", 
      error: error.message 
    });
  }
});

// Download resume (redirect to Cloudinary URL)
// Note: This route is kept for backward compatibility
// New resumes are accessed directly via Cloudinary URLs
router.get("/resume/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads/resumes", filename);

    // Check if file exists locally (for old uploads)
    if (fs.existsSync(filePath)) {
      return res.download(filePath);
    }

    // If not found locally, it might be a Cloudinary file
    res.status(404).json({ 
      message: "File not found. Resume may be stored on Cloudinary and accessible via direct URL." 
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Download failed", error: error.message });
  }
});

module.exports = router;
