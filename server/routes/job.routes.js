const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job.controller");
const candidateController = require("../controllers/candidate.controller");
const { auth, authorizeRoles } = require("../middlewares/auth.middleware");

// Public routes
router.get("/active", jobController.getActiveJobs);
router.get("/candidates/nearby", jobController.getJobsForCandidates); // New route for location-based job search

// Candidate routes
router.post(
  "/:id/apply",
  auth,
  authorizeRoles("candidate"),
  candidateController.applyToJob
);

// Employer routes (specific routes before dynamic ones)
router.get(
  "/employer/my-jobs",
  auth,
  authorizeRoles("employer"),
  jobController.getEmployerJobs
);

// Recruitment Partner routes (specific routes before dynamic ones)
router.get(
  "/recruitment-partner/my-jobs",
  auth,
  authorizeRoles("recruitment_partner"),
  jobController.getRecruitmentPartnerJobs
);

// Dynamic routes (must be last)
router.get("/:id", jobController.getJobById);
router.get(
  "/:id/applications",
  auth,
  authorizeRoles("employer"),
  jobController.getJobApplications
);

// Employer and Recruitment Partner routes
router.post(
  "/",
  auth,
  authorizeRoles("employer", "recruitment_partner"),
  jobController.createJob
);
router.put(
  "/:id",
  auth,
  authorizeRoles("employer", "recruitment_partner"),
  jobController.updateJob
);
router.delete(
  "/:id",
  auth,
  authorizeRoles("employer", "recruitment_partner"),
  jobController.deleteJob
);
router.patch(
  "/:id/toggle-status",
  auth,
  authorizeRoles("employer", "recruitment_partner"),
  jobController.toggleJobStatus
);

module.exports = router;
