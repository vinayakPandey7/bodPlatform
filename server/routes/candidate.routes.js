const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidate.controller");
const { auth, authorizeRoles } = require("../middlewares/auth.middleware");

// Candidate user routes (for actual candidates)
router.get(
  "/dashboard",
  auth,
  authorizeRoles("candidate"),
  candidateController.getCandidateDashboard
);
router.get(
  "/profile",
  auth,
  authorizeRoles("candidate"),
  candidateController.getCandidateProfile
);
router.put(
  "/profile",
  auth,
  authorizeRoles("candidate"),
  candidateController.updateCandidateProfile
);
router.get(
  "/applications",
  auth,
  authorizeRoles("candidate"),
  candidateController.getCandidateApplications
);
router.get(
  "/saved-jobs",
  auth,
  authorizeRoles("candidate"),
  candidateController.getCandidateSavedJobs
);
router.post(
  "/save-job",
  auth,
  authorizeRoles("candidate"),
  candidateController.saveJob
);
router.post(
  "/unsave-job",
  auth,
  authorizeRoles("candidate"),
  candidateController.unsaveJob
);

// Recruitment Partner routes
router.post(
  "/apply",
  auth,
  authorizeRoles("recruitment_partner"),
  candidateController.submitApplication
);
router.get(
  "/my-candidates",
  auth,
  authorizeRoles("recruitment_partner"),
  candidateController.getPartnerCandidates
);

// Employer routes
router.put(
  "/:id/status",
  auth,
  authorizeRoles("employer"),
  candidateController.updateCandidateStatus
);
router.post(
  "/:id/notes",
  auth,
  authorizeRoles("employer"),
  candidateController.addCandidateNote
);
router.put(
  "/:id/save",
  auth,
  authorizeRoles("employer"),
  candidateController.saveCandidate
);
router.get(
  "/saved",
  auth,
  authorizeRoles("employer"),
  candidateController.getSavedCandidates
);

module.exports = router;
