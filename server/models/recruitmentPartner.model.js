const mongoose = require("mongoose");

// Function to validate US zip codes
function validateUSZipCode(zipCode) {
  const zipRegex = /^\d{5}(-\d{4})?$/; // 5 digits or 5-4 format
  return zipRegex.test(zipCode);
}

const recruitmentPartnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
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
  zipCode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: validateUSZipCode,
      message: "Invalid US zip code format. Use 5 digits (e.g., 12345) or 5+4 format (e.g., 12345-6789)",
    },
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  specializations: [{
    type: String,
    trim: true,
  }],
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("RecruitmentPartner", recruitmentPartnerSchema);
