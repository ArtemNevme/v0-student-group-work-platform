# Google Classroom Integration Setup

This guide will help you set up the Google Classroom integration for StudySync.

## Prerequisites

1. A Google Cloud Project
2. Access to Google Cloud Console
3. Your StudySync application URL

## Step 1: Enable Google Provider in Supabase

**THIS MUST BE DONE FIRST** - Before any other setup steps.

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** > **Providers**
4. Find **Google** in the list of providers
5. Toggle it to **Enabled**
6. You'll need to add Google OAuth credentials here later (Step 4)

## Step 2: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 3: Enable Google Classroom API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Classroom API"
3. Click on it and press **Enable**

## Step 4: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have Google Workspace)
3. Fill in the required information:
   - **App name**: StudySync
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **Save and Continue**
5. On the **Scopes** page, add these scopes:
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.me.readonly`
6. Click **Save and Continue**
7. Add test users (during development) or publish the app

## Step 5: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: StudySync Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for development)
     - Your production URL (e.g., `https://your-app.vercel.app`)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/google-classroom/callback` (for development)
     - `https://your-app.vercel.app/api/google-classroom/callback` (for production)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## Step 6: Add Environment Variables

Add these environment variables to your project:

### For Vercel (Production)

Go to your Vercel project settings > Environment Variables and add:

\`\`\`
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
\`\`\`

### For Local Development

Create or update `.env.local`:

\`\`\`
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

## Step 7: Run Database Migration

Execute the database migration script to create the necessary tables:

\`\`\`bash
# The script is located at: scripts/018_create_google_classroom_tables.sql
# Run this script in your Supabase SQL editor or using the v0 interface
\`\`\`

## Step 8: Test the Integration

1. Start your application
2. Log in to StudySync
3. Navigate to **Google Classroom** in the dashboard
4. Click **Connect Google Classroom**
5. Authorize the app with your school Google account
6. Click **Sync Now** to import your courses and assignments

## Features

### What Gets Imported

- **Courses**: All active courses you're enrolled in
- **Assignments**: All coursework from your courses including:
  - Title and description
  - Due dates
  - Point values
  - Links to view in Google Classroom

### Read-Only Access

The integration only has **read-only** access. It cannot:
- Create, modify, or delete anything in Google Classroom
- Submit assignments
- Change grades
- Access private student data

### Syncing

- Manual sync: Click "Sync Now" button anytime
- The system stores tokens securely and refreshes them automatically
- Last sync time is displayed on the integration page

## Troubleshooting

### "Access Denied" Error

- Make sure you granted all requested permissions
- Check that your Google account has access to Google Classroom
- Verify the OAuth consent screen is configured correctly

### "Invalid Redirect URI" Error

- Ensure the redirect URI in Google Cloud Console exactly matches your callback URL
- Check that `NEXT_PUBLIC_APP_URL` is set correctly

### No Assignments Showing

- Click "Sync Now" to fetch data
- Verify you have active courses in Google Classroom
- Check that assignments exist in your courses

### Token Expired Errors

- The system should automatically refresh tokens
- If issues persist, disconnect and reconnect the integration

## Security Notes

- Access tokens and refresh tokens are stored encrypted in the database
- Only the authenticated user can access their own imported data
- Row Level Security (RLS) policies protect all data
- The integration follows Google's security best practices

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure the database migration ran successfully
4. Review Google Cloud Console for API quota or permission issues
