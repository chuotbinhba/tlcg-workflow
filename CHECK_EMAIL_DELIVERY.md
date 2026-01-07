# 📧 Check Email Delivery - Troubleshooting

## ✅ Function Said "Email Sent" But Not Received

If `testEmailPermission` ran successfully but you didn't receive the email, check these:

---

## 🔍 Step 1: Check Spam/Junk Folder

**Most common reason:** Email went to spam

1. **Open Gmail** (chinhnguyenhue@gmail.com)
2. **Check "Spam" folder** (left sidebar)
3. **Check "All Mail"** (search for subject "Test Email")

---

## 🔍 Step 2: Check Gmail Filters

Gmail might be filtering the email:

1. **Open Gmail**
2. **Settings** (⚙️) → **See all settings**
3. **Filters and Blocked Addresses** tab
4. **Check if any filters** are moving emails to trash or other folders

---

## 🔍 Step 3: Verify Email Was Actually Sent

### Check Logger in Google Apps Script:

1. **Open Google Apps Script**
2. **Click "Executions"** (left sidebar, clock icon)
3. **Find your `testEmailPermission` execution**
4. **Click on it** to see logs
5. **Look for:**
   - ✅ "Email sent!" message
   - ✅ Any error messages
   - ✅ Execution time/details

### Check Execution Logs:

1. **In Google Apps Script editor**
2. **View → Logs** (or press Ctrl+Enter / Cmd+Enter)
3. **Should see:** Logger output from the function

---

## 🔍 Step 4: Test with Better Function

Create a more detailed test function to verify:

```javascript
function testEmailDetailed() {
  try {
    const recipient = 'chinhnguyenhue@gmail.com';
    const subject = 'Test Email from Apps Script - ' + new Date().toLocaleString();
    const body = 'This is a test email sent at ' + new Date().toLocaleString();
    
    Logger.log('Attempting to send email to: ' + recipient);
    Logger.log('Subject: ' + subject);
    
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: body
    });
    
    Logger.log('✅ Email sent successfully!');
    Logger.log('Check inbox for: ' + subject);
    return 'SUCCESS - Check your email inbox and spam folder';
    
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
    Logger.log('Error details: ' + JSON.stringify(e));
    return 'ERROR: ' + e.toString();
  }
}
```

**Run this function:**
1. Select `testEmailDetailed` from dropdown
2. Click "Run" (▶️)
3. Check Logger (View → Logs)
4. Check email (including spam)

---

## 🔍 Step 5: Check Gmail Activity

### Check Recent Activity:

1. **Open Gmail**
2. **Scroll to bottom** → Click "Last account activity"
3. **Check recent logins** and activity
4. **See if email was received** (might show in activity log)

### Search Gmail:

1. **In Gmail search bar, type:**
   ```
   from:your-script-name OR subject:"Test Email"
   ```
2. **Or search:**
   ```
   newer_than:1h
   ```

---

## 🔍 Step 6: Check Daily Quota

Gmail has sending limits:

1. **In Google Apps Script, run:**
   ```javascript
   function checkEmailQuota() {
     const quota = MailApp.getRemainingDailyQuota();
     Logger.log('Remaining daily email quota: ' + quota);
     return 'Remaining quota: ' + quota;
   }
   ```
2. **Run the function**
3. **Check Logger** - should show remaining quota
4. **If quota is 0:** You've hit the daily limit (100 emails/day for free Gmail)

---

## 🔍 Step 7: Try Different Email Address

Test with a different email to rule out recipient issues:

```javascript
function testEmailToDifferentAddress() {
  try {
    MailApp.sendEmail({
      to: 'your-other-email@gmail.com', // Try different email
      subject: 'Test from Apps Script',
      body: 'Test email'
    });
    Logger.log('Email sent to alternative address');
    return 'Check alternative email';
  } catch (e) {
    Logger.log('Error: ' + e.toString());
    return 'ERROR: ' + e.toString();
  }
}
```

---

## 🎯 Most Likely Causes:

### 1. **Spam Folder** (90% of cases)
- ✅ Check spam/junk folder first
- ✅ Mark as "Not spam" if found

### 2. **Email Filter/Rule**
- ✅ Check Gmail filters
- ✅ Check forwarding rules

### 3. **Daily Quota Exceeded**
- ✅ Check remaining quota
- ✅ Wait 24 hours if quota is 0

### 4. **Wrong Email Address**
- ✅ Verify email is correct: `chinhnguyenhue@gmail.com`
- ✅ No typos

### 5. **Delivery Delay**
- ✅ Wait a few minutes
- ✅ Gmail sometimes delays delivery

---

## ✅ Quick Checklist:

- [ ] Check Spam folder
- [ ] Check "All Mail" folder
- [ ] Search Gmail for "Test Email"
- [ ] Check Logger in Apps Script for errors
- [ ] Check execution logs
- [ ] Verify email quota is not 0
- [ ] Wait 5-10 minutes for delivery
- [ ] Try sending to different email address

---

## 🔧 If Still Not Working:

### Option 1: Use GmailApp Instead

The backend code also uses `GmailApp.sendEmail()`. Try testing with GmailApp:

```javascript
function testGmailApp() {
  try {
    GmailApp.sendEmail(
      'chinhnguyenhue@gmail.com',
      'Test from GmailApp',
      'Test body',
      {
        htmlBody: '<p>Test email from <b>GmailApp</b></p>'
      }
    );
    Logger.log('✅ GmailApp email sent');
    return 'SUCCESS - Check email';
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
    return 'ERROR: ' + e.toString();
  }
}
```

### Option 2: Check Gmail Settings

1. **Gmail Settings** → **Forwarding and POP/IMAP**
2. **Enable IMAP** if not enabled
3. **Check forwarding rules**

---

**Status:** Email sent but not received - check spam folder first!

