const express = require("express");
const router = express.Router();
const {
  uploadToCloudinary,
  cloudinary,
} = require("../middlewares/cloudinary.middleware");
const { auth } = require("../middlewares/auth.middleware");

// Upload resume to Cloudinary
router.post(
  "/resume",
  auth,
  (req, res, next) => {
    uploadToCloudinary.single("resume")(req, res, (err) => {
      if (err) {
        console.error("Multer/Cloudinary error:", err);
        return res.status(400).json({
          message: "Upload failed",
          error: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Update user's resume information in database
      const User = require("../models/user.model");
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete old resume from Cloudinary if exists
      if (user.resume && user.resume.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(user.resume.cloudinaryPublicId, {
            resource_type: "raw",
          });
          console.log("Old resume deleted from Cloudinary");
        } catch (error) {
          console.error("Error deleting old resume:", error);
        }
      }

      // Update resume information with Cloudinary data
      user.resume = {
        fileName: req.file.filename, // Cloudinary public_id
        originalName: req.file.originalname,
        fileSize: `${(req.file.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date(),
        cloudinaryPublicId: req.file.filename,
        cloudinaryUrl: req.file.path, // Cloudinary URL
        storageType: "cloudinary",
      };

      await user.save();

      res.json({
        message: "Resume uploaded successfully to Cloudinary",
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: req.file.path,
        cloudinaryUrl: req.file.path,
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  }
);

// Get resume URL (redirect to Cloudinary)
router.get("/resume/cloudinary/:publicId", (req, res) => {
  try {
    const publicId = req.params.publicId;

    // Generate Cloudinary URL
    const url = cloudinary.url(publicId, {
      resource_type: "raw",
      flags: "attachment", // Force download
    });

    res.redirect(url);
  } catch (error) {
    console.error("Error generating Cloudinary URL:", error);
    res
      .status(500)
      .json({ message: "Error accessing file", error: error.message });
  }
});

// View resume (direct Cloudinary URL)
router.get("/resume/cloudinary/view/:publicId", (req, res) => {
  try {
    const publicId = req.params.publicId;

    // Generate Cloudinary URL for viewing (not download)
    const url = cloudinary.url(publicId, {
      resource_type: "raw",
    });

    res.redirect(url);
  } catch (error) {
    console.error("Error generating Cloudinary view URL:", error);
    res
      .status(500)
      .json({ message: "Error viewing file", error: error.message });
  }
});

module.exports = router;
