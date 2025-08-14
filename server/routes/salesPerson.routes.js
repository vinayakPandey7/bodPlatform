const express = require("express");
const router = express.Router();
const {
  getAllSalesPersons,
  createSalesPerson,
  getSalesPersonById,
  getMyProfile,
  updateProfile,
  assignAgents,
  getMyAgents,
  getAgentClients,
  updateClientCallStatus,
  updatePerformance,
  updateApprovalStatus,
  deleteSalesPerson,
} = require("../controllers/salesPerson.controller");

const { auth, authorizeRoles } = require("../middlewares/auth.middleware");
const { validateRequest } = require("../middlewares/validation.middleware");
const { body, param } = require("express-validator");

// Validation for creating a sales person
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
  body("phone")
    .optional()
    .matches(/^[\+]?[\d\s\-\(\)\.]{10,}$/)
    .withMessage("Please provide a valid phone number"),
  body("department")
    .optional()
    .isIn(["sales", "business_development", "account_management", "inside_sales"])
    .withMessage("Invalid department"),
];

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

// Validation for client call status update
const updateCallStatusValidation = [
  body("callStatus")
    .isIn(['not_called', 'called', 'skipped', 'unpicked'])
    .withMessage("Invalid call status"),
  body("remarks")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Remarks must be less than 500 characters")
    .trim(),
  body("callOutcome")
    .optional()
    .isIn(['answered', 'no_answer', 'callback_requested', 'not_interested', 'interested'])
    .withMessage("Invalid call outcome"),
  param("agentId")
    .isMongoId()
    .withMessage("Invalid agent ID"),
  param("clientId")
    .isMongoId()
    .withMessage("Invalid client ID"),
];

// Parameter validation
const idValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid sales person ID"),
];

// Admin-only routes
router.get("/", auth, authorizeRoles("admin"), getAllSalesPersons);
router.post("/", auth, authorizeRoles("admin"), createSalesPersonValidation, validateRequest, createSalesPerson);
router.get("/:id", auth, authorizeRoles("admin"), idValidation, validateRequest, getSalesPersonById);
router.post("/:id/assign-agents", auth, authorizeRoles("admin"), idValidation, assignAgentsValidation, validateRequest, assignAgents);
router.put("/:id/performance", auth, authorizeRoles("admin"), idValidation, updatePerformanceValidation, validateRequest, updatePerformance);
router.put("/:id/approval", auth, authorizeRoles("admin"), idValidation, updateApprovalValidation, validateRequest, updateApprovalStatus);
router.delete("/:id", auth, authorizeRoles("admin"), idValidation, validateRequest, deleteSalesPerson);

// Sales person routes (accessible by sales persons themselves)
router.get("/profile/me", auth, authorizeRoles("sales_person"), getMyProfile);
router.put("/profile/me", auth, authorizeRoles("sales_person"), updateProfileValidation, validateRequest, updateProfile);
router.get("/agents/me", auth, authorizeRoles("sales_person"), getMyAgents);
router.get("/agents/:agentId/clients", auth, authorizeRoles("sales_person"), param("agentId").isMongoId().withMessage("Invalid agent ID"), validateRequest, getAgentClients);
router.put("/agents/:agentId/clients/:clientId/call-status", auth, authorizeRoles("sales_person"), updateCallStatusValidation, validateRequest, updateClientCallStatus);

module.exports = router; 