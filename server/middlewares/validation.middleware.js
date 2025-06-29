const Joi = require("joi");

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
      companyName: Joi.string().required(),
      contactPersonName: Joi.string().required(),
      contactPersonTitle: Joi.string().allow(""),
      phone: Joi.string().required(),
      website: Joi.string().uri().allow(""),
      industry: Joi.string().allow(""),
      companySize: Joi.string().allow(""),
      address: Joi.string().allow(""),
      city: Joi.string().allow(""),
      state: Joi.string().allow(""),
      zipCode: Joi.string().allow(""),
      country: Joi.string().allow(""),
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

module.exports = {
  validate,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  jobSchema,
  candidateSchema,
  employerProfileSchema,
  recruitmentPartnerProfileSchema,
};
