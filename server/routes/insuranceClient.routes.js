const express = require('express');
const { body, param } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const {
  getAllClients,
  getClientsByAgent,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  importClientsCSV
} = require('../controllers/insuranceClient.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

// Configure Cloudinary storage for CSV upload
const csvStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'csv-uploads', // Folder for CSV files
    allowedFormats: ['csv'],
    resource_type: 'raw', // Important: Use 'raw' for non-image files
  },
});

const upload = multer({
  storage: csvStorage,
  fileFilter: function (req, file, cb) {
    // Check file extension
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    // Check MIME type
    if (file.mimetype !== 'text/csv' && file.mimetype !== 'application/csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation rules for creating client
const createClientValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),
  
  body('agentId')
    .isMongoId()
    .withMessage('Valid agent ID is required'),
  
  body('status')
    .optional()
    .isIn(['pending', 'contacted', 'converted', 'declined'])
    .withMessage('Status must be one of: pending, contacted, converted, declined'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  body('lastPayment')
    .optional()
    .isISO8601()
    .withMessage('Last payment must be a valid date')
];

// Validation rules for updating client
const updateClientValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
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
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),
  
  body('status')
    .optional()
    .isIn(['pending', 'contacted', 'converted', 'declined'])
    .withMessage('Status must be one of: pending, contacted, converted, declined'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  body('lastPayment')
    .optional()
    .isISO8601()
    .withMessage('Last payment must be a valid date'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Agent ID validation
const agentIdValidation = [
  param('agentId')
    .isMongoId()
    .withMessage('Valid agent ID is required')
];

// Apply authentication and admin middleware to all routes
router.use(auth);
router.use(authorizeRoles('admin', 'sub_admin'));

// Routes
router.get('/', getAllClients);
router.get('/agent/:agentId', agentIdValidation, getClientsByAgent);
router.get('/:id', getClient);
router.post('/', createClientValidation, createClient);
router.put('/:id', updateClientValidation, updateClient);
router.delete('/:id', deleteClient);

// CSV import route
router.post('/agent/:agentId/import-csv', agentIdValidation, upload.single('csv'), importClientsCSV);

module.exports = router;
