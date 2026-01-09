# Google Drive API Setup Guide
## Enable Unlimited File Uploads

**Estimated Time**: 30-45 minutes

---

## 📋 PREREQUISITES

- Google Account with admin access
- Access to Google Cloud Console
- Domain ownership (for production use)

---

## 🚀 STEP-BY-STEP SETUP

### STEP 1: Create Google Cloud Project (5 min)

1. Go to: https://console.cloud.google.com/

2. Click "Select a project" → "NEW PROJECT"

3. Enter project details:
   - **Project name**: `TLCG Workflow`
   - **Organization**: Select your organization (if applicable)
   - Click **CREATE**

4. Wait for project creation (30 seconds)

5. Select the new project from the dropdown

---

### STEP 2: Enable Google Drive API (2 min)

1. In Google Cloud Console, go to:
   **APIs & Services** → **Library**
   
   Or visit: https://console.cloud.google.com/apis/library

2. Search for: `Google Drive API`

3. Click on **Google Drive API**

4. Click **ENABLE**

5. Wait for activation (30 seconds)

---

### STEP 3: Create OAuth 2.0 Credentials (10 min)

1. Go to: **APIs & Services** → **Credentials**
   
   Or visit: https://console.cloud.google.com/apis/credentials

2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**

3. If prompted to configure OAuth consent screen:
   - Click **CONFIGURE CONSENT SCREEN**
   - Choose **External** (for testing) or **Internal** (for organization)
   - Click **CREATE**

4. Fill in OAuth consent screen:
   - **App name**: `TLCG Workflow`
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **SAVE AND CONTINUE**

5. Scopes (click **ADD OR REMOVE SCOPES**):
   - Search for: `drive.file`
   - Select: `https://www.googleapis.com/auth/drive.file`
   - Click **UPDATE**
   - Click **SAVE AND CONTINUE**

6. Test users (for External apps):
   - Click **+ ADD USERS**
   - Add email addresses of users who will test
   - Click **SAVE AND CONTINUE**

7. Click **BACK TO DASHBOARD**

8. Now create OAuth client ID:
   - Go back to **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - **Application type**: Web application
   - **Name**: `TLCG Workflow Web Client`

9. **Authorized JavaScript origins**:
   - Click **+ ADD URI**
   - Add: `https://workflow.egg-ventures.com`
   - Add: `http://localhost:3000` (for testing)

10. **Authorized redirect URIs**:
    - Click **+ ADD URI**
    - Add: `https://workflow.egg-ventures.com`
    - Add: `http://localhost:3000` (for testing)

11. Click **CREATE**

