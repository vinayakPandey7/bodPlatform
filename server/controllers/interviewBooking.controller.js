const InterviewBooking = require("../models/interviewBooking.model");
const AvailabilitySlot = require("../models/availabilitySlot.model");
const User = require("../models/user.model");
const Job = require("../models/job.model");
const Employer = require("../models/employer.model");
const crypto = require("crypto");
const { sendEmail } = require("../utils/email");

// Create interview booking invitation when candidate is submitted
exports.createInterviewInvitation = async (candidateUser, jobId, employerId, applicationId, recruitmentPartnerId = null) => {
  try {
    // Find available slots for the employer
    const availableSlots = await AvailabilitySlot.find({
      employer: employerId,
      status: "available",
      isActive: true,
      date: { $gte: new Date() },
      $expr: { $lt: ["$currentBookings", "$maxBookings"] }
    }).sort({ date: 1, startTime: 1 });

    if (availableSlots.length === 0) {
      console.log("No available slots found for employer:", employerId);
      return null;
    }

    // Generate unique booking token
    const bookingToken = crypto.randomBytes(32).toString('hex');

    // Create interview booking record
    const interviewBooking = new InterviewBooking({
      candidate: candidateUser._id,
      employer: employerId,
      job: jobId,
      availabilitySlot: availableSlots[0]._id, // We'll update this when candidate selects
      recruitmentPartner: recruitmentPartnerId,
      application: applicationId,
      bookingToken,
      candidateDetails: {
        name: `${candidateUser.firstName || ''} ${candidateUser.lastName || ''}`.trim() || candidateUser.email.split('@')[0],
        email: candidateUser.email,
        phone: candidateUser.phoneNumber || candidateUser.personalInfo?.phone || '',
      },
      interviewDetails: {
        type: availableSlots[0].meetingType,
        location: availableSlots[0].meetingDetails?.location,
        videoLink: availableSlots[0].meetingDetails?.videoLink,
        phoneNumber: availableSlots[0].meetingDetails?.phoneNumber,
        instructions: availableSlots[0].meetingDetails?.instructions,
      },
      scheduledDateTime: new Date(availableSlots[0].date),
      duration: availableSlots[0].duration,
      timezone: availableSlots[0].timezone,
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
    });

    await interviewBooking.save();

    // Populate job and employer data for email
    await interviewBooking.populate(['job', 'employer']);

    // Send email invitation to candidate
    await sendInterviewInvitationEmail(interviewBooking);

    return interviewBooking;
  } catch (error) {
    console.error("Error creating interview invitation:", error);
    throw error;
  }
};

// Get available slots for a booking token
exports.getAvailableSlots = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Booking token is required"
      });
    }

    // Find the booking
    const booking = await InterviewBooking.findByToken(token);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired booking link",
        expired: true
      });
    }

    // Check if already booked
    if (booking.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: "Interview slot has already been booked",
        alreadyBooked: true,
        booking: {
          scheduledDateTime: booking.scheduledDateTime,
          duration: booking.duration,
          timezone: booking.timezone,
          interviewDetails: booking.interviewDetails,
          job: booking.job
        }
      });
    }

    // Get available slots for the employer
    const availableSlots = await AvailabilitySlot.find({
      employer: booking.employer._id,
      status: "available",
      isActive: true,
      date: { $gte: new Date() },
      $expr: { $lt: ["$currentBookings", "$maxBookings"] }
    }).sort({ date: 1, startTime: 1 });

    // Format slots for frontend
    const formattedSlots = availableSlots.map(slot => ({
      _id: slot._id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      timezone: slot.timezone,
      meetingType: slot.meetingType,
      meetingDetails: slot.meetingDetails,
      availableSpots: slot.maxBookings - slot.currentBookings
    }));

    res.json({
      success: true,
      data: {
        booking: {
          candidate: booking.candidateDetails,
          job: booking.job,
          employer: booking.employer,
          status: booking.status
        },
        availableSlots: formattedSlots,
        expiresAt: booking.tokenExpiresAt
      }
    });

  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching available slots",
      error: error.message
    });
  }
};

