const Joi = require("joi");
const { validationResult } = require("express-validator");

// Express-validator middleware for handling validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    next();
  };
};

// Auth validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("employer", "recruitment_partner").required(),
  employerData: Joi.when("role", {
    is: "employer",
    then: Joi.object({
      ownerName: Joi.string().required(),
      companyName: Joi.string().required(),
      email: Joi.string().email().required(),
      phoneNumber: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
    }),
    otherwise: Joi.forbidden(),
  }),
  recruitmentPartnerData: Joi.when("role", {
    is: "recruitment_partner",
    then: Joi.object({
      companyName: Joi.string().required(),
      contactPersonName: Joi.string().required(),
      contactPersonTitle: Joi.string().allow(""),
      phone: Joi.string().required(),
      website: Joi.string().uri().allow(""),
      address: Joi.string().allow(""),
      city: Joi.string().allow(""),
      state: Joi.string().allow(""),
      zipCode: Joi.string().allow(""),
      country: Joi.string().allow(""),
      yearsOfExperience: Joi.number().min(0).allow(null),
      specialization: Joi.string().allow(""),
    }),
    otherwise: Joi.forbidden(),
  }),
});

// Job validation schema
const jobSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  requirePreviousExperienceWithStateFarm: Joi.boolean(),
  requirePreviousInsuranceExperience: Joi.boolean(),
  requireLicensedCandidateWithStateFarmTraining: Joi.boolean(),
  acceptLicensedCandidateWithBankingExperience: Joi.boolean(),
  acceptLicensedCandidateWithoutInsuranceExperience: Joi.boolean(),
  jobRole: Joi.string().valid("full_time", "part_time").required(),
  workingDays: Joi.number().min(1).max(7),
  jobType: Joi.string().valid("work_from_office", "work_from_home").required(),
  workingDaysPerWeek: Joi.string(),
  payStructure: Joi.string().valid("monthly", "hourly").required(),
  payPerHour: Joi.number().min(0),
  payDay: Joi.string(),
  bonusCommission: Joi.string(),
  benefits: Joi.string(),
  languagePreference: Joi.array().items(
    Joi.string().valid(
      "English",
      "Hindi",
      "Spanish",
      "Portuguese",
      "Mandarin",
      "Russian",
      "Tagalo"
    )
  ),
  parkingFree: Joi.boolean(),
  serviceSalesFocus: Joi.string()
    .valid("service_focused", "sales_focused", "both")
    .required(),
  licenseRequirement: Joi.string()
    .valid("P&C", "L&H", "All License", "Unlicensed Accepted", "Other")
    .required(),
  otherLicenseRequirement: Joi.string(),
  startDate: Joi.date().required(),
  additionalInfo: Joi.string(),
  numberOfPositions: Joi.number().min(1).required(),
  recruitmentDuration: Joi.string()
    .valid(
      "7-10 Days IE",
      "15-20 Days TUE",
      "30 Days NE",
      "60 Days EE",
      "6 Months Ongoing Recruitment"
    )
    .required(),
  assessmentLink: Joi.string(),
  expires: Joi.date().required(),

  // Enhanced Licensed Candidate Search Requirements
  candidateType: Joi.array().items(
    Joi.string().valid(
      "previous_sf_experience",
      "previous_insurance_not_sf",
      "licensed_basic_training",
      "licensed_no_insurance_banking",
      "licensed_no_experience"
    )
  ),
  workSchedule: Joi.string().valid("full_time", "part_time"),
  partTimeWorkDays: Joi.array().items(
    Joi.string().valid(
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday"
    )
  ),
  officeRequirement: Joi.string().valid("yes", "no"),
  officeDetails: Joi.string(),
  remoteWorkDays: Joi.string(),
  remoteWorkPreferredDays: Joi.array().items(
    Joi.string().valid(
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday"
    )
  ),
  payStructureType: Joi.string().valid(
    "hourly",
    "salary",
    "commission",
    "base_plus_commission"
  ),
  hourlyPay: Joi.string(),
  payDays: Joi.string(),
  employeeBenefits: Joi.array().items(Joi.string()),
  freeParking: Joi.string().valid("yes", "no", "paid_parking"),
  roleType: Joi.string().valid("service_only", "sales_only", "mixed"),
  qualifications: Joi.array().items(Joi.string()),
  additionalRequirements: Joi.array().items(Joi.string()),

  // New standard fields
  requirements: Joi.array().items(Joi.string()),
  skills: Joi.array().items(Joi.string()),
  experience: Joi.string()
    .valid("0-1", "1-3", "3-5", "5-8", "8-12", "12+")
    .allow("")
    .optional(),
  zipCode: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  country: Joi.string(),
  workMode: Joi.string().valid("office", "remote", "hybrid"),
  salaryMin: Joi.number().min(0),
  salaryMax: Joi.number().min(0),
  currency: Joi.string(),
  department: Joi.string(),
  contactNumber: Joi.string()
    .required()
    .pattern(/^[\+]?[\d\s\-\(\)\.]{10,}$/)
    .message("Please provide a valid contact number (minimum 10 digits)"),
  urgency: Joi.string().valid("normal", "urgent", "very_urgent"),
});

