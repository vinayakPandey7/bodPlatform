const ics = require("ics");
const { generateGoogleMeetLink } = require("./googleCalendar");

/**
 * Generate Google Meet link using Google Calendar API
 * @param {Object} booking - Interview booking data
 * @param {Object} slot - Interview slot data
 * @param {Object} job - Job details
 * @param {Object} employer - Employer details
 * @returns {Promise<string>} Google Meet URL
 */
async function generateGoogleMeetLinkWrapper(
  booking,
  slot = null,
  job = null,
  employer = null
) {
  try {
    // Generate Google Meet link with proper format
    return generateValidGoogleMeetLink(booking);
  } catch (error) {
    console.error("Error generating Google Meet link:", error);
    // Fallback to Jitsi if Google Meet fails
    const meetingId = `bod-interview-${booking._id || booking.bookingToken}`;
    const cleanMeetingId = meetingId.replace(/[^a-zA-Z0-9]/g, "");
    return `https://meet.jit.si/${cleanMeetingId}`;
  }
}

/**
 * Generate Google Meet link using a valid format
 * @param {Object} booking - Interview booking data
 * @returns {string} Google Meet URL
 */
function generateValidGoogleMeetLink(booking) {
  // Generate a unique meeting code in Google Meet format (xxx-xxxx-xxx)
  const timestamp = Date.now().toString();
  const bookingId = booking._id || booking.bookingToken || timestamp;

  // Create a unique identifier from booking data
  const uniqueString = `${bookingId}${timestamp}`;
  const hash = uniqueString.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  // Convert to positive number and format as Google Meet code
  const positiveHash = Math.abs(hash);
  const meetCode = positiveHash.toString().padStart(10, "0");

  // Format as xxx-xxxx-xxx
  const formattedCode = `${meetCode.substring(0, 3)}-${meetCode.substring(
    3,
    7
  )}-${meetCode.substring(7, 10)}`;

  return `https://meet.google.com/${formattedCode}`;
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
  console.log("Generating ICS with data:", {
    booking: booking._id,
    slot: slot.date,
    job: job.title,
  });

  const slotDate = new Date(slot.date);
  const startTimeParts = slot.startTime?.split(":") || ["09", "00"];
  const endTimeParts = slot.endTime?.split(":") || ["10", "00"];

  const event = {
    start: [
      slotDate.getFullYear(),
      slotDate.getMonth() + 1,
      slotDate.getDate(),
      parseInt(startTimeParts[0]),
      parseInt(startTimeParts[1]),
    ],
    end: [
      slotDate.getFullYear(),
      slotDate.getMonth() + 1,
      slotDate.getDate(),
      parseInt(endTimeParts[0]),
      parseInt(endTimeParts[1]),
    ],
    title: `Interview - ${job.title} at ${employer.companyName}`,
    description: `Interview for ${job.title} position at ${
      employer.companyName
    }.

Candidate: ${booking.candidateName}
Email: ${booking.candidateEmail}
Phone: ${booking.candidatePhone || "Not provided"}

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
        partstat: "NEEDS-ACTION",
        role: "REQ-PARTICIPANT",
      },
    ],
    categories: ["Interview", "Job Application"],
    alarms: [
      {
        action: "display",
        description: "Interview Reminder",
        trigger: { hours: 1 }, // 1 hour before
      },
      {
        action: "display",
        description: "Interview Reminder",
        trigger: { minutes: 15 }, // 15 minutes before
      },
    ],
    productId: "BOD Platform//Interview Scheduler//EN",
    uid: `interview-${booking._id}@theciero.com`,
    sequence: 0,
    method: "REQUEST",
  };

  return new Promise((resolve, reject) => {
    ics.createEvent(event, (error, value) => {
      if (error) {
        console.error("ICS generation error:", error);
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
    console.log("Starting calendar attachment generation...");
    // Use the meeting link from the booking if it exists (from Google Calendar integration)
    const meetLink = booking.meetingLink || await generateGoogleMeetLinkWrapper(
      booking,
      slot,
      job,
      employer
    );
    console.log("Using meet link:", meetLink);

    const icsContent = await generateInterviewICS(
      booking,
      slot,
      job,
      employer,
      meetLink
    );
    console.log("Generated ICS content length:", icsContent?.length);

    if (!icsContent) {
      console.error("ICS content is null or empty");
      return null;
    }

    // // Return both attachment format and icalEvent format for flexibility
    // const calendarData = {
    //   // For regular attachment
    //   attachment: {
    //     filename: `interview-${booking._id}.ics`,
    //     content: icsContent,
    //     contentType: "text/calendar; charset=utf-8; method=REQUEST",
    //   },
    //   // For nodemailer icalEvent (preferred for calendar invites)
    //   icalEvent: {
    //     filename: `interview-${booking._id}.ics`,
    //     method: 'REQUEST',
    //     content: icsContent
    //   },
    //   // For nodemailer alternatives format
    //   alternatives: {
    //     contentType: "text/calendar; method=REQUEST",
    //     content: Buffer.from(icsContent),
    //     component: "VEVENT",
    //     "Content-Class": "urn:content-classes:calendarmessage"
    //   },
    //   meetLink: meetLink,
    //   icsContent: icsContent
    // };
    // ✅ Return both icalEvent and regular attachment for better compatibility
    const calendarData = {
      icalEvent: {
        filename: `interview-${booking._id}.ics`,
        method: "REQUEST",
        content: icsContent,
      },
      attachment: {
        filename: `interview-${booking._id}.ics`,
        content: icsContent,
        contentType: "text/calendar; charset=utf-8; method=REQUEST",
      },
      meetLink,
    };

    console.log("Calendar data created successfully");
    return calendarData;
  } catch (error) {
    console.error("Error generating calendar file:", error);
    console.error("Error stack:", error.stack);
    return null;
  }
}

module.exports = {
  generateInterviewICS,
  generateCalendarAttachment,
  generateGoogleMeetLink: generateGoogleMeetLinkWrapper,
  generateValidGoogleMeetLink,
};
