const ics = require("ics");

/**
 * Generate ICS calendar file content for interview booking
 * @param {Object} booking - Interview booking data
 * @param {Object} job - Job details
 * @param {Object} employer - Employer details
 * @returns {string} ICS file content
 */
function generateInterviewICS(booking, job, employer) {
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

Please arrive 10 minutes early.

Job Description: ${job.description || "No description provided"}`,
    location: employer.address || "Location to be confirmed",
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
    const icsContent = await generateInterviewICS(booking, job, employer);

    return {
      filename: `interview-${booking._id}.ics`,
      content: icsContent,
      contentType: "text/calendar; method=REQUEST",
    };
  } catch (error) {
    console.error("Error generating calendar file:", error);
    return null;
  }
}

module.exports = {
  generateInterviewICS,
  generateCalendarAttachment,
};