// Book a specific slot
exports.bookInterviewSlot = async (req, res) => {
  try {
    const { token, slotId, candidateNotes } = req.body;

    if (!token || !slotId) {
      return res.status(400).json({
        success: false,
        message: "Booking token and slot ID are required"
      });
    }

    // Find the booking
    const booking = await InterviewBooking.findByToken(token);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired booking link"
      });
    }

    // Check if already booked
    if (booking.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: "Interview slot has already been booked"
      });
    }

    // Find the selected slot
    const selectedSlot = await AvailabilitySlot.findById(slotId);

    if (!selectedSlot) {
      return res.status(404).json({
        success: false,
        message: "Selected time slot not found"
      });
    }

    // Check if slot is still available
    if (selectedSlot.status !== 'available' || selectedSlot.currentBookings >= selectedSlot.maxBookings) {
      return res.status(400).json({
        success: false,
        message: "Selected time slot is no longer available"
      });
    }

    // Update booking with selected slot
    booking.availabilitySlot = selectedSlot._id;
    booking.scheduledDateTime = new Date(
      selectedSlot.date.toDateString() + ' ' + selectedSlot.startTime
    );
    booking.duration = selectedSlot.duration;
    booking.timezone = selectedSlot.timezone;
    booking.interviewDetails = {
      type: selectedSlot.meetingType,
      location: selectedSlot.meetingDetails?.location,
      videoLink: selectedSlot.meetingDetails?.videoLink,
      phoneNumber: selectedSlot.meetingDetails?.phoneNumber,
      instructions: selectedSlot.meetingDetails?.instructions,
    };
    booking.status = 'confirmed';
    booking.notes.candidate = candidateNotes || '';

    await booking.save();

    // Update slot booking count
    selectedSlot.currentBookings += 1;
    if (selectedSlot.currentBookings >= selectedSlot.maxBookings) {
      selectedSlot.status = 'booked';
    }
    await selectedSlot.save();

    // Update candidate's application status
    const candidate = await User.findById(booking.candidate);
    if (candidate && candidate.applications) {
      const application = candidate.applications.find(app => 
        app._id.toString() === booking.application.toString()
      );
      if (application) {
        application.status = 'interview_scheduled';
        application.interviewDetails = {
          scheduledDateTime: booking.scheduledDateTime,
          duration: booking.duration,
          type: booking.interviewDetails.type,
          meetingDetails: booking.interviewDetails
        };
        await candidate.save();
      }
    }

    // Send confirmation emails
    await sendInterviewConfirmationEmail(booking);

    res.json({
      success: true,
      message: "Interview slot booked successfully",
      data: {
        booking: {
          scheduledDateTime: booking.scheduledDateTime,
          duration: booking.duration,
          timezone: booking.timezone,
          interviewDetails: booking.interviewDetails,
          job: booking.job,
          status: booking.status
        }
      }
    });

  } catch (error) {
    console.error("Error booking interview slot:", error);
    res.status(500).json({
      success: false,
      message: "Server error while booking interview slot",
      error: error.message
    });
  }
};

// Get booking status
exports.getBookingStatus = async (req, res) => {
  try {
    const { token } = req.params;

    const booking = await InterviewBooking.findByToken(token);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired booking link",
        expired: true
      });
    }

    res.json({
      success: true,
      data: {
        booking: {
          status: booking.status,
          candidate: booking.candidateDetails,
          job: booking.job,
          employer: booking.employer,
          scheduledDateTime: booking.scheduledDateTime,
          duration: booking.duration,
          timezone: booking.timezone,
          interviewDetails: booking.interviewDetails,
          expiresAt: booking.tokenExpiresAt,
          bookedAt: booking.bookedAt
        }
      }
    });

  } catch (error) {
    console.error("Error fetching booking status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching booking status",
      error: error.message
    });
  }
};

