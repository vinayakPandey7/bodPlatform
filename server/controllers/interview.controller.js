const {
  InterviewSlot,
  InterviewBooking,
  InterviewInvitation,
} = require("../models/interview.model");
const Employer = require("../models/employer.model");
const User = require("../models/user.model");
const { sendEmail } = require("../utils/email");
const { generateCalendarAttachment } = require("../utils/calendarUtils");
const {
  createInterviewCalendarEvent,
  deleteCalendarEvent,
} = require("../utils/googleCalendar");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

// 1. Employer Calendar Management - Set unavailable slots
const setEmployerAvailability = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: "Slots array is required",
      });
    }

    // Find employer by user id
    const employerDoc = await Employer.findOne({ user: id });
    if (!employerDoc) {
      return res.status(400).json({
        success: false,
        message: "Employer profile not found for this user.",
      });
    }
    const employerId = employerDoc._id;

    // Delete existing slots for each specific date
    const uniqueDates = [...new Set(slots.map((slot) => slot.date))];

    for (const dateStr of uniqueDates) {
      const startOfDay = new Date(dateStr + "T00:00:00.000Z");
      const endOfDay = new Date(dateStr + "T23:59:59.999Z");

      await InterviewSlot.deleteMany({
        employer: employerId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
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

// Helper function to generate default time slots for a date
const generateDefaultSlots = (employerId, date, employer) => {
  const defaultSlots = [];
  const workingHours = [
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
    { start: "16:00", end: "17:00" },
    { start: "17:00", end: "18:00" }, // Added slot till 6 PM
  ];

  workingHours.forEach((slot) => {
    defaultSlots.push({
      id: `default-${employerId}-${date}-${slot.start}`,
      startTime: slot.start,
      endTime: slot.end,
      timezone: "America/New_York",
      availableSpots: 1,
      employer: employer,
      isDefault: true,
    });
  });

  return defaultSlots;
};

// Helper function to check if two time slots conflict
const isTimeSlotConflicting = (slot1Start, slot1End, slot2Start, slot2End) => {
  // Convert time strings to minutes for easier comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const slot1StartMin = timeToMinutes(slot1Start);
  const slot1EndMin = timeToMinutes(slot1End);
  const slot2StartMin = timeToMinutes(slot2Start);
  const slot2EndMin = timeToMinutes(slot2End);

  // Check if slots overlap
  return slot1StartMin < slot2EndMin && slot2StartMin < slot1EndMin;
};

// 2. Get available slots for candidate selection
const getAvailableSlots = async (req, res) => {
  try {
    const { jobId, employerId, startDate, endDate } = req.query;

    if (!employerId) {
      return res.status(400).json({
        success: false,
        message: "employerId is required",
      });
    }

    // Get employer info
    const Employer = require("../models/employer.model");
    const employer = await Employer.findById(employerId).select("companyName");
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    // Set date range - default to next 30 days if not provided
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const matchQuery = {
      employer: new mongoose.Types.ObjectId(employerId),
      date: { $gte: start, $lte: end },
    };

    // Get existing slots (both available and unavailable)
    const existingSlots = await InterviewSlot.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "employers",
          localField: "employer",
          foreignField: "_id",
          as: "employer",
          pipeline: [{ $project: { companyName: 1 } }],
        },
      },
      { $unwind: "$employer" },
      { $sort: { date: 1, startTime: 1 } },
    ]);

    // Generate date range for default availability
    const dateRange = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      // Skip weekends
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        dateRange.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group existing slots by date
    const existingSlotsByDate = {};
    existingSlots.forEach((slot) => {
      const dateKey = slot.date.toISOString().split("T")[0];
      if (!existingSlotsByDate[dateKey]) {
        existingSlotsByDate[dateKey] = [];
      }
      existingSlotsByDate[dateKey].push(slot);
    });

    // Build final grouped slots
    const groupedSlots = {};

    dateRange.forEach((date) => {
      const dateKey = date.toISOString().split("T")[0];
      const existingSlotsForDate = existingSlotsByDate[dateKey] || [];

      // Get available slots that employer has explicitly set
      const availableSlots = existingSlotsForDate.filter(
        (slot) => slot.isAvailable && slot.currentBookings < slot.maxCandidates
      );

      // Get unavailable time ranges
      const unavailableSlots = existingSlotsForDate.filter(
        (slot) => !slot.isAvailable
      );

      let finalSlots = [];

      if (availableSlots.length > 0) {
        // Use explicitly available slots
        finalSlots = availableSlots.map((slot) => ({
          id: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          timezone: slot.timezone,
          availableSpots: slot.maxCandidates - slot.currentBookings,
          employer: slot.employer,
        }));
      } else {
        // Generate default slots and filter out unavailable time ranges
        const defaultSlots = generateDefaultSlots(
          employerId,
          dateKey,
          employer
        );

        finalSlots = defaultSlots.filter((defaultSlot) => {
          // Check if this default slot conflicts with any unavailable time range
          return !unavailableSlots.some((unavailableSlot) => {
            return isTimeSlotConflicting(
              defaultSlot.startTime,
              defaultSlot.endTime,
              unavailableSlot.startTime,
              unavailableSlot.endTime
            );
          });
        });
      }

      // Only add to groupedSlots if there are final slots to show
      if (finalSlots.length > 0) {
        groupedSlots[dateKey] = {
          date: dateKey,
          slots: finalSlots,
        };
      }
    });

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
    const { slotId, candidateName, candidateEmail, candidatePhone, jobId } =
      req.body;

    let slot;
    let isDefaultSlot = false;

    // Check if this is a default slot (starts with 'default-')
    if (slotId.startsWith("default-")) {
      isDefaultSlot = true;
      // Parse default slot info: default-{employerId}-{YYYY-MM-DD}-{HH:MM}
      const parts = slotId.split("-");
      const employerId = parts[1];
      const date = `${parts[2]}-${parts[3]}-${parts[4]}`; // Reconstruct YYYY-MM-DD
      const startTime = `${parts[5]}:${parts[6] || "00"}`; // Reconstruct HH:MM with fallback for minutes

      // Check if employer has explicitly set unavailable slots for this time
      const existingSlot = await InterviewSlot.findOne({
        employer: employerId,
        date: new Date(date + "T00:00:00.000Z"),
        startTime: startTime,
        isAvailable: false,
      });

      if (existingSlot) {
        return res.status(400).json({
          success: false,
          message: "This time slot is not available as per employer's schedule",
        });
      }

      // Calculate end time as 1 hour after start time
      const calculateEndTime = (startTime) => {
        const [hours, minutes] = startTime.split(":").map(Number);
        const endHour = hours + 1;
        return `${endHour.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
      };

      const endTime = calculateEndTime(startTime);

      slot = await InterviewSlot.create({
        employer: employerId,
        date: new Date(date + "T00:00:00.000Z"), // Ensure UTC parsing to avoid timezone issues
        startTime: startTime,
        endTime: endTime,
        timezone: "America/New_York",
        isAvailable: true,
        maxCandidates: 1,
        currentBookings: 0,
      });
    } else {
      // Regular slot - validate it exists
      slot = await InterviewSlot.findById(slotId);
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
    }

    // Find or create a User record for the candidate
    let candidate = await User.findOne({
      email: candidateEmail,
      role: "candidate",
    });

    if (!candidate) {
      // Create a minimal User record for the candidate
      candidate = await User.create({
        firstName: candidateName.split(" ")[0] || candidateName,
        lastName: candidateName.split(" ").slice(1).join(" ") || "",
        email: candidateEmail,
        phoneNumber: candidatePhone || "",
        role: "candidate",
        password: "temp_password_" + Date.now(), // Temporary password
        isVerified: false, // They can verify later if they want to create a full account
      });
    }

    // Generate unique booking token
    const bookingToken = uuidv4();

    // Create Google Calendar event with Google Meet link
    let calendarResult;
    let meetingLink;
    let googleCalendarEventId = null;
    let googleCalendarSynced = false;

    try {
      calendarResult = await createInterviewCalendarEvent({
        booking: {
          _id: null, // Will be set after booking creation
          candidateName,
          candidateEmail,
          candidatePhone,
          bookingToken,
        },
        slot,
        job: await mongoose.model("Job").findById(jobId),
        employer: await Employer.findById(slot.employer),
        accountType: "admin", // Use admin account for calendar events
      });

      meetingLink = calendarResult.meetLink;
      googleCalendarEventId = calendarResult.eventId;
      googleCalendarSynced = !calendarResult.fallback;
    } catch (error) {
      console.error("❌ Failed to create Google Calendar event:", error);
      // Return error - we need proper Google Calendar integration
      return res.status(500).json({
        success: false,
        message:
          "Failed to create calendar event with Google Meet link. Please try again.",
        error: error.message,
      });
    }

    // Store the meeting link in the booking to ensure consistency
    const persistentMeetLink = meetingLink;

    // Create interview booking with Google Meet details
    const booking = await InterviewBooking.create({
      slot: slot._id,
      employer: slot.employer,
      candidate: candidate._id,
      job: jobId,
      candidateName,
      candidateEmail,
      candidatePhone,
      bookingToken,
      googleMeetLink: meetingLink,
      meetingLink: meetingLink,
      persistentMeetLink: persistentMeetLink,
      googleCalendarEventId,
      googleCalendarSynced,
      googleMeetDetails: {
        meetLink: calendarResult?.meetLink,
        meetId: calendarResult?.eventId,
        htmlLink: calendarResult?.htmlLink,
        eventData: calendarResult?.event,
      },
      status: "scheduled",
      createdAt: new Date(),
    });

    // Update slot booking count
    await InterviewSlot.findByIdAndUpdate(slot._id, {
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

    const job = await Job.findById(jobId).select("title description location");
    const employer = await Employer.findById(slot.employer).select(
      "companyName email address"
    );

    // Send confirmation emails
    // await sendInterviewConfirmationEmails(booking, invitationToken);

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      booking: {
        id: booking._id,
        bookingToken,
        slot: {
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          timezone: slot.timezone,
        },
        candidate: {
          name: candidateName,
          email: candidateEmail,
          phone: candidatePhone,
        },
        job: {
          title: job.title,
          company: employer.companyName,
        },
        meetingDetails: {
          meetLink: meetingLink,
          googleCalendarEventId: googleCalendarEventId,
          googleMeetDetails: booking.googleMeetDetails,
          htmlLink: calendarResult?.htmlLink,
        },
        status: booking.status,
        createdAt: booking.createdAt,
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

    // Generate tokens
    const invitationToken = uuidv4();
    const bookingToken = uuidv4();

    // Create a placeholder booking for invitation
    const booking = await InterviewBooking.create({
      employer: employerId,
      job: jobId,
      candidate: candidateId,
      recruitmentPartner: recruitmentPartnerId,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
      bookingToken: bookingToken,
      status: "scheduled",
    });
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
    const availableSlots = await getAvailableSlotsForEmployer(
      invitation.booking.employer._id
    );

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
    // Find bookings for these slots and group by slot
    const bookings = await InterviewBooking.find({
      slot: { $in: slots.map((slot) => slot._id) },
      status: { $in: ["scheduled", "confirmed"] },
    })
      .populate("job", "title location")
      .populate("candidate", "firstName lastName email")
      .sort({ createdAt: -1 });

    // Group bookings by slot
    const bookingsBySlot = bookings.reduce((acc, booking) => {
      if (!acc[booking.slot]) {
        acc[booking.slot] = [];
      }
      acc[booking.slot].push(booking);
      return acc;
    }, {});

    // Format response
    const calendarData = slots.map((slot) => ({
      slot: {
        id: slot._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable,
        maxCandidates: slot.maxCandidates,
        currentBookings: slot.currentBookings,
      },
      bookings: (bookingsBySlot[slot._id] || []).map((booking) => {
        return {
          id: booking._id,
          candidateName: booking.candidateName,
          candidateEmail: booking.candidateEmail,
          candidatePhone: booking.candidatePhone,
          status: booking.status,
          meetingLink: booking.meetingLink,
          googleMeetDetails: booking.googleMeetDetails,
          googleCalendarEventId: booking.googleCalendarEventId,
          participants: booking.participants || [],
          job: booking.job,
          candidate: booking.candidate,
          createdAt: booking.createdAt,
          scheduledAt: booking.scheduledAt,
        };
      }),
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
        ...(status === "cancelled" && { cancelledAt: new Date() }),
      },
      { new: true }
    ).populate(["candidate", "employer", "job"]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Interview booking not found",
      });
    }

    // If interview is cancelled, free up the slot for other candidates
    if (status === "cancelled" && booking.slot) {
      await InterviewSlot.findByIdAndUpdate(booking.slot, {
        $inc: { currentBookings: -1 },
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
  const slots = await InterviewSlot.aggregate([
    {
      $match: {
        employer: employerId,
        isAvailable: true,
        date: { $gte: new Date() },
      },
    },
    {
      $match: {
        $expr: { $lt: ["$currentBookings", "$maxCandidates"] },
      },
    },
    {
      $sort: { date: 1, startTime: 1 },
    },
  ]);

  return slots.map((slot) => ({
    id: slot._id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    availableSpots: slot.maxCandidates - slot.currentBookings,
  }));
};

// Email helper functions
const sendInterviewConfirmationEmails = async (booking) => {
  try {
    const slot = await InterviewSlot.findById(booking.slot);

    // Clean the time values to ensure they're strings and remove any ':undefined' suffix
    const cleanStartTime = String(slot.startTime || "")
      .replace(":undefined", "")
      .trim();
    const cleanEndTime = String(slot.endTime || "")
      .replace(":undefined", "")
      .trim();
    const cleanTimezone = String(slot.timezone || "America/New_York").trim();

    const employer = await require("../models/employer.model").findById(
      booking.employer
    );
    const job = await require("../models/job.model").findById(booking.job);

    // Check if job has recruitment partner
    let recruitmentPartner = null;
    if (job.recruitmentPartner) {
      recruitmentPartner =
        await require("../models/recruitmentPartner.model").findById(
          job.recruitmentPartner
        );
    }

    const calendarAttachment = await generateCalendarAttachment(
      booking,
      slot,
      job,
      employer
    );

    const formattedDate = new Date(slot.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    // send email functionality is disabled for now since multiple email is getting sent

    // Email to candidate
    // await sendEmail({
    //   to: booking.candidateEmail,
    //   subject: "Interview Confirmation - BOD Platform",
    //   html: `
    //     <h2>🎉 Interview Confirmation</h2>
    //     <p>Dear ${booking.candidateName},</p>
    //     <p>Your interview has been scheduled successfully!</p>

    //     <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    //       <h3 style="margin-top: 0; color: #2563eb;">📅 Interview Details</h3>
    //       <p><strong>Company:</strong> ${employer.companyName}</p>
    //       <p><strong>Position:</strong> ${job.title}</p>
    //       <p><strong>Date:</strong> ${formattedDate}</p>
    //       <p><strong>Time:</strong> ${cleanStartTime} - ${cleanEndTime} (${cleanTimezone})</p>
    //     </div>

    //     <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
    //       <h3 style="margin-top: 0; color: #2563eb;">🎥 Join Video Interview</h3>
    //       <p><strong>Meeting Link:</strong></p>
    //       <p><a href="${booking.meetingLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Join Meeting</a></p>
    //       <p style="margin-top: 15px; font-size: 14px; color: #666;">
    //         💡 <strong>Tip:</strong> Join the meeting 5 minutes early to test your audio and video setup.
    //       </p>
    //     </div>

    //     <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
    //       <h4 style="margin-top: 0;">📎 Calendar Invitation</h4>
    //       <p>A calendar invitation is included with this email. You can add it to:</p>
    //       <ul style="margin: 10px 0;">
    //         <li><strong>Gmail/Google Calendar:</strong> Click "Add to Calendar"</li>
    //         <li><strong>Outlook:</strong> Click "Accept" to add to calendar</li>
    //         <li><strong>Apple Calendar:</strong> Click to import the event</li>
    //       </ul>
    //       <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; margin-top: 15px;">
    //         <p style="margin: 0; font-size: 14px; color: #065f46;">
    //           💡 <strong>How to use:</strong> Simply click on the attached <code>interview-${booking._id}.ics</code> file to automatically add this interview to your calendar app.
    //         </p>
    //       </div>
    //     </div>

    //     <p style="margin-top: 30px;">Good luck with your interview! 🍀</p>

    //     <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    //     <p style="font-size: 12px; color: #666;">
    //       If you have any questions, please contact ${employer.companyName} directly.
    //     </p>
    //   `,
    //   icalEvent: calendarAttachment?.icalEvent,
    //   attachments: calendarAttachment?.attachment
    //     ? [calendarAttachment.attachment]
    //     : undefined,
    // });

    // Email to employer
    // await sendEmail({
    //   to: employer.email,
    //   subject: "New Interview Scheduled - BOD Platform",
    //   html: `
    //     <h2>📅 New Interview Scheduled</h2>
    //     <p>A new interview has been scheduled with a candidate.</p>

    //     <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    //       <h3 style="margin-top: 0; color: #2563eb;">👤 Candidate Information</h3>
    //       <p><strong>Name:</strong> ${booking.candidateName}</p>
    //       <p><strong>Email:</strong> ${booking.candidateEmail}</p>
    //       <p><strong>Phone:</strong> ${booking.candidatePhone}</p>
    //       <p><strong>Position:</strong> ${job.title}</p>
    //     </div>

    //     <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    //       <h3 style="margin-top: 0; color: #2563eb;">📅 Interview Details</h3>
    //       <p><strong>Date:</strong> ${formattedDate}</p>
    //       <p><strong>Time:</strong> ${cleanStartTime} - ${cleanEndTime} (${cleanTimezone})</p>
    //     </div>

    //     <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
    //       <h3 style="margin-top: 0; color: #2563eb;">🎥 Video Interview Link</h3>
    //       <p><strong>Meeting Link:</strong></p>
    //       <p><a href="${booking.meetingLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Join Meeting</a></p>
    //       <p style="margin-top: 15px; font-size: 14px; color: #666;">
    //         The candidate has also received this meeting link in their confirmation email.
    //       </p>
    //     </div>

    //     <p>Please be prepared for the interview at the scheduled time. The calendar invitation is included with this email.</p>

    //     <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    //     <p style="font-size: 12px; color: #666;">
    //       This interview was scheduled through the BOD Platform.
    //     </p>
    //   `,
    //   icalEvent: calendarAttachment?.icalEvent,
    //   attachments: calendarAttachment?.attachment
    //     ? [calendarAttachment.attachment]
    //     : undefined,
    // });

    // Email to recruitment partner if exists (but avoid sending to admin email to prevent duplicates)
    // if (
    //   recruitmentPartner &&
    //   recruitmentPartner.email !== "admin@theciero.com"
    // ) {
    //   await sendEmail({
    //     to: recruitmentPartner.email,
    //     subject: "Interview Scheduled for Your Job Posting - BOD Platform",
    //     html: `
    //       <h2>📅 Interview Scheduled</h2>
    //       <p>Dear ${recruitmentPartner.ownerName},</p>
    //       <p>An interview has been scheduled for one of your job postings.</p>

    //       <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    //         <h3 style="margin-top: 0; color: #2563eb;">🏢 Interview Details</h3>
    //         <p><strong>Company:</strong> ${employer.companyName}</p>
    //         <p><strong>Position:</strong> ${job.title}</p>
    //         <p><strong>Date:</strong> ${formattedDate}</p>
    //         <p><strong>Time:</strong> ${cleanStartTime} - ${cleanEndTime} (${cleanTimezone})</p>
    //       </div>

    //       <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    //         <h3 style="margin-top: 0; color: #2563eb;">👤 Candidate Information</h3>
    //         <p><strong>Name:</strong> ${booking.candidateName}</p>
    //         <p><strong>Email:</strong> ${booking.candidateEmail}</p>
    //         <p><strong>Phone:</strong> ${booking.candidatePhone}</p>
    //       </div>

    //       <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
    //         <h3 style="margin-top: 0; color: #2563eb;">🎥 Meeting Link</h3>
    //         <p><strong>Video Call:</strong> <a href="${booking.meetingLink}">${booking.meetingLink}</a></p>
    //       </div>

    //       <p>The interview will be conducted by ${employer.companyName} via video call.</p>

    //     <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    //     <p style="font-size: 12px; color: #666;">
    //       This notification was sent from the BOD Platform.
    //     </p>
    //   `,
    //     icalEvent: calendarAttachment?.icalEvent,
    //     alternatives: calendarAttachment
    //       ? [calendarAttachment.alternatives]
    //       : undefined,
    //   });
    // }
  } catch (error) {
    console.error("Error sending confirmation emails:", error);
  }
};

const sendInterviewInvitationEmail = async (
  candidate,
  job,
  invitationToken
) => {
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
  try {
    // Get slot details for the email
    const slot = await InterviewSlot.findById(booking.slot);
    if (!slot) {
      console.error("Slot not found for booking:", booking._id);
      return;
    }

    const formattedDate = new Date(slot.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    // Clean the time values to ensure they're strings and remove any ':undefined' suffix
    const cleanStartTime = String(slot.startTime || "")
      .replace(":undefined", "")
      .trim();
    const cleanEndTime = String(slot.endTime || "")
      .replace(":undefined", "")
      .trim();
    const cleanTimezone = String(slot.timezone || "UTC").trim();

    const formattedTime = `${cleanStartTime} - ${cleanEndTime} (${cleanTimezone})`;

    if (status === "cancelled") {
      // Enhanced cancellation email to candidate
      await sendEmail({
        to: booking.candidateEmail,
        subject: "Interview Cancelled - BOD Platform",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">❌ Interview Cancelled</h2>
            <p>Dear ${booking.candidateName},</p>
            
            <p>We regret to inform you that your scheduled interview has been cancelled.</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #dc2626;">📅 Cancelled Interview Details</h3>
              <p><strong>Company:</strong> ${booking.employer.companyName}</p>
              <p><strong>Position:</strong> ${booking.job.title}</p>
              <p><strong>Originally Scheduled:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              ${
                booking.notes
                  ? `<p><strong>Reason:</strong> ${booking.notes}</p>`
                  : ""
              }
            </div>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2563eb;">💡 What's Next?</h3>
              <p>If you're interested in rescheduling or have any questions about this cancellation, please contact ${
                booking.employer.companyName
              } directly.</p>
              <p>We encourage you to continue exploring other opportunities on the BOD Platform.</p>
            </div>

            <p>We apologize for any inconvenience this may cause.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              If you have any questions, please contact ${
                booking.employer.companyName
              } directly.<br>
              This notification was sent from the BOD Platform.
            </p>
          </div>
        `,
      });

      // Enhanced cancellation email to employer
      await sendEmail({
        to: booking.employer.email,
        subject: "Interview Cancelled - BOD Platform",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">❌ Interview Cancelled</h2>
            <p>The interview with ${
              booking.candidateName
            } has been cancelled.</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #dc2626;">👤 Cancelled Interview Details</h3>
              <p><strong>Candidate:</strong> ${booking.candidateName}</p>
              <p><strong>Email:</strong> ${booking.candidateEmail}</p>
              <p><strong>Phone:</strong> ${
                booking.candidatePhone || "Not provided"
              }</p>
              <p><strong>Position:</strong> ${booking.job.title}</p>
              <p><strong>Originally Scheduled:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              ${
                booking.notes
                  ? `<p><strong>Cancellation Notes:</strong> ${booking.notes}</p>`
                  : ""
              }
            </div>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2563eb;">📅 Time Slot Status</h3>
              <p>The time slot is now available for other candidates to book.</p>
              <p>You can view your calendar and manage availability through your employer dashboard.</p>
            </div>

            <p>The candidate has been notified of this cancellation.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              This notification was sent from the BOD Platform.
            </p>
          </div>
        `,
      });
    } else {
      // For other status updates (completed, no_show, etc.)
      const statusMessages = {
        completed: "has been completed",
        no_show: "was marked as no-show",
      };

      const message = statusMessages[status] || "status has been updated";
      const statusColor = status === "completed" ? "#16a34a" : "#dc2626";
      const statusIcon = status === "completed" ? "✅" : "⚠️";

      // Email to candidate
      await sendEmail({
        to: booking.candidateEmail,
        subject: `Interview ${
          status.charAt(0).toUpperCase() + status.slice(1)
        } - BOD Platform`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${statusColor};">${statusIcon} Interview ${
          status.charAt(0).toUpperCase() + status.slice(1)
        }</h2>
            <p>Dear ${booking.candidateName},</p>
            <p>Your interview for <strong>${
              booking.job.title
            }</strong> at <strong>${
          booking.employer.companyName
        }</strong> ${message}.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: ${statusColor};">📅 Interview Details</h3>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              ${
                booking.notes
                  ? `<p><strong>Notes:</strong> ${booking.notes}</p>`
                  : ""
              }
            </div>

            ${
              status === "completed"
                ? `
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #16a34a; margin: 0;">Thank you for participating in the interview. The employer will be in touch regarding next steps.</p>
            </div>
            `
                : ""
            }
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              This notification was sent from the BOD Platform.
            </p>
          </div>
        `,
      });

      // Email to employer
      await sendEmail({
        to: booking.employer.email,
        subject: `Interview ${
          status.charAt(0).toUpperCase() + status.slice(1)
        } - BOD Platform`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${statusColor};">${statusIcon} Interview ${
          status.charAt(0).toUpperCase() + status.slice(1)
        }</h2>
            <p>The interview with <strong>${
              booking.candidateName
            }</strong> for <strong>${booking.job.title}</strong> ${message}.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: ${statusColor};">👤 Interview Details</h3>
              <p><strong>Candidate:</strong> ${booking.candidateName}</p>
              <p><strong>Email:</strong> ${booking.candidateEmail}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              ${
                booking.notes
                  ? `<p><strong>Notes:</strong> ${booking.notes}</p>`
                  : ""
              }
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              This notification was sent from the BOD Platform.
            </p>
          </div>
        `,
      });

      // Email to participants if any exist
      if (booking.participants && booking.participants.length > 0) {
        for (const participantEmail of booking.participants) {
          await sendEmail({
            to: participantEmail,
            subject: `Interview ${
              status.charAt(0).toUpperCase() + status.slice(1)
            } - BOD Platform`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: ${statusColor};">${statusIcon} Interview ${
              status.charAt(0).toUpperCase() + status.slice(1)
            }</h2>
                <p>Dear Participant,</p>
                <p>The interview for <strong>${
                  booking.job.title
                }</strong> at <strong>${
              booking.employer.companyName
            }</strong> with candidate <strong>${
              booking.candidateName
            }</strong> ${message}.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: ${statusColor};">📅 Interview Details</h3>
                  <p><strong>Candidate:</strong> ${booking.candidateName}</p>
                  <p><strong>Date:</strong> ${formattedDate}</p>
                  <p><strong>Time:</strong> ${formattedTime}</p>
                  ${
                    booking.notes
                      ? `<p><strong>Notes:</strong> ${booking.notes}</p>`
                      : ""
                  }
                </div>

                ${
                  status === "completed"
                    ? `
                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #16a34a; margin: 0;">The interview has been completed successfully.</p>
                </div>
                `
                    : ""
                }
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">
                  This notification was sent from the BOD Platform.
                </p>
              </div>
            `,
          });
        }
      }
    }

    // Email to participants for cancellation as well
    if (
      status === "cancelled" &&
      booking.participants &&
      booking.participants.length > 0
    ) {
      for (const participantEmail of booking.participants) {
        await sendEmail({
          to: participantEmail,
          subject: "Interview Cancelled - BOD Platform",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">❌ Interview Cancelled</h2>
              <p>Dear Participant,</p>
              
              <p>The interview you were invited to participate in has been cancelled.</p>
              
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin-top: 0; color: #dc2626;">📅 Cancelled Interview Details</h3>
                <p><strong>Company:</strong> ${booking.employer.companyName}</p>
                <p><strong>Position:</strong> ${booking.job.title}</p>
                <p><strong>Candidate:</strong> ${booking.candidateName}</p>
                <p><strong>Originally Scheduled:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                ${
                  booking.notes
                    ? `<p><strong>Reason:</strong> ${booking.notes}</p>`
                    : ""
                }
              </div>

              <p>We apologize for any inconvenience this may cause.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">
                This notification was sent from the BOD Platform.
              </p>
            </div>
          `,
        });
      }
    }
  } catch (error) {
    console.error("Error sending interview status update email:", error);
  }
};

