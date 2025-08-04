const express = require("express");
const router = express.Router();
const {
  getAllSalesPersons,
  getSalesPersonById,
  getMyProfile,
  updateProfile,
  assignAgents,
  getMyAgents,
  updatePerformance,
  updateApprovalStatus,
  deleteSalesPerson,
} = require("../controllers/salesPerson.controller");

const { auth, authorizeRoles } = require("../middlewares/auth.middleware");
const { validateRequest } = require("../middlewares/validation.middleware");
const { body, param } = require("express-validator");

// Validation for profile update
const updateProfileValidation = [
  body("firstName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .trim(),
  body("lastName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .trim(),
  body("phoneNumber")
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),
  body("department")
    .optional()
    .isIn(["sales", "business_development", "account_management", "inside_sales"])
    .withMessage("Invalid department"),
  body("territory")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Territory must be less than 100 characters")
    .trim(),
];

// Validation for assigning agents
const assignAgentsValidation = [
  body("agents")
    .isArray({ min: 1 })
    .withMessage("Agents array is required and must contain at least one agent"),
  body("agents.*.agentId")
    .notEmpty()
    .withMessage("Agent ID is required"),
  body("agents.*.agentName")
    .notEmpty()
    .withMessage("Agent name is required"),
  body("agents.*.agentEmail")
    .isEmail()
    .withMessage("Valid agent email is required"),
];

// Validation for performance update
const updatePerformanceValidation = [
  body("callsMade")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Calls made must be a non-negative integer"),
  body("clientsContacted")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Clients contacted must be a non-negative integer"),
  body("salesClosed")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sales closed must be a non-negative integer"),
  body("commission")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Commission must be a non-negative number"),
];

// Validation for approval status
const updateApprovalValidation = [
  body("isApproved")
    .isBoolean()
    .withMessage("Approval status must be a boolean"),
];

// Parameter validation
const idValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid sales person ID"),
];

// Admin-only routes
router.get("/", auth, authorizeRoles("admin"), getAllSalesPersons);
router.get("/:id", auth, authorizeRoles("admin"), idValidation, validateRequest, getSalesPersonById);
router.post("/:id/assign-agents", auth, authorizeRoles("admin"), idValidation, assignAgentsValidation, validateRequest, assignAgents);
router.put("/:id/performance", auth, authorizeRoles("admin"), idValidation, updatePerformanceValidation, validateRequest, updatePerformance);
router.put("/:id/approval", auth, authorizeRoles("admin"), idValidation, updateApprovalValidation, validateRequest, updateApprovalStatus);
router.delete("/:id", auth, authorizeRoles("admin"), idValidation, validateRequest, deleteSalesPerson);

// Sales person routes (accessible by sales persons themselves)
router.get("/profile/me", auth, authorizeRoles("sales_person"), getMyProfile);
router.put("/profile/me", auth, authorizeRoles("sales_person"), updateProfileValidation, validateRequest, updateProfile);
router.get("/agents/me", auth, authorizeRoles("sales_person"), getMyAgents);

module.exports = router; 