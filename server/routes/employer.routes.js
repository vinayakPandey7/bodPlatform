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
router.get(
  "/candidates/:candidateId/profile",
  auth,
  authorizeRoles("employer"),
  employerController.getCandidateProfile
);
router.put(
  "/candidates/:candidateId/save",
  auth,
  authorizeRoles("employer"),
  employerController.saveCandidateForEmployer
);
router.get(
  "/saved-candidates",
  auth,
  authorizeRoles("employer"),
  employerController.getSavedCandidatesForEmployer
);

// Notes management routes
router.post(
  "/candidates/:candidateId/applications/:applicationId/notes",
  auth,
  authorizeRoles("employer"),
  employerController.addNoteToApplication
);
router.get(
  "/candidates/:candidateId/applications/:applicationId/notes",
  auth,
  authorizeRoles("employer"),
  employerController.getApplicationNotes
);
router.put(
  "/candidates/:candidateId/applications/:applicationId/notes/:noteId",
  auth,
  authorizeRoles("employer"),
  employerController.updateApplicationNote
);
router.delete(
  "/candidates/:candidateId/applications/:applicationId/notes/:noteId",
  auth,
  authorizeRoles("employer"),
  employerController.deleteApplicationNote
);

// Interview scheduling routes
router.post(
  "/availability",
  auth,
  authorizeRoles("employer"),
  employerController.setAvailability
);
router.get(
  "/availability",
  auth,
  authorizeRoles("employer"),
  employerController.getAvailability
);
router.get(
  "/interviews/calendar",
  auth,
  authorizeRoles("employer"),
  employerController.getInterviewCalendar
);
router.put(
  "/interviews/:bookingId/status",
  auth,
  authorizeRoles("employer"),
  employerController.updateInterviewStatus
);
router.post(
  "/interviews/send-invitation",
  auth,
  authorizeRoles("employer"),
  employerController.sendInterviewInvitation
);

// Test email route (for debugging)
router.post(
  "/test-email",
  auth,
  authorizeRoles("employer"),
  employerController.testEmail
);

module.exports = router;
