const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for resumes
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "resumes", // Folder in Cloudinary
    allowed_formats: ["pdf", "doc", "docx"],
    resource_type: "raw", // For non-image files
    public_id: (req, file) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `resume-${req.user.id}-${uniqueSuffix}`;
    },
  },
});

// Create multer upload instance
const uploadToCloudinary = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Handle empty files
    if (!file || file.size === 0) {
      console.log('Empty file detected, skipping upload');
      return cb(null, false); // Skip the file but don't error
    }
    
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"), false);
    }
  },
});

module.exports = { uploadToCloudinary, cloudinary };
