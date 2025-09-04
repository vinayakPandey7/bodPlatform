const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [
      "admin",
      "employer",
      "recruitment_partner",
      "sub_admin",
      "candidate",
      "sales_person",
    ],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Admin profile fields
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  permissions: [
    {
      type: String,
    },
  ],

  // Candidate profile fields
  zipCode: {
    type: String,
    trim: true,
    validate: {
      validator: function (zipCode) {
        // Only validate if user is candidate and zipCode is provided
        if (this.role === "candidate" && zipCode) {
          return /^\d{5}$/.test(zipCode);
        }
        return true;
      },
      message: "Please provide a valid US zip code (5 digits)",
    },
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
    default: "United States",
  },
  // Geolocation data for distance calculations
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

  // Saved jobs for candidates
  savedJobs: [
    {
      job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
      savedAt: {
        type: Date,
        default: Date.now,
      },
      priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      applied: {
        type: Boolean,
        default: false,
      },
      matchScore: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
  ],

  // Applications for candidates
  applications: [
    {
      job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: [
          "pending",
          "reviewing",
          "shortlisted",
          "assessment",
          "phone_interview",
          "in_person_interview",
          "background_check",
          "hired",
          "rejected",
          "withdrawn",
        ],
        default: "pending",
      },
      coverLetter: String,
      customFields: [
        {
          question: String,
          answer: String,
        },
      ],
      // Employer notes/remarks for this specific application
      employerNotes: [
        {
          note: {
            type: String,
            required: true,
          },
          addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          addedByName: {
            type: String,
            required: true,
          },
          interviewRound: {
            type: String,
            enum: [
              "initial_review",
              "phone_screening",
              "phone_interview",
              "technical_assessment",
              "in_person_interview",
              "final_interview",
              "background_check",
              "reference_check",
              "general",
              "other",
            ],
            default: "general",
          },
          rating: {
            type: Number,
            min: 1,
            max: 5,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          updatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  ],

  // Comprehensive candidate profile data
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    location: String,
    zipCode: String,
    gender: String,
    headline: String,
    summary: String,
    profilePicture: {
      cloudinaryUrl: String,
      publicId: String,
      originalName: String,
      fileSize: String,
      uploadDate: Date,
    },
  },

  experience: [
    {
      id: String,
      title: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      current: {
        type: Boolean,
        default: false,
      },
      description: String,
    },
  ],

  education: [
    {
      id: String,
      degree: String,
      school: String,
      location: String,
      startDate: String,
      endDate: String,
      gpa: String,
      description: String,
    },
  ],

  skills: [
    {
      id: String,
      name: String,
      level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "expert"],
        default: "beginner",
      },
      years: {
        type: Number,
        default: 0,
      },
    },
  ],

  socialLinks: {
    website: String,
    linkedin: String,
    github: String,
    portfolio: String,
  },

  preferences: {
    jobType: String,
    salaryRange: {
      min: Number,
      max: Number,
    },
    remote: Boolean,
    willingToRelocate: Boolean,
    availableStartDate: String,
  },

  resume: {
    fileName: String,
    originalName: String,
    uploadDate: Date,
    fileSize: String,
    url: String,
    cloudinaryUrl: String,
    cloudinaryPublicId: String,
    storageType: {
      type: String,
      enum: ["local", "cloudinary"],
      default: "cloudinary",
    },
  },

  lastLogin: {
    type: Date,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Track which recruitment partner added this candidate (if applicable)
  addedByRecruitmentPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RecruitmentPartner",
    sparse: true,
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

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create geospatial index for location-based queries (for candidates)
userSchema.index({ location: "2dsphere" }, { sparse: true });

module.exports = mongoose.model("User", userSchema);
