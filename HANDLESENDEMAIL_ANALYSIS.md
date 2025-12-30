# 🔍 handleSendEmail Function - Detailed Analysis

## 📍 Location
**File:** `VOUCHER_WORKFLOW_BACKEND.gs`  
**Line:** 989-1246  
**Total Lines:** ~258 lines

---

## 🐛 BUG FOUND: Missing Assignment on Line 1183

**Issue:** Line 1183 is missing the assignment `requesterTo = requesterEmailData.to;`

**Current Code (WRONG):**
```javascript
// Priority 1: requesterEmailData.to from frontend
if (requesterEmailData && requesterEmailData.to && requesterEmailData.to.trim() !== '') {
  requesterSubject = '[THÔNG BÁO] Phiếu ' + (voucher.voucherType || '') + ' ' + (voucher.voucherNumber || '') + ' đã được gửi phê duyệt';
  requesterBody = requesterBodyBase.replace(/<a href="[^"]*">.*?<\/a>/g, ''); // Remove buttons
  Logger.log('📧 Priority 1: Using requesterEmailData.to: ' + requesterTo);
}
```

**Should Be (CORRECT):**
```javascript
// Priority 1: requesterEmailData.to from frontend
if (requesterEmailData && requesterEmailData.to && requesterEmailData.to.trim() !== '') {
  requesterTo = requesterEmailData.to;  // ← MISSING THIS LINE
  requesterSubject = '[THÔNG BÁO] Phiếu ' + (voucher.voucherType || '') + ' ' + (voucher.voucherNumber || '') + ' đã được gửi phê duyệt';
  requesterBody = requesterBodyBase.replace(/<a href="[^"]*">.*?<\/a>/g, ''); // Remove buttons
  Logger.log('📧 Priority 1: Using requesterEmailData.to: ' + requesterTo);
}
```

**Impact:** If `requesterEmailData.to` is provided, `requesterTo` remains `null`, so requester email will NOT be sent!

---

## ✅ Function Overview

### Purpose:
Handles sending approval request emails when a voucher is submitted for approval.

### Flow:
1. ✅ Validates email data
2. ✅ Uploads files to Google Drive
3. ✅ Injects file links into email body
4. ✅ Sends email to approvers
5. ✅ Sends email to requester (if email address is found)
6. ✅ Saves entry to Voucher_History sheet

---

## 📋 Step-by-Step Analysis

### Step 1: Input Validation (Lines 994-1005)
```javascript
const emailData = requestBody.email;
const requesterEmailData = requestBody.requesterEmail || null;
const voucher = requestBody.voucher || {};

if (!emailData) {
  return createResponse(false, 'Email data is required');
}
```
✅ **Status:** Proper validation

---

### Step 2: Extract Voucher Info (Lines 1010-1023)
```javascript
let voucherNumber = voucher.voucherNumber || '';
let voucherType = voucher.voucherType || '';
// Fallback: Extract from email subject if missing
```
✅ **Status:** Good fallback logic

---

### Step 3: Build Email Subject (Lines 1025-1037)
```javascript
subject = '[PHIẾU ' + typeUpper + '] Yêu cầu phê duyệt - ' + voucherNumber;
```
✅ **Status:** Properly constructed with Vietnamese characters

---

### Step 4: Validate Recipient (Lines 1041-1044)
```javascript
if (!to) {
  return createResponse(false, 'Recipient email is required');
}
```
✅ **Status:** Validates approver email

---

### Step 5: Upload Files to Drive (Lines 1046-1086)
```javascript
if (voucher.files && voucher.files.length > 0) {
  const uploadResult = uploadFilesToDrive_(voucher.files, voucherNumberForHistory);
  // Generate file links HTML
}
```
✅ **Status:** Handles file uploads correctly

---

### Step 6: Inject File Links into Email Body (Lines 1088-1150)
```javascript
if (fileLinksHtml && fileLinksHtml.length > 0) {
  // Inject into approver email body
  // Inject into requester email body
}
```
✅ **Status:** Properly injects file links into both emails

---

