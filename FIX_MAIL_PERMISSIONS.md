# 🔧 Fix: MailApp Permission Error

## ❌ Error:
```
Failed to send email to approvers: Specified permissions are not sufficient to call MailApp.sendEmail. 
Required permissions: https://www.googleapis.com/auth/script.send_mail
```

## 🔍 Problem:
Google Apps Script needs to be **authorized** with email sending permissions. The script needs OAuth scope: `https://www.googleapis.com/auth/script.send_mail`

---

## ✅ Solution: Re-authorize the Script

### Method 1: Re-run the Script Manually (Recommended)

1. **Open Google Apps Script:** https://script.google.com
2. **Open your project** (the one with VOUCHER_WORKFLOW_BACKEND.gs)
3. **Click the function dropdown** (top-left, next to "Deploy")
4. **Select a simple test function** OR create a new one:
   ```javascript
   function testPermissions() {
     MailApp.sendEmail({
       to: 'test@example.com',
       subject: 'Test',
       body: 'Test email'
     });
   }
   ```
5. **Click "Run"** (▶️ button)
6. **You'll see authorization prompt:**
   - Click "Review Permissions"
   - Select your Google account
   - Click "Advanced"
   - Click "Go to [Your Project Name] (unsafe)" (this is safe, it's your own script)
   - Click "Allow"
7. **You should see:** "Authorization successful" or similar

### Method 2: Trigger Authorization via Deployment

1. **Open Google Apps Script:** https://script.google.com
2. **Click "Deploy"** → **"Manage deployments"**
3. **Click ✏️ (Edit)** on your active deployment
4. **Click "Deploy"** again
5. **When prompted, authorize:**
   - Review permissions
   - Allow access to send emails
6. **Save deployment**

### Method 3: Add OAuth Scopes to Manifest (Advanced)

1. **In Google Apps Script, click "Project Settings"** (⚙️ icon in left sidebar)
2. **Check "Show 'appsscript.json' manifest file in editor"**
3. **Click "appsscript.json"** in file list
4. **Add OAuth scopes:**
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
5. **Save** (Ctrl+S)
6. **Deploy again** (will trigger re-authorization)

---

## 🔍 Verify Permissions Are Set

### Check Current Permissions:

1. **Open Google Apps Script**
2. **Click "Project Settings"** (⚙️ icon)
3. **Look at "OAuth scopes" section**
4. **Should see:**
   ```
   ✅ https://www.googleapis.com/auth/script.send_mail
   ✅ https://www.googleapis.com/auth/spreadsheets
   ✅ https://www.googleapis.com/auth/drive
   ```

### Test Email Sending:

1. **In Google Apps Script editor, create a test function:**
   ```javascript
   function testEmailPermission() {
     try {
       MailApp.sendEmail({
         to: 'your-email@gmail.com', // Replace with your email
         subject: 'Test Email from Apps Script',
         body: 'If you receive this, permissions are working!'
       });
       Logger.log('✅ Email sent successfully!');
       return 'SUCCESS';
     } catch (e) {
       Logger.log('❌ Error: ' + e.toString());
       return 'ERROR: ' + e.toString();
     }
   }
   ```

2. **Run the function** (▶️)
3. **Check your email** (and check Logger in Apps Script)

---

## 🎯 Step-by-Step Fix (Quick):

### Step 1: Open Script
1. Go to: https://script.google.com
2. Open your voucher workflow project

### Step 2: Trigger Authorization
1. **Click function dropdown** → Select any function
2. **Click "Run"** (▶️)
3. **Click "Authorize"** when prompted
4. **Review permissions** → **Allow**

### Step 3: Deploy Again
1. **Click "Deploy"** → **"New deployment"**
2. **Settings:**
   - Description: `TLCG Voucher v1.7 (Re-authorized)`
   - Execute as: `Me`
   - Who has access: `Anyone`
3. **Click "Deploy"**
4. **Authorize again** if prompted

### Step 4: Test
1. Go to your form
2. Fill out and submit
3. Check console - should not see permission error

---

## 📝 Important Notes:

### ⚠️ Execute as "Me":
- The script must execute **as you** (the deployer)
- This allows it to send emails using **your Google account**

### ⚠️ OAuth Scopes Needed:
- `https://www.googleapis.com/auth/script.send_mail` - Send emails
- `https://www.googleapis.com/auth/spreadsheets` - Read/write Sheets
- `https://www.googleapis.com/auth/drive` - Upload files to Drive

### ⚠️ First-Time Authorization:
- First time running the script, Google will ask for permissions
- You must click "Allow" to grant email sending permissions
- After authorization, the script can send emails automatically

---

## 🐛 If Authorization Still Fails:

### Check 1: Google Account Settings
1. Go to: https://myaccount.google.com/security
2. Check "Less secure app access" (if using personal Gmail)
3. Or enable 2-Step Verification and use App Password

### Check 2: Workspace Admin Settings (if using Workspace)
1. Admin may need to approve OAuth scopes
2. Contact your Google Workspace admin

### Check 3: Try GmailApp Instead
If `MailApp` doesn't work, we can try `GmailApp`:

```javascript
// Instead of:
MailApp.sendEmail({...});

// Try:
GmailApp.sendEmail(recipient, subject, body, {htmlBody: htmlBody});
```

**But first, try re-authorization with Method 1 or 2 above.**

---

## ✅ Expected Result:

After re-authorization:
1. ✅ Script runs without permission errors
2. ✅ Emails are sent successfully
3. ✅ Form submission works end-to-end

---

**Status:** Need to re-authorize Google Apps Script with email permissions

