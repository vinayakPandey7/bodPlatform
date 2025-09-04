# Google Meet Integration Setup

This guide will help you set up real Google Meet links for interview invitations in the BOD Platform.

## Prerequisites

1. Google Cloud Console account
2. Google Calendar API enabled
3. OAuth 2.0 credentials

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable Google Calendar API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Desktop application" as the application type
4. Name it "BOD Platform Calendar Integration"
5. Download the credentials JSON file

## Step 4: Setup in BOD Platform

1. **Place credentials file:**
   ```bash
   # Copy your downloaded credentials file to:
   /server/config/credentials.json
   ```

2. **Run the setup script:**
   ```bash
   cd /path/to/bodPlatform/server
   node scripts/setupGoogleCalendar.js
   ```

3. **Follow the OAuth flow:**
   - The script will provide an authorization URL
   - Open the URL in your browser
   - Sign in with your Google account
   - Grant calendar permissions
   - Copy the authorization code
   - Paste it back in the terminal

## Step 5: Verify Setup

The setup script will automatically test the integration by:
- Connecting to Google Calendar API
- Creating a test event with Google Meet link
- Cleaning up the test event

## How It Works

Once configured, the system will:

1. **When candidate status changes to interview status:**
   - Create a real Google Calendar event
   - Generate an authentic Google Meet link
   - Send the link to the candidate via email
   - Include calendar invitation (ICS file)

2. **Benefits of real Google Meet links:**
   - Proper Google Meet rooms with all features
   - Automatic calendar integration
   - Meeting recordings (if enabled)
   - Better reliability and security

## Troubleshooting

### Common Issues:

1. **"credentials.json not found"**
   - Ensure the file is placed in `/server/config/credentials.json`
   - Check file permissions

2. **"OAuth flow failed"**
   - Make sure you're using the correct Google account
   - Check that Calendar API is enabled
   - Verify redirect URIs in credentials

3. **"No Meet link in response"**
   - Ensure Google Meet is enabled for your Google Workspace
   - Check Calendar API quotas

### Fallback Behavior:

If Google Calendar API is not configured or fails:
- System automatically falls back to Jitsi Meet links
- No interruption to interview scheduling
- Error logs help identify configuration issues

## Environment Variables (Optional)

For additional configuration, you can set:

```bash
# Default timezone for events
GOOGLE_CALENDAR_TIMEZONE=America/New_York

# Calendar ID (defaults to 'primary')
GOOGLE_CALENDAR_ID=primary
```

## Security Notes

- Keep `credentials.json` and `token.json` secure
- Add them to `.gitignore` to prevent committing to version control
- Regularly review OAuth permissions in Google Account settings
- Consider using service accounts for production deployments

## Testing

To test the integration:

```bash
# Run the setup script again to verify
node scripts/setupGoogleCalendar.js

# Check server logs when changing candidate status
# Look for: "✅ Real Google Meet link created: https://meet.google.com/..."
```
