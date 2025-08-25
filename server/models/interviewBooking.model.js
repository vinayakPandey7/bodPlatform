const mongoose = require("mongoose");

const interviewBookingSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  availabilitySlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AvailabilitySlot",
    required: true,
  },
  recruitmentPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RecruitmentPartner",
    required: false, // Optional if candidate applied directly
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    required: true, // Reference to the application ID within the candidate's applications array
  },
  bookingToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed", "expired"],
    default: "pending",
  },
  candidateDetails: {
    name: {
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
    phone: {
      type: String,
      trim: true,
    },
  },
  interviewDetails: {
    type: {
      type: String,
      enum: ["video", "phone", "in-person"],
      required: true,
    },
    location: String,
    videoLink: String,
    phoneNumber: String,
    instructions: String,
  },
  scheduledDateTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    default: 60,
  },
  timezone: {
    type: String,
    required: true,
    default: "America/New_York",
  },
  notes: {
    candidate: {
      type: String,
      trim: true,
    },
    employer: {
      type: String,
      trim: true,
    },
    internal: {
      type: String,
      trim: true,
    },
  },
  emailSent: {
    invitation: {
      type: Date,
      default: null,
    },
    confirmation: {
      type: Date,
      default: null,
    },
    reminder: {
      type: Date,
      default: null,
    },
  },
  tokenExpiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // MongoDB TTL index
  },
  bookedAt: {
    type: Date,
    default: null,
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

// Compound indexes for efficient queries
interviewBookingSchema.index({ candidate: 1, job: 1 });
interviewBookingSchema.index({ employer: 1, scheduledDateTime: 1 });
interviewBookingSchema.index({ availabilitySlot: 1, status: 1 });
interviewBookingSchema.index({ bookingToken: 1, status: 1 });

// Virtual for checking if booking is active
interviewBookingSchema.virtual('isActive').get(function() {
  return this.status === 'confirmed' && 
         this.scheduledDateTime > new Date() &&
         this.tokenExpiresAt > new Date();
});

// Virtual for checking if booking is expired
interviewBookingSchema.virtual('isExpired').get(function() {
  return this.tokenExpiresAt <= new Date() || 
         (this.status === 'pending' && this.scheduledDateTime <= new Date());
});

// Method to generate booking URL
interviewBookingSchema.methods.generateBookingUrl = function(baseUrl = 'http://localhost:3000') {
  return `${baseUrl}/recruitment-partner/interview-booking?token=${this.bookingToken}`;
};

// Method to mark as expired
interviewBookingSchema.methods.markAsExpired = function() {
  this.status = 'expired';
  this.updatedAt = new Date();
  return this.save();
};

// Pre-save middleware to update updatedAt
interviewBookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // If booking is being confirmed, set bookedAt timestamp
  if (this.isModified('status') && this.status === 'confirmed' && !this.bookedAt) {
    this.bookedAt = new Date();
  }
  
  next();
});

// Static method to find by token
interviewBookingSchema.statics.findByToken = function(token) {
  return this.findOne({ 
    bookingToken: token,
    tokenExpiresAt: { $gt: new Date() }
  }).populate([
    {
      path: 'candidate',
      select: 'firstName lastName email phoneNumber'
    },
    {
      path: 'employer',
      select: 'companyName email phoneNumber'
    },
    {
      path: 'job',
      select: 'title location jobType salaryRange'
    },
    {
      path: 'availabilitySlot',
      select: 'date startTime endTime duration meetingType meetingDetails'
    }
  ]);
};

// Static method to cleanup expired bookings
interviewBookingSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      status: 'pending',
      tokenExpiresAt: { $lte: new Date() }
    },
    {
      status: 'expired',
      updatedAt: new Date()
    }
  );
};

module.exports = mongoose.model("InterviewBooking", interviewBookingSchema);