// Helper function to send interview invitation email
async function sendInterviewInvitationEmail(booking) {
  try {
    const bookingUrl = booking.generateBookingUrl();
    
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Interview Invitation</h2>
        
        <p>Dear ${booking.candidateDetails.name},</p>
        
        <p>Congratulations! You have been invited to schedule an interview for the position:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0; color: #2c3e50;">${booking.job.title}</h3>
          <p style="margin: 5px 0; color: #666;">${booking.employer.companyName}</p>
          <p style="margin: 5px 0; color: #666;">📍 ${booking.job.location}</p>
        </div>
        
        <p>Please click the link below to select your preferred interview time slot:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${bookingUrl}" 
             style="background-color: #3498db; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Schedule Interview
          </a>
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
          <li>This link expires on ${new Date(booking.tokenExpiresAt).toLocaleDateString()}</li>
          <li>Please book your slot as soon as possible</li>
          <li>You will receive confirmation details once you select a time</li>
        </ul>
        
        <p>If you have any questions, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>
        ${booking.employer.companyName} Recruitment Team</p>
      </div>
    `;

    await sendEmail({
      to: booking.candidateDetails.email,
      subject: `Interview Invitation - ${booking.job.title} at ${booking.employer.companyName}`,
      html: emailTemplate
    });

    // Update email sent timestamp
    booking.emailSent.invitation = new Date();
    await booking.save();

  } catch (error) {
    console.error("Error sending interview invitation email:", error);
    throw error;
  }
}

// Helper function to send interview confirmation email
async function sendInterviewConfirmationEmail(booking) {
  try {
    const interviewDate = new Date(booking.scheduledDateTime);
    const formattedDate = interviewDate.toLocaleDateString();
    const formattedTime = interviewDate.toLocaleTimeString();

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Interview Confirmed!</h2>
        
        <p>Dear ${booking.candidateDetails.name},</p>
        
        <p>Your interview has been successfully scheduled!</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Interview Details</h3>
          <p><strong>Position:</strong> ${booking.job.title}</p>
          <p><strong>Company:</strong> ${booking.employer.companyName}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime} (${booking.timezone})</p>
          <p><strong>Duration:</strong> ${booking.duration} minutes</p>
          <p><strong>Type:</strong> ${booking.interviewDetails.type}</p>
          
          ${booking.interviewDetails.videoLink ? 
            `<p><strong>Video Link:</strong> <a href="${booking.interviewDetails.videoLink}">${booking.interviewDetails.videoLink}</a></p>` : 
            ''
          }
          ${booking.interviewDetails.phoneNumber ? 
            `<p><strong>Phone:</strong> ${booking.interviewDetails.phoneNumber}</p>` : 
            ''
          }
          ${booking.interviewDetails.location ? 
            `<p><strong>Location:</strong> ${booking.interviewDetails.location}</p>` : 
            ''
          }
        </div>
        
        ${booking.interviewDetails.instructions ? 
          `<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">Instructions</h4>
            <p style="margin: 0;">${booking.interviewDetails.instructions}</p>
          </div>` : 
          ''
        }
        
        <p><strong>What to expect:</strong></p>
        <ul>
          <li>Please join the interview 5 minutes early</li>
          <li>Have your resume and any relevant documents ready</li>
          <li>Prepare questions about the role and company</li>
          <li>Ensure stable internet connection for video interviews</li>
        </ul>
        
        <p>We look forward to speaking with you!</p>
        
        <p>Best regards,<br>
        ${booking.employer.companyName} Recruitment Team</p>
      </div>
    `;

    await sendEmail({
      to: booking.candidateDetails.email,
      subject: `Interview Confirmed - ${booking.job.title} at ${booking.employer.companyName}`,
      html: emailTemplate
    });

    // Update email sent timestamp
    booking.emailSent.confirmation = new Date();
    await booking.save();

  } catch (error) {
    console.error("Error sending interview confirmation email:", error);
    throw error;
  }
}

module.exports = {
  createInterviewInvitation: exports.createInterviewInvitation,
  getAvailableSlots: exports.getAvailableSlots,
  bookInterviewSlot: exports.bookInterviewSlot,
  getBookingStatus: exports.getBookingStatus
};
