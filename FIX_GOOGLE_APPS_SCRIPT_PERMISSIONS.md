# 🔧 Fix Google Apps Script Deployment Permissions

## ❌ Problem
When accessing the Google Apps Script Web App URL:
- ✅ Works with: `linh.le@tl-c.com.vn`
- ❌ Shows error with other profiles: "Sorry, unable to open the file at this time. Please check the address and try again."

## 🔍 Root Cause
The Google Apps Script deployment is set to **"Anyone with Google account"** instead of **"Anyone"**. This restricts access to only users who have permission to view/edit the script.

## ✅ Solution: Update Deployment Permissions

### Step 1: Open Google Apps Script
1. Go to https://script.google.com
2. Open the project **TLCG_INTRANET_BACKEND_COMPLETE.gs**
3. Make sure you're logged in as `linh.le@tl-c.com.vn` (the account that has access)

### Step 2: Check Current Deployment
1. Click **Deploy** → **Manage deployments**
2. You'll see a list of deployments
3. Check the current deployment settings:
   - **Type:** Should be "Web app"
   - **Who has access:** This is the important setting!

### Step 3: Edit Deployment Settings
1. Click the **⚙️ (Edit/Settings)** icon next to the active deployment
2. In the deployment settings dialog:
   - **Description:** (optional, can leave as is)
   - **Execute as:** Should be "Me (linh.le@tl-c.com.vn)" or your email
   - **Who has access:** ⚠️ **CRITICAL - Change this to "Anyone"** ⚠️

3. **Change "Who has access" to "Anyone"**
   - This allows anyone (including users from different Google accounts) to access the web app
   - This is required for the proxy to work properly
   - This is safe because the script executes as "Me" (your account), not as the user

4. Click **Deploy**

### Step 4: Copy New URL (if changed)
1. After redeploying, a new URL might be generated
2. Copy the new Web App URL
3. **IMPORTANT:** If the URL changed, you need to:
   - Update it in all relevant files
   - Update Vercel environment variable if you're using it for the proxy

### Step 5: Test Access
1. Open an **Incognito/Private** browser window (or use a different browser)
2. Log in with a different Google account
3. Visit the Web App URL
4. Should see: "Google Apps Script is running!" ✅
5. Should NOT see: "Sorry, unable to open the file..." ❌

## 📋 Step-by-Step Screenshot Guide

### In Google Apps Script:

1. **Deploy Menu:**
   ```
   [Deploy] → [Manage deployments]
   ```

2. **Edit Deployment:**
   ```
   Click ⚙️ icon next to deployment
   ```

3. **Settings Dialog:**
   ```
   Execute as: Me (your-email@domain.com) ✅
   Who has access: [Dropdown]
                      ├─ Only myself ❌
                      ├─ Anyone with Google account ❌ (Current - Wrong!)
                      └─ Anyone ✅ (Select this!)
   ```

4. **Click Deploy:**
   ```
   System may ask: "Do you want to update the deployment?"
   → Click "Update"
   ```

## 🚨 Important Notes

### Security Considerations
- Setting to "Anyone" does NOT give people access to your script code
- They can only **execute** the web app URL
- The script still runs **as you** (Execute as: Me)
- Users cannot see or modify your code
- This is the correct setting for public web apps

### Why This is Required
- The Vercel proxy needs to call the Google Apps Script URL
- The proxy runs on Vercel's servers (not logged in as any user)
- Without "Anyone" access, the proxy will get permission errors
- Frontend users from different organizations need to access it

## ✅ Verification Checklist

After updating permissions:

- [ ] Deployment shows "Who has access: Anyone"
- [ ] Can access URL with `linh.le@tl-c.com.vn` account ✅
- [ ] Can access URL with another Google account ✅
- [ ] Can access URL in Incognito mode ✅
- [ ] No "Sorry, unable to open the file" errors ✅
- [ ] Proxy can successfully call the URL ✅

## 🔄 If URL Changed After Redeployment

If the Web App URL changed after updating permissions:

1. **Copy the new URL** from the deployment settings
2. **Update code files** if you're using it directly (currently all use proxy, so not needed)
3. **Update Vercel environment variable** if proxy uses it:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Update `GOOGLE_APPS_SCRIPT_URL` if it points to this backend
   - Redeploy Vercel project

## 📝 Current URL

**TLCG_INTRANET_BACKEND:**
```
https://script.google.com/macros/s/AKfycbw05Cr7-Mm2TtgQgxVaVoobvdSUHtX2Y8vjTi0Fd-_UmL0ojojyLDOwXwyaMWDwGW06Iw/exec
```

**After fixing permissions, test this URL with different accounts to confirm it works!**

## 🆘 Still Not Working?

If you still see permission errors after setting to "Anyone":

1. **Check if you have multiple deployments:**
   - Deploy → Manage deployments
   - Make sure you're editing the **ACTIVE** deployment
   - Or create a new deployment with "Anyone" access

2. **Check script sharing:**
   - File → Share
   - The script file itself should have appropriate sharing (but this is separate from deployment)

3. **Try creating a new deployment:**
   - Deploy → New deployment
   - Select type: "Web app"
   - Set "Who has access" to "Anyone" immediately
   - Copy the new URL
   - Update in code/environment variables

