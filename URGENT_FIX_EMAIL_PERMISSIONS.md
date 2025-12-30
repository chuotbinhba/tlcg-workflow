# 🚨 URGENT: Fix Email Permissions - Step by Step

## ❌ Current Error:
```
Exception: Specified permissions are not sufficient to call MailApp.sendEmail. 
Required permissions: https://www.googleapis.com/auth/script.send_mail
```

---

## ✅ SOLUTION: Add OAuth Scopes to Manifest

### Step 1: Show Manifest File

1. **Open Google Apps Script:** https://script.google.com
2. **Click "Project Settings"** (⚙️ icon in the **left sidebar**)
3. **Check this checkbox:**
   ```
   ✅ Show "appsscript.json" manifest file in editor
   ```
4. **Click "Save"**

### Step 2: Open Manifest File

1. **In the file list (left sidebar), you should now see:** `appsscript.json`
2. **Click on `appsscript.json`**

### Step 3: Add OAuth Scopes

**The file should look like this:**
```json
{
  "timeZone": "Asia/Ho_Chi_Minh",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

**Replace it with this (ADD oauthScopes):**
```json
{
  "timeZone": "Asia/Ho_Chi_Minh",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
  ]
}
```

### Step 4: Save

1. **Click "Save"** (Ctrl+S or Cmd+S)
2. **Wait for save confirmation**

### Step 5: Run Function Again to Trigger Authorization

1. **Select `testEmailPermission` from function dropdown**
2. **Click "Run"** (▶️)
3. **NEW popup should appear:**
   - Click **"Review Permissions"**
   - Select your Google account
   - You'll see what permissions the script needs
   - Click **"Allow"**
4. **Function should run successfully**

---

## 🔄 Alternative: If Manifest Doesn't Work

### Method A: Run doPost/doGet to Trigger Auth

1. **In Google Apps Script, click function dropdown**
2. **Select `doGet`**
3. **Click "Run"** (▶️)
4. **When authorization popup appears:**
   - Click **"Review Permissions"**
   - Click **"Allow"**
5. **Then try `testEmailPermission` again**

### Method B: Create Simple Function to Force Auth

1. **In Google Apps Script editor, create this function:**
   ```javascript
   function requestEmailPermission() {
     try {
       // This will trigger the authorization flow
       MailApp.getRemainingDailyQuota();
       Logger.log('Permission granted!');
       return 'SUCCESS';
     } catch (e) {
       Logger.log('Error: ' + e.toString());
       return 'ERROR: ' + e.toString();
     }
   }
   ```

2. **Select `requestEmailPermission` from dropdown**
3. **Click "Run"** (▶️)
4. **Complete authorization**
5. **Then try `testEmailPermission`**

---

## ✅ Verify Permissions Are Set

### Check OAuth Scopes:

1. **Click "Project Settings"** (⚙️)
2. **Scroll down to "OAuth scopes"**
3. **Should show:**
   ```
   ✅ https://www.googleapis.com/auth/script.send_mail
   ✅ https://www.googleapis.com/auth/spreadsheets  
   ✅ https://www.googleapis.com/auth/drive
   ```

### Test Email Sending:

1. **Run `testEmailPermission` function**
2. **Check Logger:**
   - View → Logs
   - Should see "Email sent!" or success message
3. **Check your email inbox**

---

## 🎯 Complete Step-by-Step (Recommended)

### 1. Open Project Settings
```
Google Apps Script → ⚙️ Project Settings → ✅ Show appsscript.json
```

### 2. Edit appsscript.json
```json
{
  "timeZone": "Asia/Ho_Chi_Minh",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
  ]
}
```

### 3. Save & Run
```
Save → Select testEmailPermission → Run → Authorize
```

---

## 📸 Visual Guide

### Finding Project Settings:
```
┌─────────────────────────┐
│ Google Apps Script      │
│                         │
│ 📁 Files                │
│    Code.gs              │
│    appsscript.json      │ ← After enabling
│                         │
│ ⚙️ Project Settings     │ ← Click here
│ 🚀 Deploy               │
│ 📊 Executions           │
└─────────────────────────┘
```

### Project Settings Page:
```
Project Settings
├─ General
│   └─ ✅ Show "appsscript.json" manifest file in editor
│
└─ OAuth scopes (scroll down)
    └─ Should list:
        - script.send_mail
        - spreadsheets
        - drive
```

---

## ⚠️ Important Notes

### Why This Happens:
- Google Apps Script requires **explicit OAuth scopes** for certain APIs
- `MailApp.sendEmail()` needs `script.send_mail` scope
- Adding scopes to manifest **declares** what the script needs
- **First run** triggers the **authorization flow**

### After Authorization:
- ✅ Script can send emails automatically
- ✅ No need to re-authorize unless you revoke access
- ✅ Works for all users who have authorized the script

### If Still Doesn't Work:

1. **Check Google Account:**
   - Make sure you're logged into the correct Google account
   - Personal Gmail or Workspace account should both work

2. **Check Workspace Admin (if using Workspace):**
   - Admin may need to approve OAuth scopes
   - Contact your Google Workspace admin

3. **Try Different Browser:**
   - Sometimes browser extensions interfere
   - Try Incognito mode or different browser

---

## 🎯 Expected Result:

After completing authorization:
```
✅ Logger shows: "Email sent!"
✅ Email arrives in your inbox
✅ No permission errors
✅ Form submission works
```

---

**Status:** Need to add OAuth scopes to manifest and complete authorization

**Next Step:** Follow Step 1-5 above to add oauthScopes to appsscript.json

