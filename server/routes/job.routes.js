const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job.controller");
const { auth, authorizeRoles } = require("../middlewares/auth.middleware");

// Public routes
router.get("/active", jobController.getActiveJobs);
router.get("/:id", jobController.getJobById);

// Employer routes
router.post("/", auth, authorizeRoles("employer"), jobController.createJob);
router.get(
  "/employer/my-jobs",
  auth,
  authorizeRoles("employer"),
  jobController.getEmployerJobs
);
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
router.get(
  "/:id/applications",
  auth,
  authorizeRoles("employer"),
  jobController.getJobApplications
);

module.exports = router;
