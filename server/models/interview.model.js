const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
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
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RecruitmentPartner",
    required: false, // Some interviews might be direct employer-candidate
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
  scheduledDate: {
    type: Date,
    required: true,
  },
  scheduledTime: {
    type: String, // Format: "09:00"
    required: true,
    validate: {
      validator: function(time) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: "Scheduled time must be in HH:MM format (24-hour)",
    },
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    default: 60,
    min: 15,
    max: 480,
  },
  timezone: {
    type: String,
    required: true,
    default: "America/New_York",
  },
  status: {
    type: String,
    enum: [
      "scheduled",
      "confirmed", 
      "in_progress",
      "completed",
      "cancelled_by_candidate",
      "cancelled_by_employer",
      "no_show_candidate",
      "no_show_employer",
      "rescheduled"
    ],
    default: "scheduled",
  },
  meetingDetails: {
    type: {
      type: String,
      enum: ["video", "phone", "in-person"],
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    videoLink: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
  },
  interviewType: {
    type: String,
    enum: [
      "screening",
      "technical",
      "behavioral",
      "panel",
      "final",
      "hr",
      "cultural_fit"
    ],
    default: "screening",
  },
  interviewers: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      trim: true,
    },
  }],
  candidateNotes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  employerNotes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    recommendation: {
      type: String,
      enum: ["hire", "maybe", "no_hire", "pending"],
    },
    strengths: [{
      type: String,
      trim: true,
    }],
    improvements: [{
      type: String,
      trim: true,
    }],
    nextSteps: {
      type: String,
      trim: true,
    },
  },
  reminders: {
    candidate: {
      sent24h: { type: Boolean, default: false },
      sent1h: { type: Boolean, default: false },
      sent15m: { type: Boolean, default: false },
    },
    employer: {
      sent24h: { type: Boolean, default: false },
      sent1h: { type: Boolean, default: false },
      sent15m: { type: Boolean, default: false },
    },
  },
  rescheduleHistory: [{
    previousDate: Date,
    previousTime: String,
    newDate: Date,
    newTime: String,
    reason: String,
    rescheduledBy: {
      type: String,
      enum: ["candidate", "employer"],
    },
    rescheduledAt: {
      type: Date,
      default: Date.now,
    },
  }],
  cancellationReason: {
    type: String,
    trim: true,
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
  confirmedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
});

// Compound indexes for efficient queries
interviewSchema.index({ candidate: 1, scheduledDate: 1 });
interviewSchema.index({ employer: 1, scheduledDate: 1 });
interviewSchema.index({ recruiter: 1, scheduledDate: 1 });
interviewSchema.index({ job: 1, scheduledDate: 1 });
interviewSchema.index({ status: 1, scheduledDate: 1 });
interviewSchema.index({ availabilitySlot: 1 });

// Virtual for getting full scheduled datetime
interviewSchema.virtual('scheduledDateTime').get(function() {
  const date = new Date(this.scheduledDate);
  const [hours, minutes] = this.scheduledTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
});

// Virtual for checking if interview is upcoming
interviewSchema.virtual('isUpcoming').get(function() {
  return this.scheduledDateTime > new Date() && 
         ['scheduled', 'confirmed'].includes(this.status);
});

// Virtual for checking if interview can be rescheduled
interviewSchema.virtual('canReschedule').get(function() {
  const now = new Date();
  const interviewTime = this.scheduledDateTime;
  const hoursUntilInterview = (interviewTime - now) / (1000 * 60 * 60);
  
  return hoursUntilInterview > 2 && // At least 2 hours notice
         ['scheduled', 'confirmed'].includes(this.status);
});

// Method to check if interview conflicts with another interview
interviewSchema.methods.conflictsWith = function(otherInterview) {
  if (this.scheduledDate.toDateString() !== otherInterview.scheduledDate.toDateString()) {
    return false;
  }
  
  const thisStart = this.scheduledTime;
  const thisEnd = this.getEndTime();
  const otherStart = otherInterview.scheduledTime;
  const otherEnd = otherInterview.getEndTime();
  
  return (thisStart < otherEnd && thisEnd > otherStart);
};

// Method to get end time based on duration
interviewSchema.methods.getEndTime = function() {
  const [hours, minutes] = this.scheduledTime.split(':');
  const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
  const endMinutes = startMinutes + this.duration;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
};

// Pre-save middleware to update timestamps
interviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set confirmation timestamp when status changes to confirmed
  if (this.isModified('status') && this.status === 'confirmed' && !this.confirmedAt) {
    this.confirmedAt = new Date();
  }
  
  // Set completion timestamp when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Set cancellation timestamp when status changes to cancelled
  if (this.isModified('status') && this.status.includes('cancelled') && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model("Interview", interviewSchema);
