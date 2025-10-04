# 🔒 Secure Environment Setup for Production

## ⚠️ Important Security Notice

The `server/env.production` file was removed from the repository because it contained sensitive credentials. You need to create this file manually on your server with the actual production values.

## 📋 Steps to Set Up Production Environment

### 1. Create Production Environment File on Server

After deploying to your AWS server, create the production environment file:

```bash
# On your AWS server
cd /var/www/theciero/server
sudo nano .env.production
```

### 2. Copy Your Actual Values

Use the values you provided earlier:

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.kevwf.mongodb.net/bod_service_portal?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secure_jwt_secret_here

# Email Configuration - Admin Account
ADMIN_EMAIL_USER=admin@theciero.com
ADMIN_EMAIL_PASS=your_email_app_password_here

# Email Configuration - No-Reply Account
NOREPLY_EMAIL_USER=admin@theciero.com
NOREPLY_EMAIL_PASS=your_email_app_password_here

# Legacy Email Configuration
EMAIL_USER=admin@theciero.com
EMAIL_PASS=your_email_app_password_here

# Google Calendar Configuration
GOOGLE_CALENDAR_ADMIN_ENABLED=true
GOOGLE_CALENDAR_NOREPLY_ENABLED=true
GOOGLE_CALENDAR_DEFAULT_TIMEZONE=America/New_York

# Google Calendar OAuth Credentials - Admin Account
ADMIN_GOOGLE_CLIENT_ID=your_google_client_id_here
ADMIN_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
ADMIN_GOOGLE_PROJECT_ID=ciero-admin-platform
ADMIN_GOOGLE_REDIRECT_URI=https://theciero.com/api/auth/google/callback

# Google Calendar OAuth Tokens - Admin Account (Get these from OAuth flow)
ADMIN_GOOGLE_ACCESS_TOKEN=your_access_token_here
ADMIN_GOOGLE_REFRESH_TOKEN=your_refresh_token_here
ADMIN_GOOGLE_SCOPE=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events
ADMIN_GOOGLE_TOKEN_TYPE=Bearer

# Google Calendar OAuth Credentials - NoReply Account
NOREPLY_GOOGLE_CLIENT_ID=your_google_client_id_here
NOREPLY_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NOREPLY_GOOGLE_PROJECT_ID=ciero-admin-platform
NOREPLY_GOOGLE_REDIRECT_URI=https://theciero.com/api/auth/google/callback

# Google Calendar OAuth Tokens - NoReply Account (Get these from OAuth flow)
NOREPLY_GOOGLE_ACCESS_TOKEN=your_access_token_here
NOREPLY_GOOGLE_REFRESH_TOKEN=your_refresh_token_here
NOREPLY_GOOGLE_SCOPE=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events
NOREPLY_GOOGLE_TOKEN_TYPE=Bearer

# Account Information
GOOGLE_ADMIN_EMAIL=admin@theciero.com
GOOGLE_NOREPLY_EMAIL=admin@theciero.com

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URLs
FRONTEND_URL=https://theciero.com
RESET_PASSWORD_URL=https://theciero.com/reset-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### 3. Set Proper Permissions

```bash
sudo chown ubuntu:ubuntu .env.production
sudo chmod 600 .env.production
```

### 4. Restart Services

```bash
pm2 restart all
```

## 🔐 Security Best Practices

1. **Never commit secrets to Git**: Always use placeholder values in repository files
2. **Use strong JWT secrets**: Generate a random, long string for JWT_SECRET
3. **Restrict file permissions**: Set 600 permissions on .env files
4. **Regular rotation**: Rotate API keys and tokens regularly
5. **Monitor access**: Keep track of who has access to production credentials

## 📝 Deployment Process

The deployment script will automatically:
1. Copy `env.production.example` to `.env.production` if the actual file doesn't exist
2. Set proper permissions
3. Start services with the environment variables

You just need to manually create the `.env.production` file with actual values after deployment.
