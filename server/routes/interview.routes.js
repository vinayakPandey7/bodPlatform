const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interview.controller");
const { auth, authorizeRoles } = require("../middlewares/auth.middleware");

// Interview booking (candidate)
router.post(
  "/book",
  auth,
  authorizeRoles("candidate"),
  interviewController.bookInterview
);

// Get user's interviews (all roles)
router.get(
  "/my-interviews",
  auth,
  authorizeRoles("candidate", "employer", "recruitment_partner"),
  interviewController.getMyInterviews
);

// Get interview details
router.get(
  "/:id",
  auth,
  authorizeRoles("candidate", "employer", "recruitment_partner"),
  interviewController.getInterviewDetails
);

// Update interview status (employer/candidate)
router.patch(
  "/:id/status",
  auth,
  authorizeRoles("candidate", "employer"),
  interviewController.updateInterviewStatus
);

// Reschedule interview
router.patch(
  "/:id/reschedule",
  auth,
  authorizeRoles("candidate", "employer"),
  interviewController.rescheduleInterview
);

// Cancel interview
router.patch(
  "/:id/cancel",
  auth,
  authorizeRoles("candidate", "employer"),
  interviewController.cancelInterview
);

// Get interview statistics
router.get(
  "/stats/summary",
  auth,
  authorizeRoles("candidate", "employer", "recruitment_partner"),
  interviewController.getInterviewStats
);

module.exports = router;