### Step 7: Send Email to Approvers (Lines 1156-1172)
```javascript
const emailOptions = { 
  to: to,
  subject: subject,
  htmlBody: body,
  noReply: false
};
if (cc && cc.trim() !== '') {
  emailOptions.cc = cc;
}
MailApp.sendEmail(emailOptions);
```
✅ **Status:** Correctly sends to approvers

**Required Scope:** `script.send_mail` ✅

---

### Step 8: Send Email to Requester (Lines 1174-1209) ⚠️ **HAS BUG**

**Current Logic:**
```javascript
// Priority 1: requesterEmailData.to from frontend
if (requesterEmailData && requesterEmailData.to && requesterEmailData.to.trim() !== '') {
  requesterSubject = '...';  // ← Missing: requesterTo = requesterEmailData.to;
  requesterBody = requesterBodyBase.replace(/<a href="[^"]*">.*?<\/a>/g, '');
  Logger.log('📧 Priority 1: Using requesterEmailData.to: ' + requesterTo);
}
// Priority 2: voucher.requestorEmail
else if (voucher.requestorEmail && voucher.requestorEmail.trim() !== '') {
  requesterTo = voucher.requestorEmail;  // ← This one is correct
  requesterSubject = '...';
  requesterBody = requesterBodyBase.replace(/<a href="[^"]*">.*?<\/a>/g, '');
  Logger.log('📧 Priority 2: Using voucher.requestorEmail: ' + requesterTo);
}

if (requesterTo) {
  MailApp.sendEmail({...});
}
```

❌ **Bug:** Line 1183 is missing `requesterTo = requesterEmailData.to;`

**Impact:**
- If frontend sends `requesterEmail.to`, it's ignored
- Only `voucher.requestorEmail` (Priority 2) works
- Requester email won't be sent if only `requesterEmail.to` is provided

---

### Step 9: Save to History (Lines 1211-1238)
```javascript
appendHistory_({
  voucherNumber: voucherNumberForHistory,
  voucherType: voucher.voucherType || '',
  company: voucher.company || '',
  employee: voucher.employee || '',
  amount: voucher.amount || '',
  status: 'Pending',
  action: 'Submit',
  // ... more fields
});
```
✅ **Status:** Properly saves to Voucher_History sheet

---

### Step 10: Return Response (Lines 1240-1245)
```javascript
return createResponse(true, 'Email sent successfully');
```
✅ **Status:** Returns proper JSON response

---

## 🔧 Fix Required

**File:** `VOUCHER_WORKFLOW_BACKEND.gs`  
**Line:** 1183

**Change:**
```javascript
// BEFORE (WRONG):
if (requesterEmailData && requesterEmailData.to && requesterEmailData.to.trim() !== '') {
  requesterSubject = '[THÔNG BÁO] Phiếu ' + (voucher.voucherType || '') + ' ' + (voucher.voucherNumber || '') + ' đã được gửi phê duyệt';

// AFTER (CORRECT):
if (requesterEmailData && requesterEmailData.to && requesterEmailData.to.trim() !== '') {
  requesterTo = requesterEmailData.to;  // ← ADD THIS LINE
  requesterSubject = '[THÔNG BÁO] Phiếu ' + (voucher.voucherType || '') + ' ' + (voucher.voucherNumber || '') + ' đã được gửi phê duyệt';
```

---

## ✅ Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Input Validation | ✅ | Proper |
| Voucher Info Extraction | ✅ | Good fallbacks |
| Subject Construction | ✅ | Handles Vietnamese |
| File Upload | ✅ | Works correctly |
| File Links Injection | ✅ | Works for both emails |
| Approver Email | ✅ | Sends correctly |
| Requester Email | ❌ | **BUG: Missing assignment on line 1183** |
| History Save | ✅ | Works correctly |
| Error Handling | ✅ | Try-catch blocks present |
| Logging | ✅ | Extensive logging |

---

## 🎯 Priority Fix

**URGENT:** Fix line 1183 to ensure requester emails are sent when frontend provides `requesterEmail.to`.

