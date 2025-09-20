const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];
const ADMIN_CREDENTIALS_PATH = path.join(
  __dirname,
  "../config/credentials.json"
);
const ADMIN_TOKEN_PATH = path.join(__dirname, "../config/token.json");
const NOREPLY_CREDENTIALS_PATH = path.join(
  __dirname,
  "../config/noreply-credentials.json"
);
const NOREPLY_TOKEN_PATH = path.join(__dirname, "../config/noreply-token.json");

/**
 * Get Google OAuth credentials from environment variables
 * @param {string} accountType - 'admin' or 'noreply'
 * @returns {Object|null} Credentials object or null if not found
 */
function getCredentialsFromEnv(accountType = "admin") {
  const prefix = accountType === "noreply" ? "NOREPLY_" : "ADMIN_";
  
  const clientId = process.env[`${prefix}GOOGLE_CLIENT_ID`];
  const clientSecret = process.env[`${prefix}GOOGLE_CLIENT_SECRET`];
  const redirectUri = process.env[`${prefix}GOOGLE_REDIRECT_URI`];
  
  if (!clientId || !clientSecret) {
    return null;
  }
  
  return {
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [redirectUri || "http://localhost"]
  };
}

/**
 * Get Google OAuth token from environment variables
 * @param {string} accountType - 'admin' or 'noreply'
 * @returns {Object|null} Token object or null if not found
 */
function getTokenFromEnv(accountType = "admin") {
  const prefix = accountType === "noreply" ? "NOREPLY_" : "ADMIN_";
  
  const accessToken = process.env[`${prefix}GOOGLE_ACCESS_TOKEN`];
  const refreshToken = process.env[`${prefix}GOOGLE_REFRESH_TOKEN`];
  
  if (!accessToken || !refreshToken) {
    return null;
  }
  
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    scope: process.env[`${prefix}GOOGLE_SCOPE`] || "https://www.googleapis.com/auth/calendar",
    token_type: process.env[`${prefix}GOOGLE_TOKEN_TYPE`] || "Bearer"
  };
}

/**
 * Initialize Google Calendar API client with OAuth2
 * @param {string} accountType - 'admin' or 'noreply'
 * @returns {Object} Google Calendar API client
 */
