const express = require("express");
const router = express.Router();
const {
  getClients,
  getClientStats,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientDashboard,
} = require("../controllers/client.controller");

const {
  auth: authMiddleware,
  authorizeRoles,
} = require("../middlewares/auth.middleware");
const { validateRequest } = require("../middlewares/validation.middleware");
const { body, param, query } = require("express-validator");

// Validation rules for creating/updating clients
const clientValidation = [
  body("companyName")
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters")
    .trim(),

  body("contactPerson")
    .notEmpty()
    .withMessage("Contact person is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Contact person name must be between 2 and 100 characters")
    .trim(),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters")
    .trim(),

  body("city")
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters")
    .trim(),

  body("state")
    .notEmpty()
    .withMessage("State is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters")
    .trim(),

  body("zipcode")
    .matches(/^\d{5}$/)
    .withMessage("Zipcode must be exactly 5 digits"),

  body("industry")
    .notEmpty()
    .withMessage("Industry is required")
    .isIn([
      "Technology",
      "Healthcare",
      "Finance",
      "Manufacturing",
      "Retail",
      "Education",
      "Real Estate",
      "Consulting",
      "Non-Profit",
      "Government",
      "Other",
    ])
    .withMessage("Please select a valid industry"),

  body("companySize")
    .notEmpty()
    .withMessage("Company size is required")
    .isIn(["1-10", "10-50", "50-100", "100-500", "500-1000", "1000+"])
    .withMessage("Please select a valid company size"),

  body("contractValue")
    .isNumeric()
    .withMessage("Contract value must be a number")
    .custom((value) => {
      const numValue = parseFloat(value);
      if (numValue < 1000 || numValue > 10000000) {
        throw new Error(
          "Contract value must be between $1,000 and $10,000,000"
        );
      }
      return true;
    }),

  body("contractStartDate")
    .isISO8601()
    .withMessage("Please provide a valid contract start date"),

  body("contractEndDate")
    .isISO8601()
    .withMessage("Please provide a valid contract end date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.contractStartDate)) {
        throw new Error("Contract end date must be after start date");
      }
      return true;
    }),

  body("paymentTerms")
    .notEmpty()
    .withMessage("Payment terms are required")
    .isIn(["Net 15", "Net 30", "Net 45", "Net 60", "Net 90", "Due on Receipt"])
    .withMessage("Please select valid payment terms"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["active", "inactive", "prospect"])
    .withMessage("Please select a valid status"),

  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters")
    .trim(),
];

// Validation for client ID parameter
const clientIdValidation = [
  param("id").isMongoId().withMessage("Invalid client ID format"),
];

// Validation for query parameters
const queryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(["all", "active", "inactive", "prospect"])
    .withMessage("Invalid status filter"),

  query("industry")
    .optional()
    .isIn([
      "all",
      "Technology",
      "Healthcare",
      "Finance",
      "Manufacturing",
      "Retail",
      "Education",
      "Real Estate",
      "Consulting",
      "Non-Profit",
      "Government",
      "Other",
    ])
    .withMessage("Invalid industry filter"),

  query("companySize")
    .optional()
    .isIn(["all", "1-10", "10-50", "50-100", "100-500", "500-1000", "1000+"])
    .withMessage("Invalid company size filter"),

  query("contractValue")
    .optional()
    .isIn(["all", "0-25k", "25k-50k", "50k-100k", "100k+"])
    .withMessage("Invalid contract value filter"),

  query("sortBy")
    .optional()
    .isIn([
      "companyName",
      "contactPerson",
      "contractValue",
      "createdAt",
      "lastActivity",
      "status",
    ])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];

// Apply authentication middleware to all routes
router.use(authMiddleware);
router.use(authorizeRoles("recruitment_partner"));

// Routes

// GET /clients/dashboard - Get client dashboard data
router.get("/dashboard", getClientDashboard);

// GET /clients/stats - Get client statistics
router.get("/stats", getClientStats);

// GET /clients - Get all clients with filtering and pagination
router.get("/", queryValidation, validateRequest, getClients);

// GET /clients/:id - Get a specific client by ID
router.get("/:id", clientIdValidation, validateRequest, getClientById);

// POST /clients - Create a new client
router.post("/", clientValidation, validateRequest, createClient);

// PUT /clients/:id - Update an existing client
router.put(
  "/:id",
  clientIdValidation,
  clientValidation,
  validateRequest,
  updateClient
);

// DELETE /clients/:id - Delete a client
router.delete("/:id", clientIdValidation, validateRequest, deleteClient);

module.exports = router;
