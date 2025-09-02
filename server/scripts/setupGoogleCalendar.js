const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const path = require("path");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const CREDENTIALS_PATH = path.join(__dirname, "../config/credentials.json");
const TOKEN_PATH = path.join(__dirname, "../config/token.json");

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("🔗 Authorize this app by visiting this url:", authUrl);
  console.log("\n📋 Copy the URL above and paste it in your browser");
  console.log(
    "✅ After authorization, copy the code from the URL and paste it below\n"
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("❌ Error retrieving access token", err);
      oAuth2Client.setCredentials(token);

      // Store the token to disk for later program executions
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log("✅ Token stored to", TOKEN_PATH);
      console.log("🎉 Google Calendar API setup complete!");

      // Test the setup
      testCalendarAccess(oAuth2Client);
    });
  });
}

/**
 * Test Google Calendar access
 */
async function testCalendarAccess(auth) {
  const calendar = google.calendar({ version: "v3", auth });

  try {
    console.log("\n🧪 Testing Google Calendar access...");
    const res = await calendar.calendarList.list();
    console.log("✅ Successfully connected to Google Calendar!");
    console.log(`📅 Found ${res.data.items.length} calendars`);

    // Test creating a sample event with Google Meet
    console.log("\n🧪 Testing Google Meet link creation...");
    const testEvent = {
      summary: "BOD Platform Test Event",
      description: "Test event to verify Google Meet integration",
      start: {
        dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        timeZone: "America/New_York",
      },
      end: {
        dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        timeZone: "America/New_York",
      },
      conferenceData: {
        createRequest: {
          requestId: `test-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const eventRes = await calendar.events.insert({
      calendarId: "primary",
      resource: testEvent,
      conferenceDataVersion: 1,
    });

    const meetLink = eventRes.data.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === "video"
    )?.uri;

    if (meetLink) {
      console.log("✅ Google Meet link created successfully:", meetLink);
      console.log("📅 Test event created:", eventRes.data.htmlLink);

      // Clean up test event
      await calendar.events.delete({
        calendarId: "primary",
        eventId: eventRes.data.id,
      });
      console.log("🧹 Test event cleaned up");
    } else {
      console.log("⚠️ No Google Meet link found in response");
    }
  } catch (error) {
    console.error("❌ Error testing calendar access:", error.message);
  }
}

/**
 * Main setup function
 */
function setupGoogleCalendar() {
  console.log("🚀 Setting up Google Calendar API for BOD Platform...\n");

  // Check if credentials file exists
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error("❌ credentials.json not found!");
    console.log("\n📝 To set up Google Calendar API:");
    console.log("1. Go to https://console.cloud.google.com/");
    console.log("2. Create a new project or select existing one");
    console.log("3. Enable the Google Calendar API");
    console.log("4. Create credentials (OAuth 2.0 Client ID)");
    console.log("5. Download the credentials.json file");
    console.log(`6. Place it at: ${CREDENTIALS_PATH}`);
    console.log("7. Run this script again\n");
    return;
  }

  // Load client secrets from a local file
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } =
    credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[1]
  );

  // Check if we have previously stored a token
  if (fs.existsSync(TOKEN_PATH)) {
    console.log("✅ Token already exists. Testing connection...");
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    testCalendarAccess(oAuth2Client);
  } else {
    console.log("🔑 No token found. Starting OAuth flow...");
    getAccessToken(oAuth2Client);
  }
}

// Run the setup
setupGoogleCalendar();
