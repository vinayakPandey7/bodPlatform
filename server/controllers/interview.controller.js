const { InterviewSlot, InterviewBooking, InterviewInvitation } = require("../models/interview.model");
const { sendEmail } = require("../utils/email");
const { generateCalendarAttachment } = require("../utils/calendarUtils");
const { v4: uuidv4 } = require("uuid");

// 1. Employer Calendar Management - Set unavailable slots
const setEmployerAvailability = async (req, res) => {
  try {
    const { employerId } = req.user;
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: "Slots array is required",
      });
    }

    // Delete existing slots for the date range
    const dateRange = slots.reduce((range, slot) => {
      const date = new Date(slot.date);
      if (!range.start || date < range.start) range.start = date;
      if (!range.end || date > range.end) range.end = date;
      return range;
    }, {});

    if (dateRange.start && dateRange.end) {
      await InterviewSlot.deleteMany({
        employer: employerId,
        date: {
          $gte: dateRange.start,
          $lte: dateRange.end,
        },
      });
    }

    // Create new slots
    const slotPromises = slots.map((slot) => {
      return InterviewSlot.create({
        employer: employerId,
        date: new Date(slot.date),
        startTime: slot.startTime,
        endTime: slot.endTime,
        timezone: slot.timezone || "America/New_York",
        isAvailable: slot.isAvailable !== false,
        maxCandidates: slot.maxCandidates || 1,
      });
    });

    await Promise.all(slotPromises);

    res.status(200).json({
      success: true,
      message: "Employer availability updated successfully",
      data: { slotsCount: slots.length },
    });
  } catch (error) {
    console.error("Error setting employer availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update employer availability",
      error: error.message,
    });
  }
};

// 2. Get available slots for candidate selection
const getAvailableSlots = async (req, res) => {
  try {
    const { jobId, employerId, startDate, endDate } = req.query;

    const query = {
      isAvailable: true,
      currentBookings: { $lt: "$maxCandidates" },
    };

    if (employerId) {
      query.employer = employerId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const slots = await InterviewSlot.find(query)
      .populate("employer", "companyName")
      .sort({ date: 1, startTime: 1 });

    // Group slots by date for easier frontend consumption
    const groupedSlots = slots.reduce((acc, slot) => {
      const dateKey = slot.date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          slots: [],
        };
      }
      acc[dateKey].slots.push({
        id: slot._id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timezone: slot.timezone,
        availableSpots: slot.maxCandidates - slot.currentBookings,
        employer: slot.employer,
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: Object.values(groupedSlots),
    });
  } catch (error) {
    console.error("Error getting available slots:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get available slots",
      error: error.message,
    });
  }
};

// 3. Schedule interview (called when candidate selects slot)
const scheduleInterview = async (req, res) => {
  try {
    const { slotId, candidateName, candidateEmail, candidatePhone, jobId } = req.body;

    // Validate slot availability
    const slot = await InterviewSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Interview slot not found",
      });
    }

    if (!slot.isAvailable || slot.currentBookings >= slot.maxCandidates) {
      return res.status(400).json({
        success: false,
        message: "This slot is no longer available",
      });
    }

    // Create interview booking
    const booking = await InterviewBooking.create({
      slot: slotId,
      employer: slot.employer,
      job: jobId,
      candidateName,
      candidateEmail,
      candidatePhone,
      status: "scheduled",
    });

    // Update slot booking count
    await InterviewSlot.findByIdAndUpdate(slotId, {
      $inc: { currentBookings: 1 },
    });

    // Generate invitation token
    const invitationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await InterviewInvitation.create({
      booking: booking._id,
      invitationToken,
      candidateEmail,
      expiresAt,
    });

    // Get job and employer details for response
    const Job = require("../models/job.model");
    const Employer = require("../models/employer.model");
    
    const job = await Job.findById(jobId).select("title description location");
    const employer = await Employer.findById(slot.employer).select("companyName email address");

    // Send confirmation emails
    await sendInterviewConfirmationEmails(booking, invitationToken);

    res.status(200).json({
      success: true,
      message: "Interview scheduled successfully",
      data: {
        bookingId: booking._id,
        invitationToken,
        scheduledDate: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        job,
        employer,
      },
    });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule interview",
      error: error.message,
    });
  }
};

