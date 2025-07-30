const mongoose = require("mongoose");

// Function to validate US zip codes
function validateUSZipCode(zipCode) {
  const zipRegex = /^\d{5}(-\d{4})?$/; // 5 digits or 5-4 format
  return zipRegex.test(zipCode);
}

const employerSchema = new mongoose.Schema({
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
    required: function () {
      // Zip code is required only when location is not detected via GPS
      return !this.locationDetected;
    },
    trim: true,
    validate: {
      validator: function (zipCode) {
        // If zip code is provided, validate it
        if (zipCode && zipCode.trim() !== "") {
          return validateUSZipCode(zipCode);
        }
        // If location is detected and no zip code provided, that's okay
        if (this.locationDetected && (!zipCode || zipCode.trim() === "")) {
          return true;
        }
        // If location is not detected, zip code is required
        return !(!this.locationDetected && (!zipCode || zipCode.trim() === ""));
      },
      message:
        "Please provide a valid US zip code (5 digits) when location detection is not available",
    },
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
  // Geolocation data
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  locationDetected: {
    type: Boolean,
    default: false,
  },
  jobPosting: {
    type: String,
    enum: ["automatic", "manual"],
    default: "manual",
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  savedCandidates: [
    {
      candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      savedAt: {
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

// Create geospatial index for location-based queries
employerSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Employer", employerSchema);
