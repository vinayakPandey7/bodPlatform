const Interview = require("../models/interview.model");
const AvailabilitySlot = require("../models/availabilitySlot.model");
const User = require("../models/user.model");
const Employer = require("../models/employer.model");
const RecruitmentPartner = require("../models/recruitmentPartner.model");
const Job = require("../models/job.model");
const {
  createInterviewBookingNotification,
  createInterviewCancellationNotification,
  createInterviewRescheduleNotification,
  createInterviewCompletionNotification,
} = require("../utils/interviewNotifications");

// Book an interview (candidate endpoint)
exports.bookInterview = async (req, res) => {
  try {
    const {
      availabilitySlotId,
      jobId,
      candidateNotes,
      interviewType
    } = req.body;

    // Validate required fields
    if (!availabilitySlotId || !jobId) {
      return res.status(400).json({ 
        message: "Availability slot ID and job ID are required" 
      });
    }

    // Find the availability slot
    const slot = await AvailabilitySlot.findById(availabilitySlotId)
      .populate('employer', 'companyName ownerName email');

    if (!slot) {
      return res.status(404).json({ message: "Availability slot not found" });
    }

    // Check if slot is bookable
    if (slot.status !== 'available' || !slot.isActive) {
      return res.status(400).json({ message: "This time slot is no longer available" });
    }

    if (slot.currentBookings >= slot.maxBookings) {
      return res.status(400).json({ message: "This time slot is fully booked" });
    }

    // Check if slot is in the future
    const slotDateTime = new Date(slot.date);
    const [hours, minutes] = slot.startTime.split(':');
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (slotDateTime <= new Date()) {
      return res.status(400).json({ message: "Cannot book past time slots" });
    }

    // Find the job
    const job = await Job.findById(jobId).populate('employer recruitmentPartner');
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Verify the slot belongs to the job's employer
    if (slot.employer._id.toString() !== job.employer._id.toString()) {
      return res.status(400).json({ 
        message: "Availability slot does not belong to the job's employer" 
      });
    }

    // Check if candidate already has an interview for this job
    const existingInterview = await Interview.findOne({
      candidate: req.user.id,
      job: jobId,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingInterview) {
      return res.status(400).json({ 
        message: "You already have a scheduled interview for this job" 
      });
    }

    // Create the interview
    const interview = new Interview({
      candidate: req.user.id,
      employer: job.employer._id,
      recruiter: job.recruitmentPartner || null,
      job: jobId,
      availabilitySlot: availabilitySlotId,
      scheduledDate: slot.date,
      scheduledTime: slot.startTime,
      duration: slot.duration,
      timezone: slot.timezone,
      meetingDetails: {
        type: slot.meetingType,
        location: slot.meetingDetails.location,
        videoLink: slot.meetingDetails.videoLink,
        phoneNumber: slot.meetingDetails.phoneNumber,
        instructions: slot.meetingDetails.instructions
      },
      interviewType: interviewType || 'screening',
      candidateNotes: candidateNotes || ''
    });

    await interview.save();

    // Update slot booking count
    slot.currentBookings += 1;
    if (slot.currentBookings >= slot.maxBookings) {
      slot.status = 'booked';
    }
    await slot.save();

    // Create notifications for interview booking
    await createInterviewBookingNotification(interview);

    // Populate interview data for response
    await interview.populate([
      { path: 'candidate', select: 'email firstName lastName' },
      { path: 'employer', select: 'companyName ownerName email' },
      { path: 'recruiter', select: 'companyName ownerName email' },
      { path: 'job', select: 'title location' }
    ]);

    res.status(201).json({
      success: true,
      message: "Interview booked successfully",
      interview
    });
  } catch (error) {
    console.error("Book interview error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get user's interviews
exports.getMyInterviews = async (req, res) => {
  try {
    const { status, upcoming, past } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build query based on user role
    let query = {};
    if (userRole === 'candidate') {
      query.candidate = userId;
    } else if (userRole === 'employer') {
      const employer = await Employer.findOne({ user: userId });
      if (!employer) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      query.employer = employer._id;
    } else if (userRole === 'recruitment_partner') {
      const recruiter = await RecruitmentPartner.findOne({ user: userId });
      if (!recruiter) {
        return res.status(404).json({ message: "Recruitment partner profile not found" });
      }
      query.recruiter = recruiter._id;
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add time-based filters
    const now = new Date();
    if (upcoming === 'true') {
      query.scheduledDate = { $gte: now };
      query.status = { $in: ['scheduled', 'confirmed'] };
    } else if (past === 'true') {
      query.scheduledDate = { $lt: now };
    }

    const interviews = await Interview.find(query)
      .populate('candidate', 'email firstName lastName')
      .populate('employer', 'companyName ownerName email')
      .populate('recruiter', 'companyName ownerName email')
      .populate('job', 'title location')
      .populate('availabilitySlot', 'title meetingType')
      .sort({ scheduledDate: 1, scheduledTime: 1 });

    res.json({
      success: true,
      interviews,
      count: interviews.length
    });
  } catch (error) {
    console.error("Get my interviews error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get interview details
exports.getInterviewDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const interview = await Interview.findById(id)
      .populate('candidate', 'email firstName lastName phoneNumber')
      .populate('employer', 'companyName ownerName email phoneNumber')
      .populate('recruiter', 'companyName ownerName email phoneNumber')
      .populate('job', 'title description location requirements')
      .populate('availabilitySlot', 'title meetingType meetingDetails');

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check if user has permission to view this interview
    let hasPermission = false;
    if (userRole === 'candidate' && interview.candidate._id.toString() === userId) {
      hasPermission = true;
    } else if (userRole === 'employer') {
      const employer = await Employer.findOne({ user: userId });
      if (employer && interview.employer._id.toString() === employer._id.toString()) {
        hasPermission = true;
      }
    } else if (userRole === 'recruitment_partner') {
      const recruiter = await RecruitmentPartner.findOne({ user: userId });
      if (recruiter && interview.recruiter && interview.recruiter._id.toString() === recruiter._id.toString()) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      success: true,
      interview
    });
  } catch (error) {
    console.error("Get interview details error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update interview status
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, employerNotes, cancellationReason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check permissions
    let hasPermission = false;
    if (userRole === 'employer') {
      const employer = await Employer.findOne({ user: userId });
      if (employer && interview.employer.toString() === employer._id.toString()) {
        hasPermission = true;
      }
    } else if (userRole === 'candidate' && interview.candidate.toString() === userId) {
      hasPermission = true;
    }

    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update interview
    if (status) {
      interview.status = status;
    }
    if (feedback) {
      interview.feedback = { ...interview.feedback, ...feedback };
    }
    if (employerNotes) {
      interview.employerNotes = employerNotes;
    }
    if (cancellationReason) {
      interview.cancellationReason = cancellationReason;
    }

    await interview.save();

    // If interview is cancelled, update availability slot
    if (status && status.includes('cancelled')) {
      const slot = await AvailabilitySlot.findById(interview.availabilitySlot);
      if (slot) {
        slot.currentBookings = Math.max(0, slot.currentBookings - 1);
        if (slot.currentBookings < slot.maxBookings) {
          slot.status = 'available';
        }
        await slot.save();
      }
    }

    // Create notifications for interview completion
    if (status === 'completed') {
      await createInterviewCompletionNotification(interview);
    }

    await interview.populate([
      { path: 'candidate', select: 'email firstName lastName' },
      { path: 'employer', select: 'companyName ownerName email' },
      { path: 'job', select: 'title location' }
    ]);

    res.json({
      success: true,
      message: "Interview updated successfully",
      interview
    });
  } catch (error) {
    console.error("Update interview status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Reschedule interview
exports.rescheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { newAvailabilitySlotId, reason } = req.body;
    const userId = req.user.id;

    if (!newAvailabilitySlotId) {
      return res.status(400).json({ message: "New availability slot ID is required" });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check if user can reschedule (candidate or employer)
    let canReschedule = false;
    let rescheduledBy = '';
    
    if (interview.candidate.toString() === userId) {
      canReschedule = true;
      rescheduledBy = 'candidate';
    } else {
      const employer = await Employer.findOne({ user: userId });
      if (employer && interview.employer.toString() === employer._id.toString()) {
        canReschedule = true;
        rescheduledBy = 'employer';
      }
    }

    if (!canReschedule) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if interview can be rescheduled
    if (!interview.canReschedule) {
      return res.status(400).json({ 
        message: "Interview cannot be rescheduled (too close to scheduled time or invalid status)" 
      });
    }

    // Find new availability slot
    const newSlot = await AvailabilitySlot.findById(newAvailabilitySlotId);
    if (!newSlot || newSlot.status !== 'available' || !newSlot.isActive) {
      return res.status(400).json({ message: "New time slot is not available" });
    }

    if (newSlot.currentBookings >= newSlot.maxBookings) {
      return res.status(400).json({ message: "New time slot is fully booked" });
    }

    // Store reschedule history
    interview.rescheduleHistory.push({
      previousDate: interview.scheduledDate,
      previousTime: interview.scheduledTime,
      newDate: newSlot.date,
      newTime: newSlot.startTime,
      reason: reason || '',
      rescheduledBy
    });

    // Free up old slot
    const oldSlot = await AvailabilitySlot.findById(interview.availabilitySlot);
    if (oldSlot) {
      oldSlot.currentBookings = Math.max(0, oldSlot.currentBookings - 1);
      if (oldSlot.currentBookings < oldSlot.maxBookings) {
        oldSlot.status = 'available';
      }
      await oldSlot.save();
    }

    // Update interview with new slot
    interview.availabilitySlot = newAvailabilitySlotId;
    interview.scheduledDate = newSlot.date;
    interview.scheduledTime = newSlot.startTime;
    interview.duration = newSlot.duration;
    interview.timezone = newSlot.timezone;
    interview.status = 'rescheduled';
    interview.meetingDetails = {
      type: newSlot.meetingType,
      location: newSlot.meetingDetails.location,
      videoLink: newSlot.meetingDetails.videoLink,
      phoneNumber: newSlot.meetingDetails.phoneNumber,
      instructions: newSlot.meetingDetails.instructions
    };

    await interview.save();

    // Book new slot
    newSlot.currentBookings += 1;
    if (newSlot.currentBookings >= newSlot.maxBookings) {
      newSlot.status = 'booked';
    }
    await newSlot.save();

    // Create notifications for interview reschedule
    await createInterviewRescheduleNotification(interview, rescheduledBy);

    await interview.populate([
      { path: 'candidate', select: 'email firstName lastName' },
      { path: 'employer', select: 'companyName ownerName email' },
      { path: 'job', select: 'title location' }
    ]);

    res.json({
      success: true,
      message: "Interview rescheduled successfully",
      interview
    });
  } catch (error) {
    console.error("Reschedule interview error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Cancel interview
exports.cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Determine cancellation status based on who's cancelling
    let newStatus = '';
    let canCancel = false;

    if (userRole === 'candidate' && interview.candidate.toString() === userId) {
      newStatus = 'cancelled_by_candidate';
      canCancel = true;
    } else if (userRole === 'employer') {
      const employer = await Employer.findOne({ user: userId });
      if (employer && interview.employer.toString() === employer._id.toString()) {
        newStatus = 'cancelled_by_employer';
        canCancel = true;
      }
    }

    if (!canCancel) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update interview status
    interview.status = newStatus;
    interview.cancellationReason = reason || '';
    await interview.save();

    // Create notifications for interview cancellation
    const cancelledBy = userRole === 'candidate' ? 'candidate' : 'employer';
    await createInterviewCancellationNotification(interview, cancelledBy, reason || '');

    // Free up the availability slot
    const slot = await AvailabilitySlot.findById(interview.availabilitySlot);
    if (slot) {
      slot.currentBookings = Math.max(0, slot.currentBookings - 1);
      if (slot.currentBookings < slot.maxBookings) {
        slot.status = 'available';
      }
      await slot.save();
    }

    res.json({
      success: true,
      message: "Interview cancelled successfully",
      interview
    });
  } catch (error) {
    console.error("Cancel interview error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get interview statistics (for dashboards)
exports.getInterviewStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let matchQuery = {};
    if (userRole === 'candidate') {
      matchQuery.candidate = userId;
    } else if (userRole === 'employer') {
      const employer = await Employer.findOne({ user: userId });
      if (!employer) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      matchQuery.employer = employer._id;
    } else if (userRole === 'recruitment_partner') {
      const recruiter = await RecruitmentPartner.findOne({ user: userId });
      if (!recruiter) {
        return res.status(404).json({ message: "Recruitment partner profile not found" });
      }
      matchQuery.recruiter = recruiter._id;
    }

    const stats = await Interview.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalInterviews = await Interview.countDocuments(matchQuery);
    const upcomingInterviews = await Interview.countDocuments({
      ...matchQuery,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    res.json({
      success: true,
      stats: {
        total: totalInterviews,
        upcoming: upcomingInterviews,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error("Get interview stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = exports;
