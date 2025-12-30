# 🔴 URGENT: Fix Email Permission Error

## ❌ Error Message:
```
Failed to send email to approvers: Required permissions
https://www.googleapis.com/auth/script.send_mail
```

## 🔍 Root Cause

The Google Apps Script project is missing the required OAuth scope for sending emails. Even though the scope is declared in `appsscript.json`, the script needs to be **re-authorized** to grant these permissions.

---

## ✅ Solution: Re-Authorize Google Apps Script

### Step 1: Open Google Apps Script Project

1. Go to: https://script.google.com
2. Open your project: **"Phiếu Thu Chi - Email & Sheets Sync"** (or your project name)

### Step 2: Check Manifest File (appsscript.json)

1. Click on **"Project Settings"** (⚙️ icon) in the left sidebar
2. Scroll down to **"Manifest file (appsscript.json)"**
3. Verify it contains:
```json
{
  "timeZone": "Asia/Ho_Chi_Minh",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.send_mail",  // ✅ Required for MailApp
    "https://www.googleapis.com/auth/gmail.send",        // ✅ Required for GmailApp
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.external_request"
  ],
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

**If the manifest is missing `script.send_mail` scope:**
- Click the edit icon (✏️) next to "Manifest file"
- Add the missing scope
- Save

### Step 3: Re-Authorize the Script

**Method 1: Run a Test Function**

1. In the Apps Script editor, create a new function at the bottom:
```javascript
function testEmailPermission() {
  try {
    MailApp.sendEmail({
      to: 'your-email@gmail.com',
      subject: 'Test Email',
      body: 'This is a test email to verify permissions.'
    });
    Logger.log('✅ Email sent successfully!');
    return 'SUCCESS: Email permission verified!';
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    return 'ERROR: ' + error.message;
  }
}
```

2. **Select** `testEmailPermission` from the function dropdown (top of editor)
3. Click **"Run"** (▶️ button)
4. Google will prompt you to **"Review Permissions"**
5. Click **"Review Permissions"**
6. Select your Google account
7. Click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
8. Click **"Allow"** to grant permissions
9. The script will run and send a test email

**Method 2: Trigger Authorization via Web App**

1. Deploy the Web App again:
   - Click **"Deploy"** → **"Manage deployments"**
   - Click **"Edit"** (pencil icon) next to your deployment
   - Click **"Deploy"** (no changes needed)
2. This will trigger re-authorization
3. Follow the prompts to authorize

**Method 3: Re-Deploy Web App**

1. Click **"Deploy"** → **"New deployment"**
2. Select type: **"Web app"**
3. Settings:
   - **Execute as:** Me (your-email@gmail.com)
   - **Who has access:** Anyone
4. Click **"Deploy"**
5. When prompted, click **"Authorize access"**
6. Review and approve all permissions

---

## 🔍 Verify Permissions Are Granted

### Check 1: Test Function

After authorization, run the test function again:
```javascript
function testEmailPermission() {
  MailApp.sendEmail({
    to: 'your-email@gmail.com',
    subject: 'Test Email',
    body: 'This is a test email to verify permissions.'
  });
  Logger.log('✅ Email sent!');
}
```

- ✅ If successful: Check your email inbox
- ❌ If still fails: See "Troubleshooting" below

### Check 2: Check Executions

1. Click **"Executions"** in the left sidebar
2. Find your latest execution
3. Check logs:
   - ✅ Should see: "✅ Email sent!"
   - ❌ If error: Copy error message

---

## 🔧 Troubleshooting

### Issue 1: Permission Still Denied After Re-Authorization

**Solution:**
1. Go to: https://myaccount.google.com/permissions
2. Find your Apps Script project
3. Click **"Remove access"**
4. Re-run the authorization steps above

### Issue 2: Scope Not in Manifest

**Solution:**
1. Edit `appsscript.json` manifest
2. Add missing scope:
```json
"oauthScopes": [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/script.send_mail",  // ← ADD THIS
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/script.external_request"
]
```
3. Save the manifest
4. Re-authorize

### Issue 3: Different Account Issues

**Solution:**
- Make sure you're using the same Google account for:
  - Apps Script editor
  - Web App deployment
  - Authorization
- Check which account is shown in the top-right of script.google.com

---

## ✅ Expected Behavior After Fix

Once permissions are granted:

1. **Form submission** should work without errors
2. **Email to approvers** should be sent successfully
3. **Email to requester** should be sent successfully
4. **Voucher history** should be saved to sheet
5. **No permission errors** in logs

---

## 📝 Quick Checklist

- [ ] Manifest file contains `script.send_mail` scope
- [ ] Manifest file saved
- [ ] Test function created
- [ ] Test function executed
- [ ] Permissions reviewed and approved
- [ ] Test email received successfully
- [ ] Form submission tested
- [ ] No more permission errors

---

## 🎯 Quick Fix Steps (TL;DR)

1. Open https://script.google.com
2. Open your project
3. Add this test function:
```javascript
function testEmailPermission() {
  MailApp.sendEmail({
    to: 'your-email@gmail.com',
    subject: 'Test',
    body: 'Test'
  });
}
```
4. Run the function → Authorize → Allow
5. Test form submission again

---

**Last Updated:** 2025-12-26  
**Status:** Critical - Blocks email sending functionality