// Candidate validation schema
const candidateSchema = Joi.object({
  job: Joi.string().required(),
  name: Joi.string().required(),
  phone: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  email: Joi.string().email().required(),
  address: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  resume: Joi.string().required(),
  hasPreviousExperienceWithStateFarm: Joi.boolean(),
  hasPreviousInsuranceExperience: Joi.boolean(),
  isLicensedWithStateFarmTraining: Joi.boolean(),
  isLicensedWithBankingExperience: Joi.boolean(),
  isLicensedWithoutInsuranceExperience: Joi.boolean(),
  licenseType: Joi.string().valid(
    "P&C",
    "L&H",
    "All License",
    "Unlicensed Accepted",
    "Other"
  ),
  otherLicense: Joi.string(),
  languages: Joi.array().items(Joi.string()),
});

// Profile validation schemas
const employerProfileSchema = Joi.object({
  ownerName: Joi.string(),
  companyName: Joi.string(),
  phoneNumber: Joi.string(),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  country: Joi.string(),
});

const recruitmentPartnerProfileSchema = Joi.object({
  ownerName: Joi.string(),
  companyName: Joi.string(),
  phoneNumber: Joi.string(),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  country: Joi.string(),
});

// Employer registration validation schema with mandatory US location
const employerRegistrationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  ownerName: Joi.string().trim().required().messages({
    "any.required": "Owner name is required",
  }),
  companyName: Joi.string().trim().required().messages({
    "any.required": "Company name is required",
  }),
  phoneNumber: Joi.string().trim().required().messages({
    "any.required": "Phone number is required",
  }),
  address: Joi.string().trim().required().messages({
    "any.required": "Address is required",
  }),
  city: Joi.string().trim().required().messages({
    "any.required": "City is required",
  }),
  state: Joi.string().trim().required().messages({
    "any.required": "State is required",
  }),
  zipCode: Joi.string()
    .pattern(/^\d{5}(-\d{4})?$/)
    .when("locationDetected", {
      is: false,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.pattern.base":
        "Please provide a valid US zip code (5 digits or 5-4 format)",
      "any.required":
        "Zip code is mandatory when location detection is not available",
    }),
  country: Joi.string()
    .valid("United States", "USA", "US")
    .default("United States")
    .messages({
      "any.only": "Only United States locations are supported",
    }),
  locationDetected: Joi.boolean().default(false),
});

module.exports = {
  validate,
  validateRequest,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  jobSchema,
  candidateSchema,
  employerProfileSchema,
  recruitmentPartnerProfileSchema,
  employerRegistrationSchema,
};
