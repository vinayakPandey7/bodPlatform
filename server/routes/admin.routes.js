const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const salesPersonController = require("../controllers/salesPerson.controller");
const { auth, authorizeRoles } = require("../middlewares/auth.middleware");
const { validateRequest } = require("../middlewares/validation.middleware");
const { body } = require("express-validator");

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

// Sales Person Management
const createSalesPersonValidation = [
  body("name")
    .notEmpty()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name is required and must be between 2 and 100 characters")
    .trim(),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone")
    .optional()
    .matches(/^[\+]?[\d\s\-\(\)\.]{10,}$/)
    .withMessage("Please provide a valid phone number"),
];

const updateSalesPersonValidation = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone")
    .optional()
    .matches(/^[\+]?[\d\s\-\(\)\.]{10,}$/)
    .withMessage("Please provide a valid phone number"),
];

router.get(
  "/sales-persons",
  salesPersonController.getAllSalesPersons
);
router.post(
  "/sales-persons",
  createSalesPersonValidation,
  validateRequest,
  salesPersonController.createSalesPerson
);
router.get(
  "/sales-persons/:id",
  salesPersonController.getSalesPersonById
);
router.put(
  "/sales-persons/:id",
  updateSalesPersonValidation,
  validateRequest,
  salesPersonController.updateSalesPerson
);
router.delete(
  "/sales-persons/:id",
  salesPersonController.deleteSalesPerson
);
router.post(
  "/sales-persons/:id/assign-agents",
  salesPersonController.assignAgents
);

module.exports = router;
