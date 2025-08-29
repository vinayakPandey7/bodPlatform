const ics = require("ics");

/**
 * Generate Google Meet link using Google Calendar API
 * @param {Object} booking - Interview booking data
 * @param {Object} slot - Interview slot data
 * @param {Object} job - Job details
 * @param {Object} employer - Employer details
 * @returns {Promise<string>} Google Meet URL
 */
async function generateGoogleMeetLink(booking, slot = null, job = null, employer = null) {
  try {
    // For now, we'll use the fallback meeting link (Jitsi Meet)
    // Google Calendar API integration can be added later when needed
    return generateFallbackMeetLink(booking);
  } catch (error) {
    console.error('Error generating meeting link:', error);
    return generateFallbackMeetLink(booking);
  }
}

/**
 * Generate fallback meeting link (can be Zoom, Teams, or custom solution)
 * @param {Object} booking - Interview booking data
 * @returns {string} Meeting URL
 */
function generateFallbackMeetLink(booking) {
  // Option 1: Use Zoom (if you have Zoom API integration)
  // return `https://zoom.us/j/${generateZoomMeetingId(booking)}`;
  
  // Option 2: Use Microsoft Teams (if integrated)
  // return generateTeamsMeetingLink(booking);
  
  // Option 3: Use a custom video solution like Jitsi Meet (free and reliable)
  const meetingId = `bod-interview-${booking._id || booking.bookingToken}`;
  const cleanMeetingId = meetingId.replace(/[^a-zA-Z0-9]/g, '');
  return `https://meet.jit.si/${cleanMeetingId}`;
  
  // Option 4: Use Google Meet with a simpler approach (may not always work)
  // const randomId = Math.random().toString(36).substring(2, 15);
  // return `https://meet.google.com/${randomId}`;
}

/**
 * Generate ICS calendar file content for interview booking
 * @param {Object} booking - Interview booking data
 * @param {Object} job - Job details
 * @param {Object} employer - Employer details
 * @param {string} meetLink - Google Meet link
 * @returns {string} ICS file content
 */
function generateInterviewICS(booking, job, employer, meetLink) {
  const event = {
    start: [
      new Date(booking.slotDate).getFullYear(),
      new Date(booking.slotDate).getMonth() + 1,
      new Date(booking.slotDate).getDate(),
      parseInt(booking.slotStartTime?.split(":")[0]),
      parseInt(booking.slotStartTime?.split(":")[1]),
    ],
    end: [
      new Date(booking.slotDate).getFullYear(),
      new Date(booking.slotDate).getMonth() + 1,
      new Date(booking.slotDate).getDate(),
      parseInt(booking.slotEndTime?.split(":")[0]),
      parseInt(booking.slotEndTime?.split(":")[1]),
    ],
    title: `Interview - ${job.title} at ${employer.companyName}`,
    description: `Interview for ${job.title} position at ${
      employer.companyName
    }.

Candidate: ${booking.candidateName}
Email: ${booking.candidateEmail}
Phone: ${booking.candidatePhone}

🎥 Join Video Call: ${meetLink}

Please join the meeting 5 minutes early to test your audio and video.

Job Description: ${job.description || "No description provided"}`,
    location: meetLink,
    status: "CONFIRMED",
    busyStatus: "BUSY",
    organizer: {
      name: employer.companyName,
      email: employer.email,
    },
    attendees: [
      {
        name: booking.candidateName,
        email: booking.candidateEmail,
      },
    ],
    categories: ["Interview", "Job Application"],
    alarms: [
      {
        action: "DISPLAY",
        description: "Interview Reminder",
        trigger: { hours: 1 }, // 1 hour before
      },
      {
        action: "DISPLAY",
        description: "Interview Reminder",
        trigger: { minutes: 15 }, // 15 minutes before
      },
    ],
  };

  return new Promise((resolve, reject) => {
    ics.createEvent(event, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

/**
 * Generate calendar file attachment for email
 * @param {Object} booking - Interview booking data
 * @param {Object} job - Job details
 * @param {Object} employer - Employer details
 * @returns {Object} Email attachment object
 */
async function generateCalendarAttachment(booking, job, employer) {
  try {
    const meetLink = await generateGoogleMeetLink(booking);
    const icsContent = await generateInterviewICS(booking, job, employer, meetLink);

    return {
      filename: `interview-${booking._id}.ics`,
      content: icsContent,
      contentType: "text/calendar; method=REQUEST",
      meetLink: meetLink, // Return the meet link for use in emails
    };
  } catch (error) {
    console.error("Error generating calendar file:", error);
    return null;
  }
}

module.exports = {
  generateInterviewICS,
  generateCalendarAttachment,
  generateGoogleMeetLink,
};
