const mongoose = require("mongoose");

// Function to validate US zip codes
function validateUSZipCode(zipCode) {
  const zipRegex = /^\d{5}(-\d{4})?$/; // 5 digits or 5-4 format
  return zipRegex.test(zipCode);
}

const jobSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: function () {
      return this.postedBy === "employer";
    },
  },
  recruitmentPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RecruitmentPartner",
    required: function () {
      return this.postedBy === "recruitment_partner";
    },
  },
  postedBy: {
    type: String,
    enum: ["employer", "recruitment_partner"],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String],
    default: [],
  },
  skills: {
    type: [String],
    default: [],
  },
  experience: {
    type: String,
    enum: ["", "0-1", "1-3", "3-5", "5-8", "8-12", "12+"],
    default: "",
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  // New mandatory location fields for US-specific requirements
  zipCode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: validateUSZipCode,
      message: "Please provide a valid US zip code (5 digits or 5-4 format)",
    },
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: "United States",
    validate: {
      validator: function (country) {
        return (
          country === "United States" || country === "USA" || country === "US"
        );
      },
      message: "Only United States locations are supported",
    },
  },
  // Geolocation data for distance calculations
  geoLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  jobType: {
    type: String,
    enum: ["full_time", "part_time", "contract", "freelance", "internship"],
    required: true,
  },
  workMode: {
    type: String,
    enum: ["office", "remote", "hybrid"],
    required: true,
  },
  salaryMin: {
    type: Number,
  },
  salaryMax: {
    type: Number,
  },
  currency: {
    type: String,
    enum: ["USD", "EUR", "GBP", "INR", "CAD", "AUD"],
    default: "USD",
  },
  benefits: {
    type: [String],
    default: [],
  },
  department: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (contactNumber) {
        // Basic phone number validation (allows various formats)
        const phoneRegex = /^[\+]?[\d\s\-\(\)\.]{10,}$/;
        return phoneRegex.test(contactNumber);
      },
      message: "Please provide a valid contact number (minimum 10 digits)",
    },
  },
  urgency: {
    type: String,
    enum: ["normal", "urgent", "very_urgent"],
    default: "normal",
  },
  // Legacy fields for backward compatibility
  requirePreviousExperienceWithStateFarm: {
    type: Boolean,
    default: false,
  },
  requirePreviousInsuranceExperience: {
    type: Boolean,
    default: false,
  },
  requireLicensedCandidateWithStateFarmTraining: {
    type: Boolean,
    default: false,
  },
  acceptLicensedCandidateWithBankingExperience: {
    type: Boolean,
    default: false,
  },
  acceptLicensedCandidateWithoutInsuranceExperience: {
    type: Boolean,
    default: false,
  },
  jobRole: {
    type: String,
    enum: ["full_time", "part_time"],
  },
  workingDays: {
    type: Number,
  },
  legacyJobType: {
    type: String,
    enum: ["work_from_office", "work_from_home"],
  },
  workingDaysPerWeek: {
    type: String,
    trim: true,
  },
  payStructure: {
    type: String,
    enum: ["monthly", "hourly"],
  },
  payPerHour: {
    type: Number,
  },
  payDay: {
    type: String,
    trim: true,
  },
  bonusCommission: {
    type: String,
    trim: true,
  },
  legacyBenefits: {
    type: String,
    trim: true,
  },
  languagePreference: {
    type: [String],
    enum: [
      "English",
      "Hindi",
      "Spanish",
      "Portuguese",
      "Mandarin",
      "Russian",
      "Tagalo",
    ],
    default: ["English"],
  },
  parkingFree: {
    type: Boolean,
    default: false,
  },
  serviceSalesFocus: {
    type: String,
    enum: ["service_focused", "sales_focused", "both"],
  },
  licenseRequirement: {
    type: String,
    enum: ["P&C", "L&H", "All License", "Unlicensed Accepted", "Other"],
  },
  otherLicenseRequirement: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
  },
  additionalInfo: {
    type: String,
    trim: true,
  },
  numberOfPositions: {
    type: Number,
    default: 1,
  },
  positionsFilled: {
    type: Number,
    default: 0,
  },
  recruitmentDuration: {
    type: String,
    enum: [
      "7-10 Days IE",
      "15-20 Days TUE",
      "30 Days NE",
      "60 Days EE",
      "6 Months Ongoing Recruitment",
    ],
  },
  assessmentLink: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "closed", "hold"],
    default: "active",
  },
  expires: {
    type: Date,
  },
  isApproved: {
    type: Boolean,
    default: true, // Auto-approve all jobs by default
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  // Enhanced Licensed Candidate Search Requirements
  candidateType: {
    type: [String],
    enum: [
      "previous_sf_experience",
      "previous_insurance_not_sf",
      "licensed_basic_training",
      "licensed_no_insurance_banking",
      "licensed_no_experience",
    ],
    default: [],
  },
  workSchedule: {
    type: String,
    enum: {
      values: ["full_time", "part_time"],
      message: "{VALUE} is not a valid work schedule",
    },
    validate: {
      validator: function (v) {
        return !v || v === "full_time" || v === "part_time";
      },
      message: 'Work schedule must be "full_time", "part_time" or empty',
    },
  },
  partTimeWorkDays: {
    type: [String],
    enum: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
    default: [],
  },
  officeRequirement: {
    type: String,
    enum: {
      values: ["yes", "no"],
      message: "{VALUE} is not a valid office requirement",
    },
    validate: {
      validator: function (v) {
        return !v || v === "yes" || v === "no";
      },
      message: 'Office requirement must be "yes" or "no" or empty',
    },
  },
  officeDetails: {
    type: String,
    trim: true,
  },
  remoteWorkDays: {
    type: String,
    trim: true,
  },
  remoteWorkPreferredDays: {
    type: [String],
    enum: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
    default: [],
  },
  payStructureType: {
    type: String,
    enum: {
      values: ["hourly", "salary", "commission", "base_plus_commission"],
      message: "{VALUE} is not a valid pay structure type",
    },
    validate: {
      validator: function (v) {
        return (
          !v ||
          v === "hourly" ||
          v === "salary" ||
          v === "commission" ||
          v === "base_plus_commission"
        );
      },
      message:
        'Pay structure type must be "hourly", "salary", "commission", "base_plus_commission" or empty',
    },
  },
  hourlyPay: {
    type: String,
    trim: true,
  },
  payDays: {
    type: String,
    trim: true,
  },
  employeeBenefits: {
    type: [String],
    default: [],
  },
  freeParking: {
    type: String,
    enum: {
      values: ["yes", "no", "paid_parking"],
      message: "{VALUE} is not a valid parking option",
    },
    validate: {
      validator: function (v) {
        return !v || v === "yes" || v === "no" || v === "paid_parking";
      },
      message: 'Free parking must be "yes", "no", "paid_parking" or empty',
    },
  },
  roleType: {
    type: String,
    enum: {
      values: ["service_only", "sales_only", "mixed"],
      message: "{VALUE} is not a valid role type",
    },
    validate: {
      validator: function (v) {
        return (
          !v || v === "service_only" || v === "sales_only" || v === "mixed"
        );
      },
      message:
        'Role type must be "service_only", "sales_only", "mixed" or empty',
    },
  },
  qualifications: {
    type: [String],
    default: [],
  },
  additionalRequirements: {
    type: [String],
    default: [],
  },
});

// Create geospatial index for location-based queries
jobSchema.index({ geoLocation: "2dsphere" });

module.exports = mongoose.model("Job", jobSchema);
