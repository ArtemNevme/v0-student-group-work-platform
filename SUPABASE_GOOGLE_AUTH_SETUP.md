// ... existing code ...

## Troubleshooting

// <CHANGE> Adding specific solution for Google OAuth policy error

### Error: "This app doesn't comply with Google's OAuth 2.0 policy"

This error means your OAuth consent screen configuration needs additional setup:

**Quick Fix (For Development/Testing):**

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **OAuth consent screen**

2. **Add yourself as a Test User**:
   - Scroll down to **Test users** section
   - Click **+ ADD USERS**
   - Enter your email address (and any other testers)
   - Click **Save**

3. **Verify App Information is Complete**:
   - Make sure all required fields are filled:
     - App name: `StudySync`
     - User support email: Your email
     - Developer contact email: Your email
   - Add an **App domain** (optional but recommended):
     - Homepage: `https://studysync.click`
     - Privacy Policy: `https://studysync.click/privacy` (you can create a simple page)
     - Terms of Service: `https://studysync.click/terms` (you can create a simple page)

4. **Publishing Status**:
   - Your app is in "**Testing**" mode by default
   - In Testing mode, only users you add to the test users list can sign in
   - For production use with unlimited users, you'll need to **Publish** the app (requires verification for sensitive scopes)

**For Production (All Users):**

If you want anyone to sign in (not just test users):

1. Complete all OAuth consent screen fields
2. Add Privacy Policy and Terms of Service URLs
3. Click **PUBLISH APP** button
4. Note: Apps using sensitive scopes like Google Classroom require Google verification:
   - You'll need to submit for verification
   - Google reviews can take 1-2 weeks
   - You'll need to provide justification for why you need Classroom access

**Temporary Workaround:**

While in Testing mode, add all users who need access as Test Users. This works for:
- Development
- Small teams
- Private beta testing

The limit is 100 test users, which should be sufficient for most use cases before going through verification.

### Error: "Unsupported provider: provider is not enabled"

// ... existing code ...
\`\`\`

```tsx file="" isHidden
