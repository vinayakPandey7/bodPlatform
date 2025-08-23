const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const { format } = require("date-fns");

// Create interview booking notification
const createInterviewBookingNotification = async (interview) => {
  try {
    const candidate = await User.findById(interview.candidate).select('email firstName lastName');
    const employer = await User.findById(interview.employer).select('email');
    
    const interviewDate = format(new Date(interview.scheduledDate), 'EEEE, MMMM d, yyyy');
    const interviewTime = interview.scheduledTime;

    // Notification for candidate
    await Notification.create({
      title: "Interview Scheduled",
      message: `Your interview has been scheduled for ${interviewDate} at ${interviewTime}. Please check your interview details for meeting information.`,
      type: "success",
      recipient: interview.candidate,
    });

    // Notification for employer
    if (employer) {
      const candidateName = candidate ? `${candidate.firstName} ${candidate.lastName}` : 'A candidate';
      await Notification.create({
        title: "Interview Booked",
        message: `${candidateName} has booked an interview for ${interviewDate} at ${interviewTime}. Please prepare for the interview.`,
        type: "info",
        recipient: interview.employer,
      });
    }

    console.log("Interview booking notifications created successfully");
  } catch (error) {
    console.error("Error creating interview booking notifications:", error);
  }
};

// Create interview cancellation notification
const createInterviewCancellationNotification = async (interview, cancelledBy, reason) => {
  try {
    const candidate = await User.findById(interview.candidate).select('email firstName lastName');
    const employer = await User.findById(interview.employer).select('email');
    
    const interviewDate = format(new Date(interview.scheduledDate), 'EEEE, MMMM d, yyyy');
    const interviewTime = interview.scheduledTime;

    if (cancelledBy === 'candidate') {
      // Notification for employer
      if (employer) {
        const candidateName = candidate ? `${candidate.firstName} ${candidate.lastName}` : 'The candidate';
        await Notification.create({
          title: "Interview Cancelled",
          message: `${candidateName} has cancelled the interview scheduled for ${interviewDate} at ${interviewTime}. Reason: ${reason}`,
          type: "warning",
          recipient: interview.employer,
        });
      }
    } else if (cancelledBy === 'employer') {
      // Notification for candidate
      await Notification.create({
        title: "Interview Cancelled",
        message: `Your interview scheduled for ${interviewDate} at ${interviewTime} has been cancelled by the employer. Reason: ${reason}`,
        type: "warning",
        recipient: interview.candidate,
      });
    }

    console.log("Interview cancellation notifications created successfully");
  } catch (error) {
    console.error("Error creating interview cancellation notifications:", error);
  }
};

// Create interview reschedule notification
const createInterviewRescheduleNotification = async (interview, rescheduledBy) => {
  try {
    const candidate = await User.findById(interview.candidate).select('email firstName lastName');
    const employer = await User.findById(interview.employer).select('email');
    
    const newInterviewDate = format(new Date(interview.scheduledDate), 'EEEE, MMMM d, yyyy');
    const newInterviewTime = interview.scheduledTime;

    if (rescheduledBy === 'candidate') {
      // Notification for employer
      if (employer) {
        const candidateName = candidate ? `${candidate.firstName} ${candidate.lastName}` : 'The candidate';
        await Notification.create({
          title: "Interview Rescheduled",
          message: `${candidateName} has rescheduled the interview to ${newInterviewDate} at ${newInterviewTime}.`,
          type: "info",
          recipient: interview.employer,
        });
      }
    } else if (rescheduledBy === 'employer') {
      // Notification for candidate
      await Notification.create({
        title: "Interview Rescheduled",
        message: `Your interview has been rescheduled to ${newInterviewDate} at ${newInterviewTime}.`,
        type: "info",
        recipient: interview.candidate,
      });
    }

    console.log("Interview reschedule notifications created successfully");
  } catch (error) {
    console.error("Error creating interview reschedule notifications:", error);
  }
};

// Create interview reminder notification
const createInterviewReminderNotification = async (interview, reminderType) => {
  try {
    const candidate = await User.findById(interview.candidate).select('email firstName lastName');
    const employer = await User.findById(interview.employer).select('email');
    
    const interviewDate = format(new Date(interview.scheduledDate), 'EEEE, MMMM d, yyyy');
    const interviewTime = interview.scheduledTime;

    let reminderMessage = '';
    switch (reminderType) {
      case '24h':
        reminderMessage = `Reminder: You have an interview tomorrow (${interviewDate}) at ${interviewTime}.`;
        break;
      case '1h':
        reminderMessage = `Reminder: Your interview starts in 1 hour at ${interviewTime}.`;
        break;
      case '15m':
        reminderMessage = `Reminder: Your interview starts in 15 minutes at ${interviewTime}.`;
        break;
      default:
        reminderMessage = `Reminder: You have an upcoming interview on ${interviewDate} at ${interviewTime}.`;
    }

    // Notification for candidate
    await Notification.create({
      title: "Interview Reminder",
      message: reminderMessage,
      type: "info",
      recipient: interview.candidate,
    });

    // Notification for employer
    if (employer) {
      const candidateName = candidate ? `${candidate.firstName} ${candidate.lastName}` : 'A candidate';
      await Notification.create({
        title: "Interview Reminder",
        message: `Reminder: You have an interview with ${candidateName} on ${interviewDate} at ${interviewTime}.`,
        type: "info",
        recipient: interview.employer,
      });
    }

    console.log(`Interview ${reminderType} reminder notifications created successfully`);
  } catch (error) {
    console.error(`Error creating interview ${reminderType} reminder notifications:`, error);
  }
};

// Create interview completion notification
const createInterviewCompletionNotification = async (interview) => {
  try {
    const candidate = await User.findById(interview.candidate).select('email firstName lastName');
    
    // Notification for candidate
    await Notification.create({
      title: "Interview Completed",
      message: "Thank you for completing your interview. We will get back to you with feedback soon.",
      type: "success",
      recipient: interview.candidate,
    });

    console.log("Interview completion notification created successfully");
  } catch (error) {
    console.error("Error creating interview completion notification:", error);
  }
};

module.exports = {
  createInterviewBookingNotification,
  createInterviewCancellationNotification,
  createInterviewRescheduleNotification,
  createInterviewReminderNotification,
  createInterviewCompletionNotification,
};
