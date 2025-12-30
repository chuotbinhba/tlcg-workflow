# ✅ Update Manifest File - Add Missing OAuth Scope

## 🔍 Problem:
Your manifest has `gmail.send` but is missing `script.send_mail` which is required for `MailApp.sendEmail()`.

## ✅ Solution:

### Update Your `appsscript.json`:

**Replace the `oauthScopes` array with this:**

```json
{
  "timeZone": "Asia/Ho_Chi_Minh",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.external_request"
  ],
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

### Key Change:
**ADD this line:**
```json
"https://www.googleapis.com/auth/script.send_mail",
```

**After:**
```json
"https://www.googleapis.com/auth/spreadsheets",
```

---

## 📝 Step-by-Step:

### 1. Open appsscript.json in Google Apps Script
- File should already be visible (you have it enabled)
- Click on `appsscript.json` in file list

### 2. Update oauthScopes
- Find the `oauthScopes` array
- Add `"https://www.googleapis.com/auth/script.send_mail",` after `spreadsheets`

### 3. Save
- Click "Save" (Ctrl+S or Cmd+S)
- Wait for confirmation

### 4. Run Function Again
- Select `testEmailPermission` from dropdown
- Click "Run" (▶️)
- **Authorization popup should appear:**
  - Click "Review Permissions"
  - You should see NEW permission: "Send email on your behalf"
  - Click "Allow"
- Function should work!

---

## 🔍 Why Both Scopes?

| Scope | Used For |
|-------|----------|
| `script.send_mail` | `MailApp.sendEmail()` ✅ **REQUIRED** |
| `gmail.send` | `GmailApp.sendEmail()` (also used in code) |
| `spreadsheets` | Read/write Google Sheets |
| `drive` | Upload files to Google Drive |
| `script.external_request` | Make external HTTP requests |

---

## ✅ After Update:

1. ✅ Manifest has all required scopes
2. ✅ Authorization popup shows all permissions
3. ✅ `MailApp.sendEmail()` works
4. ✅ `GmailApp.sendEmail()` works
5. ✅ Form submission works end-to-end

---

## 🎯 Quick Copy-Paste:

**Just add this line to your oauthScopes array (after spreadsheets):**
```json
"https://www.googleapis.com/auth/script.send_mail",
```

**Full array should be:**
```json
"oauthScopes": [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/script.send_mail",  ← ADD THIS
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/script.external_request"
]
```

---

**Status:** Update manifest and re-authorize