12. **IMPORTANT**: Copy and save:
    - **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
    - **Client Secret**: (you won't need this for frontend)

---

### STEP 4: Create API Key (5 min)

1. Still in **Credentials**, click **+ CREATE CREDENTIALS** → **API key**

2. Copy the API key: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

3. Click **RESTRICT KEY** (recommended)

4. **API restrictions**:
   - Select: **Restrict key**
   - Check: **Google Drive API**
   - Click **SAVE**

5. **Application restrictions** (optional but recommended):
   - Select: **HTTP referrers (web sites)**
   - Add: `workflow.egg-ventures.com/*`
   - Add: `localhost:3000/*` (for testing)
   - Click **SAVE**

---

### STEP 5: Update Frontend Code (10 min)

1. Open: `phieu_thu_chi.html`

2. Find the `DRIVE_CONFIG` section (around line 2258):

```javascript
const DRIVE_CONFIG = {
    CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
    API_KEY: 'YOUR_API_KEY_HERE',
    DRIVE_FOLDER_ID: '1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG',
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    SCOPES: 'https://www.googleapis.com/auth/drive.file'
};
```

3. Replace with your actual credentials:

```javascript
const DRIVE_CONFIG = {
    CLIENT_ID: '123456789-abcdefg.apps.googleusercontent.com', // ← Your Client ID
    API_KEY: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // ← Your API Key
    DRIVE_FOLDER_ID: '1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG',
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    SCOPES: 'https://www.googleapis.com/auth/drive.file'
};
```

4. Save the file

5. Commit and push to GitHub:
```bash
git add phieu_thu_chi.html
git commit -m "🔧 Configure Google Drive API credentials"
git push origin main
```

6. Deploy to Vercel:
```bash
npx vercel --prod
```

---

### STEP 6: Test the Integration (10 min)

1. Open: https://workflow.egg-ventures.com/phieu_thu_chi.html

2. Open browser console (F12)

3. Look for initialization message:
   ```
   ✅ Google Drive API initialized
   ✅ Drive API ready - unlimited file uploads enabled!
   ```

4. Create a test voucher

5. Try uploading a large file (> 500KB)

6. When you click "Gửi phê duyệt":
   - You'll be prompted to sign in to Google (first time only)
   - Click **Sign in with Google**
   - Select your account
   - Click **Allow** to grant permissions

7. Check console for upload progress:
   ```
   📤 Uploading test.pdf (1.8 MB) to Drive...
   ✅ Created new folder: TL-202601-0001
   ✅ File uploaded: test.pdf
   ✅ Sharing permissions set for: test.pdf
   ```

8. Verify in Google Drive:
   - Go to: https://drive.google.com/drive/folders/1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG
   - You should see a new folder with your voucher number
   - File should be inside with "Anyone with link" sharing

---

## 🔐 SECURITY BEST PRACTICES

### 1. API Key Restrictions
- ✅ Restrict to Google Drive API only
- ✅ Restrict to your domain
- ❌ Never commit API keys to public repos

### 2. OAuth Consent Screen
- Use **Internal** for organization-only access
- Use **External** only if needed for external users
- Regularly review authorized users

### 3. Scopes
- Use minimal scope: `drive.file` (only files created by app)
- ❌ Avoid `drive` scope (full Drive access)

### 4. Domain Verification
For production:
- Verify domain ownership in Google Cloud Console
- Add domain to authorized origins
- Remove localhost from authorized origins

---

## 🐛 TROUBLESHOOTING

### Error: "API key not valid"
**Solution**:
- Check API key is correct in `DRIVE_CONFIG`
- Verify API key restrictions allow your domain
- Ensure Google Drive API is enabled

### Error: "Invalid client ID"
**Solution**:
- Check Client ID is correct
- Verify authorized JavaScript origins include your domain
- Wait 5 minutes for changes to propagate

### Error: "Access denied"
**Solution**:
- Check OAuth consent screen is configured
- Verify user is added to test users (for External apps)
- Ensure `drive.file` scope is added

### Error: "Failed to create folder"
**Solution**:
- Check `DRIVE_FOLDER_ID` is correct
- Verify folder exists and is accessible
- Check Drive API permissions

### User not prompted to sign in
**Solution**:
- Clear browser cache and cookies
- Try incognito/private mode
- Check console for errors

### Files not appearing in Drive
**Solution**:
- Check folder ID is correct
- Verify sharing permissions were set
- Check Google Cloud Console logs

---

## 📊 TESTING CHECKLIST

- [ ] Google Cloud Project created
- [ ] Google Drive API enabled
- [ ] OAuth 2.0 credentials created
- [ ] API key created and restricted
- [ ] Credentials added to frontend code
- [ ] Code deployed to production
- [ ] Console shows "Drive API ready" message
- [ ] Can upload files > 500KB
- [ ] Google sign-in prompt appears
- [ ] Files appear in Google Drive folder
- [ ] Files have "Anyone with link" sharing
- [ ] File URLs work in emails
- [ ] Backend receives file URLs correctly

---

## 💰 COST

**Google Drive API**: FREE
- 1 billion queries per day (free tier)
- 10,000 requests per 100 seconds per user
- More than enough for this use case

**Google Drive Storage**:
- 15 GB free per Google account
- Shared with Gmail and Photos
- Can upgrade to Google One if needed

---

## 📝 CONFIGURATION SUMMARY

After setup, you should have:

```javascript
// In phieu_thu_chi.html
const DRIVE_CONFIG = {
    CLIENT_ID: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com',
    API_KEY: 'YOUR_ACTUAL_API_KEY',
    DRIVE_FOLDER_ID: '1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG',
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    SCOPES: 'https://www.googleapis.com/auth/drive.file'
};
```

**Benefits After Setup**:
- ✅ No file size limits (up to 5TB per file!)
- ✅ Faster uploads (direct to Drive)
- ✅ More reliable (no truncation)
- ✅ Better user experience
- ✅ Free (no additional costs)

---

## 🎯 NEXT STEPS

After completing setup:

1. Test with various file sizes
2. Test with multiple file types
3. Verify emails contain correct Drive links
4. Train users on Google sign-in process
5. Monitor Google Cloud Console for usage

---

## 📞 SUPPORT

If you encounter issues:

1. Check Google Cloud Console logs:
   - https://console.cloud.google.com/logs

2. Check browser console for errors

3. Verify all credentials are correct

4. Ensure all APIs are enabled

5. Wait 5-10 minutes for changes to propagate

---

**Setup Complete!** 🎉

Your system now supports unlimited file uploads via Google Drive API.

