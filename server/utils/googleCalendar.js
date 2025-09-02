const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const CREDENTIALS_PATH = path.join(__dirname, "../config/credentials.json");
const TOKEN_PATH = path.join(__dirname, "../config/token.json");

/**
 * Initialize Google Calendar API client with OAuth2
 * @returns {Object} Google Calendar API client
 */
async function initializeGoogleCalendar() {
  try {
    // Check if credentials file exists
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.warn(
        "⚠️ Google Calendar credentials.json not found. Using fallback method."
      );
      return null;
    }

    // Load client secrets from a local file
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    const { client_secret, client_id, redirect_uris } =
      credentials.installed || credentials.web;

    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
      oAuth2Client.setCredentials(token);
    } else {
      console.warn(
        "⚠️ Google Calendar token.json not found. OAuth flow needed."
      );
      return null;
    }

    // Initialize Calendar API
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    return { calendar, auth: oAuth2Client };
  } catch (error) {
    console.error("Error initializing Google Calendar:", error);
    return null;
  }
}

/**
 * Create a Google Calendar event with Google Meet integration
 * @param {Object} eventData - Event details
 * @param {string} eventData.summary - Event title
 * @param {string} eventData.description - Event description
 * @param {Date} eventData.startTime - Event start time
 * @param {Date} eventData.endTime - Event end time
 * @param {string} eventData.timezone - Event timezone
 * @param {Array} eventData.attendees - Array of attendee emails
 * @param {string} eventData.organizerEmail - Organizer email
 * @returns {Promise<Object>} Created event with Google Meet link
 */
async function createCalendarEventWithMeet(eventData) {
  try {
    const { calendar } = initializeGoogleCalendar();

    const event = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime.toISOString(),
        timeZone: eventData.timezone || "America/New_York",
      },
      end: {
        dateTime: eventData.endTime.toISOString(),
        timeZone: eventData.timezone || "America/New_York",
      },
      attendees: eventData.attendees.map((email) => ({ email })),
      organizer: {
        email: eventData.organizerEmail,
      },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 15)}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 }, // 1 hour before
          { method: "popup", minutes: 15 }, // 15 minutes before
        ],
      },
      status: "confirmed",
      visibility: "private",
    };

    console.log("Creating Google Calendar event with Meet integration...");

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1, // Required for Google Meet integration
      sendUpdates: "all", // Send invitations to all attendees
    });

    const createdEvent = response.data;
    const meetLink = createdEvent.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === "video"
    )?.uri;

    console.log("✅ Google Calendar event created successfully");
    console.log("📅 Event ID:", createdEvent.id);
    console.log("🎥 Google Meet Link:", meetLink);

    return {
      eventId: createdEvent.id,
      meetLink: meetLink,
      htmlLink: createdEvent.htmlLink,
      event: createdEvent,
    };
  } catch (error) {
    console.error("❌ Error creating Google Calendar event:", error);

    // Return fallback meeting link if Google Calendar fails
    console.log("🔄 Falling back to simple Google Meet link...");
    const fallbackMeetId = `bod-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;
    return {
      eventId: null,
      meetLink: `https://meet.google.com/${fallbackMeetId}`,
      htmlLink: null,
      event: null,
      fallback: true,
    };
  }
}

function generateFallbackMeetLink() {
  const fallbackId = `bod-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}`;
  return `https://meet.jit.si/${fallbackId}`;
}

/**
 * Generate Google Meet link using Google Calendar API with OAuth2
 * @param {Object} booking - Interview booking data
 * @param {Object} slot - Interview slot data
 * @param {Object} job - Job details
 * @param {Object} employer - Employer details
 * @returns {Promise<string>} Google Meet URL
 */
async function generateGoogleMeetLink(booking, slot, job, employer) {
  try {
    console.log("🔄 Attempting to create real Google Meet link...");

    // Initialize Google Calendar API
    const calendarClient = await initializeGoogleCalendar();

    if (!calendarClient) {
      console.warn("⚠️ Google Calendar API not available, using fallback...");
      return generateFallbackMeetLink();
    }

    const { calendar } = calendarClient;

    // Prepare event start/end times
    const startTime = new Date(slot.date);
    const [startHour, startMinute] = (slot.startTime || "09:00").split(":");
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

    const endTime = new Date(slot.date);
    const [endHour, endMinute] = (slot.endTime || "10:00").split(":");
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    // Create Google Calendar event with Meet integration
    const event = {
      summary: `Interview - ${job.title} at ${employer.companyName}`,
      description: `Interview for ${job.title} position at ${
        employer.companyName
      }

Candidate: ${booking.candidateName}
Email: ${booking.candidateEmail}
Phone: ${booking.candidatePhone || "Not provided"}

Job Description: ${job.description || "No description provided"}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: slot.timezone || "America/New_York",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: slot.timezone || "America/New_York",
      },
      attendees: [{ email: booking.candidateEmail }, { email: employer.email }],
      conferenceData: {
        createRequest: {
          requestId: `meet-${
            booking._id || booking.bookingToken
          }-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 }, // 1 hour before
          { method: "popup", minutes: 15 }, // 15 minutes before
        ],
      },
    };

    console.log("📅 Creating Google Calendar event...");
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1, // Required for Google Meet integration
      sendUpdates: "all", // Send invitations to all attendees
    });

    // Extract Google Meet link from response
    const meetLink = response.data.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === "video"
    )?.uri;

    if (meetLink) {
      console.log("✅ Real Google Meet link created:", meetLink);
      console.log("📅 Calendar event ID:", response.data.id);
      return meetLink;
    } else {
      console.warn("⚠️ No Meet link in response, using fallback");
      return generateFallbackMeetLink();
    }
  } catch (error) {
    console.error("❌ Error creating Google Calendar event:", error.message);
    console.log("🔄 Falling back to alternative method...");
    return generateFallbackMeetLink();
  }
}

module.exports = {
  initializeGoogleCalendar,
  createCalendarEventWithMeet,
  generateGoogleMeetLink,
};
