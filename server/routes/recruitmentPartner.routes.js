const express = require("express");
const router = express.Router();
const recruitmentPartnerController = require("../controllers/recruitmentPartner.controller");
const { auth, authorizeRoles } = require("../middlewares/auth.middleware");

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

module.exports = router;
