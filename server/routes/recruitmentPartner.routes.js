const express = require("express");
const router = express.Router();
const recruitmentPartnerController = require("../controllers/recruitmentPartner.controller");
const { auth, authorizeRoles } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { uploadToCloudinary } = require("../middlewares/cloudinary.middleware");

// Recruitment partner routes
router.get(
  "/profile",
  auth,
  authorizeRoles("recruitment_partner"),
  recruitmentPartnerController.getProfile
);
router.put(
  "/profile",
  auth,
  authorizeRoles("recruitment_partner"),
  recruitmentPartnerController.updateProfile
);
router.get(
  "/dashboard",
  auth,
  authorizeRoles("recruitment_partner"),
  recruitmentPartnerController.getDashboardStats
);
router.get(
  "/applied-jobs",
  auth,
  authorizeRoles("recruitment_partner"),
  recruitmentPartnerController.getAppliedJobs
);

// Add candidate route
router.post(
  "/candidates",
  auth,
  authorizeRoles("recruitment_partner"),
  (req, res, next) => {
    uploadToCloudinary.single("resume")(req, res, (err) => {
      if (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(400).json({
          message: "Resume upload failed",
          error: err.message,
        });
      }
      next();
    });
  },
  recruitmentPartnerController.addCandidate
);

// Get candidates route
router.get(
  "/candidates",
  auth,
  authorizeRoles("recruitment_partner"),
  recruitmentPartnerController.getCandidates
);

// Get applications route
router.get(
  "/applications",
  auth,
  authorizeRoles("recruitment_partner"),
  recruitmentPartnerController.getApplications
);

// Submit candidate to job route
router.post(
  "/submit-candidate",
  auth,
  authorizeRoles("recruitment_partner"),
  (req, res, next) => {
    uploadToCloudinary.single("resume")(req, res, (err) => {
      if (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(400).json({
          message: "Resume upload failed",
          error: err.message,
        });
      }
      next();
    });
  },
  recruitmentPartnerController.submitCandidate
);

// Get submitted candidates with interview details
router.get(
  "/submitted-candidates",
  auth,
  authorizeRoles("recruitment_partner"),
  recruitmentPartnerController.getSubmittedCandidates
);

module.exports = router;
