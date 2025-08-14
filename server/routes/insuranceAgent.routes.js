const express = require('express');
const { body } = require('express-validator');
const {
  getInsuranceAgents,
  getInsuranceAgent,
  createInsuranceAgent,
  updateInsuranceAgent,
  deleteInsuranceAgent,
  toggleAgentStatus
} = require('../controllers/insuranceAgent.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

// Validation rules for creating insurance agent
const createInsuranceAgentValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters')
];

// Validation rules for updating insurance agent
const updateInsuranceAgentValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Apply authentication and admin middleware to all routes
router.use(auth);
router.use(authorizeRoles('admin', 'sub_admin'));

// Routes
router.get('/', getInsuranceAgents);
router.get('/:id', getInsuranceAgent);
router.post('/', createInsuranceAgentValidation, createInsuranceAgent);
router.put('/:id', updateInsuranceAgentValidation, updateInsuranceAgent);
router.patch('/:id/toggle-status', toggleAgentStatus);
router.delete('/:id', deleteInsuranceAgent);

module.exports = router;