// 4. Send interview invitation link (called when employer shortlists candidate)
const sendInterviewInvitation = async (req, res) => {
  try {
    const { candidateId, jobId, recruitmentPartnerId } = req.body;
    const { employerId } = req.user;

    // Get candidate details
    const Candidate = require("../models/candidate.model");
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Get job details
    const Job = require("../models/job.model");
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Create a placeholder booking for invitation
    const booking = await InterviewBooking.create({
      employer: employerId,
      job: jobId,
      candidate: candidateId,
      recruitmentPartner: recruitmentPartnerId,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
      status: "scheduled",
    });

    // Generate invitation token
    const invitationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await InterviewInvitation.create({
      booking: booking._id,
      invitationToken,
      candidateEmail: candidate.email,
      expiresAt,
    });

    // Send invitation email
    await sendInterviewInvitationEmail(candidate, job, invitationToken);

    res.status(200).json({
      success: true,
      message: "Interview invitation sent successfully",
      data: {
        bookingId: booking._id,
        invitationToken,
      },
    });
  } catch (error) {
    console.error("Error sending interview invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send interview invitation",
      error: error.message,
    });
  }
};

// 5. Get interview invitation details (for candidate selection page)
const getInterviewInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await InterviewInvitation.findOne({
      invitationToken: token,
      status: { $in: ["sent", "opened"] },
      expiresAt: { $gt: new Date() },
    }).populate({
      path: "booking",
      populate: [
        { path: "employer", select: "companyName" },
        { path: "job", select: "title company location" },
      ],
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired invitation",
      });
    }

    // Mark as opened if still in "sent" status
    if (invitation.status === "sent") {
      invitation.status = "opened";
      await invitation.save();
    }

    // Get available slots for this employer
    const availableSlots = await getAvailableSlotsForEmployer(invitation.booking.employer._id);

    res.status(200).json({
      success: true,
      data: {
        invitation,
        availableSlots,
      },
    });
  } catch (error) {
    console.error("Error getting interview invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get interview invitation",
      error: error.message,
    });
  }
};

// 6. Get employer's interview calendar
const getEmployerCalendar = async (req, res) => {
  try {
    const { employerId } = req.user;
    const { startDate, endDate } = req.query;

    const query = { employer: employerId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const slots = await InterviewSlot.find(query)
      .populate({
        path: "employer",
        select: "companyName",
      })
      .sort({ date: 1, startTime: 1 });

    // Get bookings for these slots
    const slotIds = slots.map(slot => slot._id);
    const bookings = await InterviewBooking.find({
      slot: { $in: slotIds },
      status: { $in: ["scheduled", "completed"] },
    }).populate("candidate", "firstName lastName email");

    // Group bookings by slot
    const bookingsBySlot = bookings.reduce((acc, booking) => {
      if (!acc[booking.slot]) {
        acc[booking.slot] = [];
      }
      acc[booking.slot].push(booking);
      return acc;
    }, {});

    // Format response
    const calendarData = slots.map(slot => ({
      slot: {
        id: slot._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable,
        maxCandidates: slot.maxCandidates,
        currentBookings: slot.currentBookings,
      },
      bookings: bookingsBySlot[slot._id] || [],
    }));

    res.status(200).json({
      success: true,
      data: calendarData,
    });
  } catch (error) {
    console.error("Error getting employer calendar:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get employer calendar",
      error: error.message,
    });
  }
};

// 7. Update interview status
const updateInterviewStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, notes } = req.body;

    const booking = await InterviewBooking.findByIdAndUpdate(
      bookingId,
      {
        status,
        notes,
        ...(status === "completed" && { completedAt: new Date() }),
      },
      { new: true }
    ).populate(["candidate", "employer", "job"]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Interview booking not found",
      });
    }

    // Send status update notifications
    await sendInterviewStatusUpdateEmail(booking, status);

    res.status(200).json({
      success: true,
      message: "Interview status updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error updating interview status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update interview status",
      error: error.message,
    });
  }
};

// Helper function to get available slots for employer
const getAvailableSlotsForEmployer = async (employerId) => {
  const slots = await InterviewSlot.find({
    employer: employerId,
    isAvailable: true,
    currentBookings: { $lt: "$maxCandidates" },
    date: { $gte: new Date() },
  }).sort({ date: 1, startTime: 1 });

  return slots.map(slot => ({
    id: slot._id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    availableSpots: slot.maxCandidates - slot.currentBookings,
  }));
};

