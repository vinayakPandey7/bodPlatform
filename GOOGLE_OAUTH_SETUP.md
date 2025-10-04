# Google OAuth Setup for theciero.com

## Important: Update Google OAuth Redirect URIs

After deploying to production, you need to update your Google OAuth configuration to include the production redirect URI.

### Steps to Update Google OAuth Configuration:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project: `ciero-admin-platform`

2. **Navigate to OAuth Configuration**
   - Go to "APIs & Services" > "Credentials"
   - Find your OAuth 2.0 Client ID: `972782485350-jtkl9j9ovodaifnk2i7oamgdpibp426o.apps.googleusercontent.com`

3. **Update Authorized Redirect URIs**
   Add these URIs to your existing configuration:
   ```
   https://theciero.com/api/auth/google/callback
   https://www.theciero.com/api/auth/google/callback
   ```

4. **Update Authorized JavaScript Origins**
   Add these origins:
   ```
   https://theciero.com
   https://www.theciero.com
   ```

5. **Save Changes**
   - Click "Save" to apply the changes

### Current Configuration:
- **Client ID**: `972782485350-jtkl9j9ovodaifnk2i7oamgdpibp426o.apps.googleusercontent.com`
- **Project ID**: `ciero-admin-platform`
- **Admin Email**: `admin@theciero.com`

### Environment Variables Already Updated:
All environment variables in the production configuration files have been updated to use:
- `https://theciero.com/api/auth/google/callback` for redirect URIs
- `https://theciero.com` for frontend URLs
- `admin@theciero.com` for email configuration

### Testing OAuth:
After updating the Google OAuth configuration, test the calendar integration by:
1. Logging into your application
2. Navigating to calendar features
3. Verifying that Google Calendar integration works properly

### Troubleshooting:
If OAuth doesn't work:
1. Check that the redirect URIs match exactly
2. Verify that the domain is properly configured in DNS
3. Check the browser console for any OAuth errors
4. Verify that SSL certificate is working properly