async function initializeGoogleCalendar(accountType = "admin") {
  try {
    const credentialsPath =
      accountType === "noreply"
        ? NOREPLY_CREDENTIALS_PATH
        : ADMIN_CREDENTIALS_PATH;
    const tokenPath =
      accountType === "noreply" ? NOREPLY_TOKEN_PATH : ADMIN_TOKEN_PATH;

    let credentials = null;
    let token = null;

    // First try to get credentials from environment variables
    credentials = getCredentialsFromEnv(accountType);
    token = getTokenFromEnv(accountType);

    // If environment variables are not available, fall back to files
    if (!credentials && fs.existsSync(credentialsPath)) {
      console.log(`📁 Loading ${accountType} credentials from file...`);
      const credentialsData = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
      credentials = credentialsData.installed || credentialsData.web;
    }

    if (!token && fs.existsSync(tokenPath)) {
      console.log(`📁 Loading ${accountType} token from file...`);
      token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
    }

    // Check if we have all required credentials
    if (!credentials || !credentials.client_id || !credentials.client_secret) {
      console.warn(
        `⚠️ Google Calendar ${accountType} credentials not found in environment or files.`
      );
      return null;
    }

    if (!token || !token.access_token || !token.refresh_token) {
      console.warn(
        `⚠️ Google Calendar ${accountType} token not found in environment or files.`
      );
      return null;
    }

    console.log(`✅ Using ${accountType} credentials from ${credentials.source || 'environment variables'}`);

    const oAuth2Client = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris[0]
    );

    oAuth2Client.setCredentials(token);

    // Initialize Calendar API
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    return { calendar, auth: oAuth2Client, accountType };
  } catch (error) {
    console.error(
      `Error initializing Google Calendar (${accountType}):`,
      error
    );
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
    const calendarClient = await initializeGoogleCalendar(
      eventData.accountType || "admin"
    );
    if (!calendarClient) {
      throw new Error("Google Calendar API not available");
    }
    const { calendar } = calendarClient;

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

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1, // Required for Google Meet integration
      sendUpdates: "all", // Send invitations to all attendees
      sendNotifications: true, // Ensure notifications are sent
    });

    const createdEvent = response.data;
    const meetLink = createdEvent.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === "video"
    )?.uri;

    return {
      eventId: createdEvent.id,
      meetLink: meetLink,
      htmlLink: createdEvent.htmlLink,
      event: createdEvent,
    };
  } catch (error) {
    console.error("❌ Error creating Google Calendar event:", error);

    // Return fallback meeting link if Google Calendar fails

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

function generateFallbackMeetLink(bookingId) {
  // This should only be used if Google Calendar API completely fails
  console.error("❌ FALLBACK: Google Calendar API failed to create Meet link");
  throw new Error(
    "Google Calendar API failed - cannot create meeting without proper scheduling"
  );
}

/**
 * Create interview calendar event with Google Meet integration
 * @param {Object} interviewData - Interview details
 * @param {Object} interviewData.booking - Interview booking data
 * @param {Object} interviewData.slot - Interview slot data
 * @param {Object} interviewData.job - Job details
 * @param {Object} interviewData.employer - Employer details
 * @param {string} interviewData.accountType - 'admin' or 'noreply'
 * @returns {Promise<Object>} Created event with Google Meet link and event ID
 */
async function createInterviewCalendarEvent(interviewData) {
  const {
    booking,
    slot,
    job,
    employer,
    accountType = "noreply",
  } = interviewData;

  try {
    console.log(
      `🔄 Creating interview calendar event using ${accountType} account...`
    );

    // Initialize Google Calendar API
    const calendarClient = await initializeGoogleCalendar(accountType);

    if (!calendarClient) {
      console.warn(
        `⚠️ Google Calendar API (${accountType}) not available, using fallback...`
      );
      return {
        eventId: null,
        meetLink: generateFallbackMeetLink(booking._id || booking.bookingToken),
        htmlLink: null,
        fallback: true,
      };
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

Job Description: ${job.description || "No description provided"}

--- BOD Platform Interview ---`,
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
      visibility: "default",
    };

    console.log("📅 Creating Google Calendar event with Meet integration...");
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1, // Required for Google Meet integration
      sendUpdates: "all", // Send invitations to all attendees
      sendNotifications: true, // Ensure notifications are sent
    });

    console.log(
      "📋 Full Calendar API Response:",
      JSON.stringify(response.data, null, 2)
    );

    // Extract Google Meet link from response
    const meetLink = response.data.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === "video"
    )?.uri;

    if (meetLink) {
      console.log("✅ Interview calendar event created successfully");
      console.log("📅 Event ID:", response.data.id);
      console.log("🎥 Google Meet Link:", meetLink);

      return {
        eventId: response.data.id,
        meetLink: meetLink,
        htmlLink: response.data.htmlLink,
        event: response.data,
        fallback: false,
      };
    } else {
      console.warn("⚠️ No Meet link in Calendar API response");
      console.log("🔍 Conference Data:", response.data.conferenceData);

      // Try alternative Meet link extraction methods
      let alternativeMeetLink = null;

      // Check if there's a hangoutLink (legacy)
      if (response.data.hangoutLink) {
        alternativeMeetLink = response.data.hangoutLink;
        console.log("📞 Found hangout link:", alternativeMeetLink);
      }

      // Check conference data more thoroughly
      if (response.data.conferenceData?.entryPoints) {
        const allEntryPoints = response.data.conferenceData.entryPoints;
        console.log("🔍 All entry points:", allEntryPoints);

        // Try to find any video entry point
        const videoEntry = allEntryPoints.find(
          (entry) =>
            entry.entryPointType === "video" ||
            entry.uri?.includes("meet.google.com")
        );

        if (videoEntry) {
          alternativeMeetLink = videoEntry.uri;
          console.log("📹 Found alternative video link:", alternativeMeetLink);
        }
      }

      const finalMeetLink =
        alternativeMeetLink ||
        generateFallbackMeetLink(booking._id || booking.bookingToken);

      return {
        eventId: response.data.id,
        meetLink: finalMeetLink,
        htmlLink: response.data.htmlLink,
        event: response.data,
        fallback: !alternativeMeetLink,
      };
    }
  } catch (error) {
    console.error(
      `❌ Error creating interview calendar event (${accountType}):`,
      error.message
    );
    console.log("🔄 Falling back to simple Google Meet link...");
    return {
      eventId: null,
      meetLink: generateFallbackMeetLink(booking._id || booking.bookingToken),
      htmlLink: null,
      fallback: true,
    };
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use createInterviewCalendarEvent instead
 */
async function generateGoogleMeetLink(booking, slot, job, employer) {
  const result = await createInterviewCalendarEvent({
    booking,
    slot,
    job,
    employer,
    accountType: "noreply",
  });

  return result.meetLink;
}

/**
 * Delete a Google Calendar event
 * @param {string} eventId - Google Calendar event ID
 * @param {string} accountType - 'admin' or 'noreply'
 * @returns {Promise<boolean>} Success status
 */
async function deleteCalendarEvent(eventId, accountType = "admin") {
  try {
    const calendarClient = await initializeGoogleCalendar(accountType);
    if (!calendarClient) {
      console.warn(
        `⚠️ Google Calendar API (${accountType}) not available for deletion`
      );
      return false;
    }

    const { calendar } = calendarClient;

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
      sendUpdates: "all",
    });

    console.log(`✅ Calendar event ${eventId} deleted successfully`);
    return true;
  } catch (error) {
    console.error(
      `❌ Error deleting calendar event ${eventId}:`,
      error.message
    );
    return false;
  }
}

module.exports = {
  initializeGoogleCalendar,
  createCalendarEventWithMeet,
  createInterviewCalendarEvent,
  generateGoogleMeetLink,
  generateFallbackMeetLink,
  deleteCalendarEvent,
};
