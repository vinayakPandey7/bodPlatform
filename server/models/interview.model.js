const mongoose = require("mongoose");

// Interview slot schema for employer availability
const interviewSlotSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // Format: "HH:MM" (24-hour)
    required: true,
  },
  endTime: {
    type: String, // Format: "HH:MM" (24-hour)
    required: true,
  },
  googleMeetLink: {
    type: String,
    default: null
  },
  persistentMeetLink: {
    type: String,
    default: null
  },
  timezone: {
    type: String,
    default: "America/New_York",
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  maxCandidates: {
    type: Number,
    default: 1, // Allow multiple candidates per slot
  },
  currentBookings: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Interview booking schema
const interviewBookingSchema = new mongoose.Schema({
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewSlot",
    required: true,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recruitmentPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RecruitmentPartner",
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  candidateName: {
    type: String,
    required: true,
  },
  candidateEmail: {
    type: String,
    required: true,
  },
  candidatePhone: {
    type: String,
  },
  bookingToken: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
  },
  status: {
    type: String,
    enum: ["scheduled", "confirmed", "completed", "cancelled", "no_show"],
    default: "scheduled",
  },
  interviewType: {
    type: String,
    enum: ["phone", "video", "in_person"],
    default: "video",
  },
  meetingLink: {
    type: String,
  },
  googleCalendarEventId: {
    type: String,
    index: true,
  },
  googleCalendarSynced: {
    type: Boolean,
    default: false,
  },
  googleMeetDetails: {
    meetLink: {
      type: String,
    },
    meetId: {
      type: String,
    },
    htmlLink: {
      type: String,
    },
    eventData: {
      type: Object,
    }
  },
  googleCalendarAccountType: {
    type: String,
    enum: ["admin", "noreply"],
    default: "noreply",
  },
  notes: {
    type: String,
  },
  participants: [{
    type: String,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email format for participant'
    }
  }],
  scheduledAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Interview invitation schema for tracking sent invitations
const interviewInvitationSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewBooking",
    required: true,
  },
  invitationToken: {
    type: String,
    required: true,
    unique: true,
  },
  candidateEmail: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["sent", "opened", "scheduled", "expired"],
    default: "sent",
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  scheduledAt: {
    type: Date,
  },
});

// Create indexes for efficient queries
interviewSlotSchema.index({ employer: 1, date: 1, startTime: 1 });
interviewSlotSchema.index({ date: 1, isAvailable: 1 });
interviewBookingSchema.index({ slot: 1, status: 1 });
interviewBookingSchema.index({ candidate: 1, status: 1 });
interviewBookingSchema.index({ employer: 1, status: 1 });
interviewBookingSchema.index({ googleCalendarEventId: 1 });
interviewBookingSchema.index({ googleCalendarSynced: 1 });
interviewInvitationSchema.index({ invitationToken: 1 });
interviewInvitationSchema.index({ candidateEmail: 1, status: 1 });

const InterviewSlot = mongoose.model("InterviewSlot", interviewSlotSchema);
const InterviewBooking = mongoose.model(
  "InterviewBooking",
  interviewBookingSchema
);
const InterviewInvitation = mongoose.model(
  "InterviewInvitation",
  interviewInvitationSchema
);

module.exports = {
  InterviewSlot,
  InterviewBooking,
  InterviewInvitation,
};
