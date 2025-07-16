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

// Dynamic routes (must be last)
router.get("/:id", jobController.getJobById);
router.get(
  "/:id/applications",
  auth,
  authorizeRoles("employer"),
  jobController.getJobApplications
);

// Employer routes
router.post("/", auth, authorizeRoles("employer"), jobController.createJob);
router.put("/:id", auth, authorizeRoles("employer"), jobController.updateJob);
router.delete(
  "/:id",
  auth,
  authorizeRoles("employer"),
  jobController.deleteJob
);
router.patch(
  "/:id/toggle-status",
  auth,
  authorizeRoles("employer"),
  jobController.toggleJobStatus
);

module.exports = router;