// Email helper functions
const sendInterviewConfirmationEmails = async (booking, invitationToken) => {
  try {
    const slot = await InterviewSlot.findById(booking.slot);
    const employer = await require("../models/employer.model").findById(booking.employer);
    const job = await require("../models/job.model").findById(booking.job);

    // Generate calendar attachment for candidate
    const calendarAttachment = await generateCalendarAttachment(booking, job, employer);

    // Email to candidate
    await sendEmail({
      to: booking.candidateEmail,
      subject: "Interview Confirmation - BOD Platform",
      html: `
        <h2>Interview Confirmation</h2>
        <p>Dear ${booking.candidateName},</p>
        <p>Your interview has been scheduled successfully.</p>
        <p><strong>Company:</strong> ${employer.companyName}</p>
        <p><strong>Position:</strong> ${job.title}</p>
        <p><strong>Date:</strong> ${slot.date.toDateString()}</p>
        <p><strong>Time:</strong> ${slot.startTime} - ${slot.endTime} (${slot.timezone})</p>
        <p>Please find the calendar invitation attached to this email. You can add this to your Google Calendar, Outlook, or any other calendar application.</p>
        <p><strong>How to add to your calendar:</strong></p>
        <ul>
          <li><strong>Gmail/Google Calendar:</strong> Open the attached .ics file and it will automatically open in Google Calendar</li>
          <li><strong>Outlook:</strong> Double-click the .ics file to add it to your calendar</li>
          <li><strong>Apple Calendar:</strong> Double-click the .ics file to import</li>
        </ul>
        <p>Good luck with your interview!</p>
      `,
      attachments: calendarAttachment ? [calendarAttachment] : undefined,
    });

    // Email to employer
    await sendEmail({
      to: employer.email,
      subject: "New Interview Scheduled - BOD Platform",
      html: `
        <h2>New Interview Scheduled</h2>
        <p>A new interview has been scheduled.</p>
        <p><strong>Candidate:</strong> ${booking.candidateName}</p>
        <p><strong>Email:</strong> ${booking.candidateEmail}</p>
        <p><strong>Position:</strong> ${job.title}</p>
        <p><strong>Date:</strong> ${slot.date.toDateString()}</p>
        <p><strong>Time:</strong> ${slot.startTime} - ${slot.endTime}</p>
      `,
    });
  } catch (error) {
    console.error("Error sending confirmation emails:", error);
  }
};

const sendInterviewInvitationEmail = async (candidate, job, invitationToken) => {
  const invitationLink = `${process.env.FRONTEND_URL}/interview/schedule/${invitationToken}`;

  await sendEmail({
    to: candidate.email,
    subject: "Interview Invitation - BOD Platform",
    html: `
      <h2>Interview Invitation</h2>
      <p>Dear ${candidate.firstName} ${candidate.lastName},</p>
      <p>You have been invited for an interview!</p>
      <p><strong>Company:</strong> ${job.company}</p>
      <p><strong>Position:</strong> ${job.title}</p>
      <p><strong>Location:</strong> ${job.location}</p>
      <p>Please click the link below to schedule your interview:</p>
      <p><a href="${invitationLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Schedule Interview</a></p>
      <p>This invitation expires in 7 days.</p>
    `,
  });
};

const sendInterviewStatusUpdateEmail = async (booking, status) => {
  const statusMessages = {
    completed: "has been completed",
    cancelled: "has been cancelled",
    no_show: "was marked as no-show",
  };

  const message = statusMessages[status] || "status has been updated";

  // Email to candidate
  await sendEmail({
    to: booking.candidateEmail,
    subject: `Interview ${status.charAt(0).toUpperCase() + status.slice(1)} - BOD Platform`,
    html: `
      <h2>Interview ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
      <p>Dear ${booking.candidateName},</p>
      <p>Your interview for ${booking.job.title} ${message}.</p>
    `,
  });

  // Email to employer
  await sendEmail({
    to: booking.employer.email,
    subject: `Interview ${status.charAt(0).toUpperCase() + status.slice(1)} - BOD Platform`,
    html: `
      <h2>Interview ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
      <p>The interview with ${booking.candidateName} for ${booking.job.title} ${message}.</p>
    `,
  });
};

module.exports = {
  setEmployerAvailability,
  getAvailableSlots,
  scheduleInterview,
  sendInterviewInvitation,
  getInterviewInvitation,
  getEmployerCalendar,
  updateInterviewStatus,
};
