const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidate.controller");
const { auth, authorizeRoles } = require("../middlewares/auth.middleware");

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
