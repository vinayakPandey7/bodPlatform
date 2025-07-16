# Cloudinary Setup Guide

## 1. Create Free Cloudinary Account

1. Go to https://cloudinary.com/
2. Sign up for free account
3. Get your credentials from Dashboard

## 2. Add Environment Variables

Add these to your **server** `.env` file:
`/Users/vinayakpandey/Documents/system/bodPlatform/server/.env`

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important:** Add these to the **SERVER** `.env` file, NOT the client `.env`!

## 3. Update Profile Page

You can now use either:

- **Local Storage**: `/api/upload/resume` (current)
- **Cloudinary Storage**: `/api/cloudinary/resume/cloudinary` (new)

## 4. Benefits of Cloudinary

- ✅ Free 25GB storage
- ✅ Global CDN (faster loading)
- ✅ Automatic optimization
- ✅ Reliable hosting
- ✅ No server storage needed

## 5. Migration

To migrate from local to Cloudinary:

1. Update upload hook to use `useUploadResumeToCloudinary`
2. Update modal URL to use `profile.resume.cloudinaryUrl`
3. Existing local files will continue to work
