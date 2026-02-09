# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your e-commerce app.

## Prerequisites

- A Google account
- Your app running locally on `http://localhost:3000`

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name (e.g., "E-commerce App")
5. Click "Create"

## Step 2: Enable Google+ API (or Google Identity Services)

1. In your Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google Identity"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select "External" user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: ShopHub E-commerce (or your app name)
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "Save and Continue"
6. On the Scopes page, click "Add or Remove Scopes"
7. Add these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
8. Click "Save and Continue"
9. Add test users (your email) if in testing mode
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click "+ CREATE CREDENTIALS" at the top
3. Select "OAuth client ID"
4. Choose "Web application" as the application type
5. Give it a name (e.g., "E-commerce Web Client")
6. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:3000
   ```
7. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
8. Click "Create"
9. **IMPORTANT**: Copy your Client ID and Client Secret

## Step 5: Add Credentials to Your .env File

1. Open your `.env` file
2. Replace the placeholder values:
   ```env
   GOOGLE_CLIENT_ID=your_actual_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   ```
3. Make sure `NEXTAUTH_URL` is set to:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Ensure `NEXTAUTH_SECRET` has a secure value. Generate one with:
   ```bash
   openssl rand -base64 32
   ```

## Step 6: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Step 7: Test Google Sign-In

1. Go to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Choose your Google account
4. Grant permissions
5. You should be redirected to `/products` and logged in!

## Common Issues

### "Error 400: redirect_uri_mismatch"
- Make sure your redirect URI in Google Cloud Console is exactly:
  `http://localhost:3000/api/auth/callback/google`
- No trailing slash
- Use `http` (not `https`) for localhost

### "Error: This app isn't verified"
- This is normal during development
- Click "Advanced" → "Go to [App Name] (unsafe)"
- This warning won't show in production after verification

### Google Sign-In Button Not Working
- Check browser console for errors
- Verify `GOOGLE_CLIENT_ID` is set correctly in `.env`
- Make sure you restarted the dev server after adding credentials

### Always Seeing the Same Google Account

If you're always being signed in with the same Google account:

**Solution 1: Clear Browser Cache**
1. Open browser DevTools (F12)
2. Go to Application > Storage
3. Click "Clear site data"
4. Refresh the page

**Solution 2: Use Incognito/Private Mode**
- Open an incognito/private window
- This bypasses Google's account cache
- Each new window lets you choose a different account

**Solution 3: Force Account Selection**
The app is already configured to show account selector (`prompt: "select_account"`), but if it's not working:
1. Go to https://myaccount.google.com/permissions
2. Remove ShopHub/your app from connected apps
3. Try signing in again - it will ask for account selection

**Solution 4: Sign Out from Google**
1. Sign out from all Google accounts in your browser
2. Try signing in with Google OAuth again
3. It will ask you to choose an account

**Solution 5: Add Test Users (If App is in Testing Mode)**
If your Google Cloud Console app is in "Testing" mode:
1. Go to OAuth consent screen
2. Scroll to "Test users"
3. Add the email addresses you want to test with
4. Only these users can sign in during testing

## Production Deployment

When deploying to production (e.g., Vercel):

1. Add your production domain to "Authorized JavaScript origins":
   ```
   https://yourdomain.com
   ```

2. Add production callback to "Authorized redirect URIs":
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

3. Update your production environment variables:
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   NEXTAUTH_SECRET=your_production_secret
   ```

4. Verify your app in Google Cloud Console (optional but recommended)

## Security Best Practices

1. ✅ Never commit `.env` file to git
2. ✅ Use different OAuth credentials for development and production
3. ✅ Keep `NEXTAUTH_SECRET` secure and unique
4. ✅ Regularly rotate secrets
5. ✅ Monitor OAuth usage in Google Cloud Console

## Need Help?

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)

---

**Happy authenticating! 🚀**
