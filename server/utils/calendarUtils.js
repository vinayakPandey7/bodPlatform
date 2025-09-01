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
 * @param {Object} slot - Interview slot data
 * @param {Object} job - Job details
 * @param {Object} employer - Employer details
 * @param {string} meetLink - Google Meet link
 * @returns {string} ICS file content
 */
function generateInterviewICS(booking, slot, job, employer, meetLink) {
  // Create start and end date-time objects
  const startDate = new Date(slot.date);
  const endDate = new Date(slot.date);
  
  // Parse start time (e.g., "09:00" -> [9, 0])
  const [startHour, startMinute] = slot.startTime.split(':').map(Number);
  const [endHour, endMinute] = slot.endTime.split(':').map(Number);
  
  // Set the time on the date objects
  startDate.setUTCHours(startHour, startMinute, 0, 0);
  endDate.setUTCHours(endHour, endMinute, 0, 0);

  const event = {
    start: [
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes(),
    ],
    end: [
      endDate.getFullYear(),
      endDate.getMonth() + 1,
      endDate.getDate(),
      endDate.getHours(),
      endDate.getMinutes(),
    ],
    title: `Interview - ${job.title} at ${employer.companyName}`,
    description: `Interview for ${job.title} position at ${employer.companyName}.

Candidate: ${booking.candidateName}
Email: ${booking.candidateEmail}
Phone: ${booking.candidatePhone || 'Not provided'}

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
        rsvp: true,
        partstat: 'NEEDS-ACTION',
        role: 'REQ-PARTICIPANT'
      },
    ],
    categories: ["Interview", "Job Application"],
    alarms: [
      {
        action: "display",
        description: "Interview starting in 1 hour",
        trigger: { hours: 1, before: true },
      },
      {
        action: "display", 
        description: "Interview starting in 15 minutes",
        trigger: { minutes: 15, before: true },
      },
    ],
    productId: "BOD Platform//Interview Scheduler//EN",
    uid: `interview-${booking._id}@bodplatform.com`,
    sequence: 0,
    method: 'REQUEST'
  };

  return new Promise((resolve, reject) => {
    ics.createEvent(event, (error, value) => {
      if (error) {
        console.error('ICS generation error:', error);
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
 * @param {Object} slot - Interview slot data
 * @param {Object} job - Job details
 * @param {Object} employer - Employer details
 * @returns {Object} Email attachment object
 */
async function generateCalendarAttachment(booking, slot, job, employer) {
  try {
    const meetLink = await generateGoogleMeetLink(booking);
    const icsContent = await generateInterviewICS(booking, slot, job, employer, meetLink);

    return {
      filename: `interview-${booking._id || booking.bookingToken}.ics`,
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
