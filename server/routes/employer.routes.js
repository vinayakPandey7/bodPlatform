const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employer.controller");
const { auth, authorizeRoles } = require("../middlewares/auth.middleware");

// Employer routes
router.get(
  "/profile",
  auth,
  authorizeRoles("employer"),
  employerController.getProfile
);
router.put(
  "/profile",
  auth,
  authorizeRoles("employer"),
  employerController.updateProfile
);
router.get(
  "/applications",
  auth,
  authorizeRoles("employer"),
  employerController.getApplications
);
router.get(
  "/jobs/:jobId/applications",
  auth,
  authorizeRoles("employer"),
  employerController.getJobApplications
);
router.put(
  "/candidates/:candidateId/applications/:applicationId/status",
  auth,
  authorizeRoles("employer"),
  employerController.updateCandidateStatus
);

module.exports = router;
