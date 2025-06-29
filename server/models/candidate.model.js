const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  recruitmentPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RecruitmentPartner",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  resume: {
    type: String,
    required: true,
  },
  hasPreviousExperienceWithStateFarm: {
    type: Boolean,
    default: false,
  },
  hasPreviousInsuranceExperience: {
    type: Boolean,
    default: false,
  },
  isLicensedWithStateFarmTraining: {
    type: Boolean,
    default: false,
  },
  isLicensedWithBankingExperience: {
    type: Boolean,
    default: false,
  },
  isLicensedWithoutInsuranceExperience: {
    type: Boolean,
    default: false,
  },
  licenseType: {
    type: String,
    enum: ["P&C", "L&H", "All License", "Unlicensed Accepted", "Other"],
  },
  otherLicense: {
    type: String,
    trim: true,
  },
  languages: {
    type: [String],
    default: ["English"],
  },
  status: {
    type: String,
    enum: [
      "shortlist",
      "assessment",
      "phone_interview",
      "in_person_interview",
      "background_check",
      "selected",
      "rejected",
      "stand_by",
      "no_response",
    ],
    default: "shortlist",
  },
  interviewDate: {
    type: Date,
  },
  isSaved: {
    type: Boolean,
    default: false,
  },
  notes: [
    {
      round: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Candidate", candidateSchema);
