const mongoose = require("mongoose");

const availabilitySlotSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    default: "Interview Slot",
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // Format: "09:00"
    required: true,
    validate: {
      validator: function(time) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: "Start time must be in HH:MM format (24-hour)",
    },
  },
  endTime: {
    type: String, // Format: "10:00"
    required: true,
    validate: {
      validator: function(time) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: "End time must be in HH:MM format (24-hour)",
    },
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    default: 60,
    min: 15,
    max: 480, // 8 hours max
  },
  timezone: {
    type: String,
    required: true,
    default: "America/New_York",
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: function() {
        return this.isRecurring;
      },
    },
    daysOfWeek: [{
      type: Number,
      min: 0, // Sunday
      max: 6, // Saturday
    }],
    endDate: {
      type: Date,
      required: function() {
        return this.isRecurring;
      },
    },
  },
  status: {
    type: String,
    enum: ["available", "booked", "cancelled"],
    default: "available",
  },
  maxBookings: {
    type: Number,
    default: 1,
    min: 1,
  },
  currentBookings: {
    type: Number,
    default: 0,
    min: 0,
  },
  meetingType: {
    type: String,
    enum: ["video", "phone", "in-person"],
    default: "video",
  },
  meetingDetails: {
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
  bufferTime: {
    before: {
      type: Number, // Minutes before the slot
      default: 0,
      min: 0,
      max: 60,
    },
    after: {
      type: Number, // Minutes after the slot
      default: 0,
      min: 0,
      max: 60,
    },
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
});

// Compound index for efficient queries
availabilitySlotSchema.index({ employer: 1, date: 1, startTime: 1 });
availabilitySlotSchema.index({ employer: 1, status: 1, date: 1 });
availabilitySlotSchema.index({ date: 1, status: 1 });

// Virtual for checking if slot is bookable
availabilitySlotSchema.virtual('isBookable').get(function() {
  return this.status === 'available' && 
         this.currentBookings < this.maxBookings && 
         this.isActive &&
         new Date(this.date) >= new Date().setHours(0, 0, 0, 0);
});

// Method to check if slot conflicts with another slot
availabilitySlotSchema.methods.conflictsWith = function(otherSlot) {
  if (this.date.toDateString() !== otherSlot.date.toDateString()) {
    return false;
  }
  
  const thisStart = this.startTime;
  const thisEnd = this.endTime;
  const otherStart = otherSlot.startTime;
  const otherEnd = otherSlot.endTime;
  
  return (thisStart < otherEnd && thisEnd > otherStart);
};

// Pre-save middleware to update updatedAt
availabilitySlotSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("AvailabilitySlot", availabilitySlotSchema);