// Add participant to interview
const addInterviewParticipant = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { email } = req.body;
    const { id: userId, role } = req.user;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Find the booking and populate necessary fields
    const booking = await InterviewBooking.findById(bookingId)
      .populate("employer", "companyName email firstName lastName")
      .populate("job", "title location")
      .populate("slot", "date startTime endTime timezone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Interview booking not found",
      });
    }

    // Check if user has permission to add participants
    if (role === "employer") {
      const employer = await Employer.findOne({ user: userId });
      if (
        !employer ||
        booking.employer._id.toString() !== employer._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You don't have permission to add participants to this interview",
        });
      }
    }

    // Generate calendar attachment
    const calendarAttachment = generateCalendarAttachment({
      title: `Interview: ${booking.job.title}`,
      description: `Interview with ${booking.candidateName} for ${booking.job.title} position at ${booking.employer.companyName}`,
      startTime: new Date(`${booking.slot.date}T${booking.slot.startTime}:00`),
      endTime: new Date(`${booking.slot.date}T${booking.slot.endTime}:00`),
      location: booking.job.location,
      meetingLink: booking.meetingLink,
      attendees: [email, booking.candidateEmail, booking.employer.email],
    });

    // Clean the time values to ensure they're strings and remove any ':undefined' suffix
    const cleanStartTime = String(booking.slot.startTime || "")
      .replace(":undefined", "")
      .trim();
    const cleanEndTime = String(booking.slot.endTime || "")
      .replace(":undefined", "")
      .trim();
    const cleanTimezone = String(booking.slot.timezone || "UTC").trim();

    const formattedTime = `${cleanStartTime} - ${cleanEndTime} (${cleanTimezone})`;

    // Add participant to the booking's participants array
    if (!booking.participants) {
      booking.participants = [];
    }
    if (!booking.participants.includes(email)) {
      booking.participants.push(email);
      const savedBooking = await booking.save();
    }

    // Send invitation email to the participant
    await sendEmail({
      to: email,
      subject: `Interview Invitation - ${booking.job.title} at ${booking.employer.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You're Invited to Join an Interview</h2>
          
          <p>Hello,</p>
          
          <p>You have been invited to participate in an interview for the <strong>${
            booking.job.title
          }</strong> position at <strong>${
        booking.employer.companyName
      }</strong>.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Interview Details</h3>
            <p><strong>Position:</strong> ${booking.job.title}</p>
            <p><strong>Company:</strong> ${booking.employer.companyName}</p>
            <p><strong>Candidate:</strong> ${booking.candidateName}</p>
            <p><strong>Date:</strong> ${new Date(
              booking.slot.date
            ).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
             <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Location:</strong> ${booking.job.location}</p>
            ${
              booking.meetingLink
                ? `<p><strong>Meeting Link:</strong> <a href="${booking.meetingLink}" style="color: #2563eb;">${booking.meetingLink}</a></p>`
                : ""
            }
          </div>
          
          ${
            booking.meetingLink
              ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${booking.meetingLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Join Interview Call
            </a>
          </div>
          `
              : ""
          }
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #92400e;">📅 Add to Your Calendar</h4>
            <p style="margin-bottom: 0; color: #92400e;">A calendar file (.ics) is attached to this email. Click on it to automatically add this interview to your calendar app (Google Calendar, Outlook, Apple Calendar, etc.).</p>
          </div>
          
          <p>If you have any questions about this interview, please contact the employer directly.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This invitation was sent through the BOD Platform.<br>
            If you believe you received this email in error, please ignore it.
          </p>
        </div>
      `,
      attachments: [calendarAttachment],
    });

    res.status(200).json({
      success: true,
      message: "Participant invitation sent successfully",
      data: {
        email,
        bookingId,
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error adding interview participant:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add participant to interview",
      error: error.message,
    });
  }
};

// Remove participant from interview
const removeInterviewParticipant = async (req, res) => {
  try {
    const { bookingId, email } = req.params;
    const { id: userId, role } = req.user;

    // Find the booking
    const booking = await InterviewBooking.findById(bookingId).populate(
      "employer",
      "companyName email firstName lastName"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Interview booking not found",
      });
    }

    // Check if user has permission
    if (role === "employer") {
      const employer = await Employer.findOne({ user: userId });
      if (
        !employer ||
        booking.employer._id.toString() !== employer._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You don't have permission to remove participants from this interview",
        });
      }
    }

    // Remove participant from the array
    if (booking.participants && booking.participants.includes(email)) {
      booking.participants = booking.participants.filter((p) => p !== email);
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: "Participant removed successfully",
      data: {
        email,
        bookingId,
        removedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error removing interview participant:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove participant from interview",
      error: error.message,
    });
  }
};

// Cancel interview booking and cleanup Google Calendar event
const cancelInterviewBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    // Find the booking
    const booking = await InterviewBooking.findById(bookingId)
      .populate("slot")
      .populate("employer")
      .populate("job");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Interview booking not found",
      });
    }

    // Delete Google Calendar event if it exists
    if (booking.googleCalendarEventId && booking.googleCalendarSynced) {
      try {
        await deleteCalendarEvent(
          booking.googleCalendarEventId,
          booking.googleCalendarAccountType || "noreply"
        );
      } catch (error) {
        console.error("❌ Failed to delete Google Calendar event:", error);
        // Continue with cancellation even if calendar deletion fails
      }
    }

    // Update booking status
    await InterviewBooking.findByIdAndUpdate(bookingId, {
      status: "cancelled",
      notes: reason ? `Cancelled: ${reason}` : "Cancelled",
      completedAt: new Date(),
    });

    // Update slot booking count
    await InterviewSlot.findByIdAndUpdate(booking.slot._id, {
      $inc: { currentBookings: -1 },
    });

    // Send cancellation emails
    try {
      // Email to candidate
      await sendEmail({
        to: booking.candidateEmail,
        subject: "Interview Cancelled - BOD Platform",
        html: `
          <h2>📅 Interview Cancelled</h2>
          <p>Dear ${booking.candidateName},</p>
          <p>We regret to inform you that your interview for the <strong>${
            booking.job.title
          }</strong> position at <strong>${
          booking.employer.companyName
        }</strong> has been cancelled.</p>
          
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          
          <p>We apologize for any inconvenience this may cause. Please feel free to apply for other positions that match your qualifications.</p>
          
          <p>Best regards,<br>BOD Platform Team</p>
        `,
      });

      // Email to employer
      await sendEmail({
        to: booking.employer.email,
        subject: "Interview Cancelled - BOD Platform",
        html: `
          <h2>📅 Interview Cancelled</h2>
          <p>The interview with <strong>${
            booking.candidateName
          }</strong> for the <strong>${
          booking.job.title
        }</strong> position has been cancelled.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Candidate Details:</h3>
            <p><strong>Name:</strong> ${booking.candidateName}</p>
            <p><strong>Email:</strong> ${booking.candidateEmail}</p>
            <p><strong>Phone:</strong> ${
              booking.candidatePhone || "Not provided"
            }</p>
          </div>
          
          ${
            reason
              ? `<p><strong>Cancellation Reason:</strong> ${reason}</p>`
              : ""
          }
          
          <p>The time slot is now available for other candidates.</p>
        `,
      });
    } catch (emailError) {
      console.error("❌ Failed to send cancellation emails:", emailError);
    }

    res.json({
      success: true,
      message: "Interview booking cancelled successfully",
      data: { bookingId, status: "cancelled" },
    });
  } catch (error) {
    console.error("Error cancelling interview booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel interview booking",
      error: error.message,
    });
  }
};

module.exports = {
  setEmployerAvailability,
  getAvailableSlots,
  scheduleInterview,
  sendInterviewInvitation,
  getInterviewInvitation,
  getEmployerCalendar,
  updateInterviewStatus,
  addInterviewParticipant,
  removeInterviewParticipant,
  cancelInterviewBooking,
};
