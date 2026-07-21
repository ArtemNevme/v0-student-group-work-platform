# Deployment Guide

## Environment Variables

Your application needs the following environment variables to work correctly on production:

### Required Variables

Add these to your Vercel project (Settings → Environment Variables):

\`\`\`bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://studysinc.click

# Blob Storage (already configured)
BLOB_READ_WRITE_TOKEN=your_blob_token

# Application URL (ADD THIS!)
NEXT_PUBLIC_APP_URL=https://studysinc.click

# Google Classroom (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
\`\`\`

### Setting NEXT_PUBLIC_APP_URL

**This is required for the application to work correctly on production!**

1. Go to https://vercel.com/dashboard
2. Select your project (studysinc)
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://studysinc.click`
   - **Environments**: Production, Preview, Development (check all)
5. Click **Save**
6. **Redeploy** your application for changes to take effect

## After Adding Variables

After adding or updating environment variables:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"Redeploy"** button (three dots menu → Redeploy)
4. Wait for deployment to complete
5. Test your application

## Common Issues

### "Application error: a server-side exception"

This usually means:
- Environment variables are missing or incorrect
- Old cached version is being served
- **Solution**: Add missing variables and redeploy

### "Failed to fetch" errors

This can happen when:
- Supabase environment variables are incorrect
- Network issues between Vercel and Supabase
- **Solution**: Verify all Supabase URLs and keys are correct

### Changes not reflecting

If your code changes aren't showing:
1. Clear browser cache (Ctrl+Shift+R)
2. Ensure deployment succeeded in Vercel
3. Check you're viewing the correct URL (production vs preview)

## Vercel CLI (Alternative Method)

You can also set environment variables using Vercel CLI:

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set variable
vercel env add NEXT_PUBLIC_APP_URL production
# When prompted, enter: https://studysinc.click

# Pull latest env vars
vercel env pull
\`\`\`

## Migration from middleware.ts to proxy.ts

In Next.js 16, the `middleware.ts` file convention has been replaced with `proxy.ts`. This migration has been completed automatically.

No action needed - the code now uses `proxy.ts` instead of `middleware.ts`.
