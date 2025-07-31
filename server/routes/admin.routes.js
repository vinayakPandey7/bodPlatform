const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { auth, authorizeRoles } = require("../middlewares/auth.middleware");

// Profile Management
router.get(
  "/profile",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.getProfile
);
router.put(
  "/profile",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.updateProfile
);

// Dashboard
router.get(
  "/dashboard",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.getDashboardStats
);

// Employer Management
router.get(
  "/employers",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.getEmployers
);
router.post(
  "/employers",
  auth,
  authorizeRoles("admin"),
  adminController.createEmployer
);
router.put(
  "/employers/:id",
  auth,
  authorizeRoles("admin"),
  adminController.updateEmployer
);
router.delete(
  "/employers/:id",
  auth,
  authorizeRoles("admin"),
  adminController.deleteEmployer
);
router.put(
  "/employers/:id/approve",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.approveEmployer
);
router.delete(
  "/employers/:id/reject",
  auth,
  authorizeRoles("admin"),
  adminController.rejectEmployer
);

// Recruitment Partner Management
router.get(
  "/recruitment-partners",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.getRecruitmentPartners
);
router.post(
  "/recruitment-partners",
  auth,
  authorizeRoles("admin"),
  adminController.createRecruitmentPartner
);
router.put(
  "/recruitment-partners/:id",
  auth,
  authorizeRoles("admin"),
  adminController.updateRecruitmentPartner
);
router.put(
  "/recruitment-partners/:id/approve",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.approveRecruitmentPartner
);
router.delete(
  "/recruitment-partners/:id",
  auth,
  authorizeRoles("admin"),
  adminController.deleteRecruitmentPartner
);

// Job Management
router.get(
  "/jobs",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.getAllJobs
);
router.get(
  "/job-requests",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.getJobRequests
);
router.put(
  "/jobs/:id/approve",
  auth,
  authorizeRoles("admin"),
  adminController.approveJob
);
router.delete(
  "/jobs/:id/reject",
  auth,
  authorizeRoles("admin"),
  adminController.rejectJob
);
router.put(
  "/jobs/:id/toggle-active",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.toggleJobActive
);

// Candidate Management
router.get(
  "/candidates",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.getCandidates
);
router.get(
  "/candidates/:id",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.getCandidateById
);
router.put(
  "/candidates/:id/status",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.updateCandidateStatus
);
router.delete(
  "/candidates/:id",
  auth,
  authorizeRoles("admin"),
  adminController.deleteCandidate
);

// Notification Management
router.get(
  "/notifications",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.getAllNotifications
);
router.put(
  "/notifications/:id/read",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.markNotificationAsRead
);
router.put(
  "/notifications/mark-all-read",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.markAllNotificationsAsRead
);
router.delete(
  "/notifications/:id",
  auth,
  authorizeRoles("admin", "sub_admin"),
  adminController.deleteNotification
);

module.exports = router;
