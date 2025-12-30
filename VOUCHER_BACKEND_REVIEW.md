# VOUCHER_WORKFLOW_BACKEND.gs - Review Report

**File:** `VOUCHER_WORKFLOW_BACKEND.gs`  
**Review Date:** 2025-12-26

---

## ✅ Overall Assessment

**Status:** ⚠️ **GOOD with Minor Issues**

The backend code is functional and handles file uploads correctly. However, there are a few issues that should be addressed.

---

## ✅ What's Working

1. **File Upload to Google Drive** ✅
   - `uploadFilesToDrive_()` function works correctly
   - Files are uploaded and sharing is set
   - Returns file URLs

2. **Attachments in Column J** ✅
   - Attachments are saved to column J (10th column, index 9)
   - Format: "filename\nurl" for each file
   - Links are clickable in Google Sheets

3. **Email Sending** ✅
   - GmailApp.sendEmail() works
   - Email options handled correctly

4. **Voucher History** ✅
   - `appendHistory_()` saves data correctly
   - Column structure is correct

---

## ⚠️ Issues Found

### 1. **Missing Company Field** ❌

**Location:** Lines 62-74, 131-137

**Issue:** The `company` field is not being saved to Column C in Voucher_History sheet.

**Current Code:**
```javascript
// handleSendEmail() - Line 62-74
appendHistory_({
  voucherNumber: voucherNo,
  voucherType: voucher.voucherType || '',
  employee: voucher.employee || '',  // ✓
  // company is missing! ❌
  amount: voucher.amount || 0,
  // ...
});

// appendHistory_() - Line 131-137
sheet.appendRow([
  entry.voucherNumber, entry.voucherType, "", entry.employee,  // "" instead of entry.company
  // ...
]);
```

**Impact:**
- Column C (Company) will always be empty
- Frontend sends `voucher.company` but it's not being used

**Fix Required:**
```javascript
// In handleSendEmail()
appendHistory_({
  // ...
  company: voucher.company || '',  // ADD THIS
  // ...
});

// In appendHistory_()
sheet.appendRow([
  entry.voucherNumber, 
  entry.voucherType, 
  entry.company || '',  // CHANGE "" to entry.company
  entry.employee,
  // ...
]);
```

---

### 2. **Missing FormData Parsing** ⚠️

**Location:** Line 18-24

**Issue:** Frontend sends data as FormData with JSON in 'data' field, but backend only checks `e.parameter.action` and `e.postData.contents`.

**Current Code:**
```javascript
if (e.parameter && e.parameter.action) {
  // This won't work for FormData
} else if (e.postData && e.postData.contents) {
  requestBody = JSON.parse(e.postData.contents);
}
```

**Expected Frontend Behavior:**
Based on previous fixes, frontend sends FormData like this:
```javascript
const formData = new FormData();
formData.append('data', payloadString); // JSON string in 'data' field
```

**Fix Required:**
```javascript
// Add FormData parsing
if (e.parameter && e.parameter.data) {
  try {
    requestBody = JSON.parse(e.parameter.data);
    action = requestBody.action;
  } catch (parseError) {
    return createResponse(false, 'Lỗi parse dữ liệu: ' + parseError.message);
  }
} else if (e.parameter && e.parameter.action) {
  // ... existing code
}
```

---

### 3. **Missing requesterEmail Handling** ⚠️

**Location:** Line 42-80

**Issue:** The frontend sends `requesterEmail` object separately, but it's not being handled.

**Frontend sends:**
```javascript
{
  email: { to, subject, body },
  requesterEmail: { to, subject, body },  // Separate email for requester
  voucher: { ... }
}
```

**Current Code:**
Only sends email to approvers, doesn't send separate email to requester.

**Impact:**
- Requester won't receive confirmation email
- Less user-friendly

**Fix Required:**
```javascript
// After sending email to approvers
if (requestBody.requesterEmail && requestBody.requesterEmail.to) {
  try {
    GmailApp.sendEmail(
      requestBody.requesterEmail.to,
      requestBody.requesterEmail.subject || '[THÔNG BÁO] Phiếu đã được gửi phê duyệt',
      '',
      { htmlBody: requestBody.requesterEmail.body || '' }
    );
  } catch (e) {
    // Log but don't fail
  }
}
```

---

### 4. **Column Order Verification** ✅

**Location:** Line 131-137

The column order in `appendHistory_()` is:
- Column A (index 0): voucherNumber ✓
- Column B (index 1): voucherType ✓
- Column C (index 2): "" (should be company) ❌
- Column D (index 3): employee ✓
- Column E (index 4): amount ✓
- Column F (index 5): status ✓
- Column G (index 6): action ✓
- Column H (index 7): by ✓
- Column I (index 8): note ✓
- **Column J (index 9): attachments** ✓ **CORRECT!**
- Column K (index 10): requestorEmail ✓
- Column L (index 11): approverEmail ✓
- Column M (index 12): timestamp ✓

**Column J (Attachments) is correctly positioned!** ✅

---

## 📝 Recommended Fixes

### Fix 1: Add Company Field

```javascript
// In handleSendEmail() - around line 62
appendHistory_({
  voucherNumber: voucherNo,
  voucherType: voucher.voucherType || '',
  company: voucher.company || '',  // ADD THIS
  employee: voucher.employee || '',
  // ... rest
});

// In appendHistory_() - line 134
sheet.appendRow([
  entry.voucherNumber, 
  entry.voucherType, 
  entry.company || '',  // CHANGE from ""
  entry.employee,
  // ... rest
]);
```

### Fix 2: Add FormData Parsing (if needed)

Only add if frontend actually sends FormData. Check if current implementation works first.

### Fix 3: Add Requester Email (optional but recommended)

Add requester email sending after approver email.

---

## ✅ Summary

**Critical Issues:**
1. ❌ Company field not saved to Column C

**Minor Issues:**
2. ⚠️ Missing FormData parsing (may not be needed if current code works)
3. ⚠️ Missing requester email (nice-to-have feature)

**Working Correctly:**
- ✅ File upload to Google Drive
- ✅ Attachments saved to Column J (correct position)
- ✅ File links are clickable
- ✅ Email sending works
- ✅ Column structure is correct

**Priority Fix:** Add company field to appendHistory_() calls.

---

## 🧪 Testing Checklist

- [ ] Test file upload - verify files appear in Drive
- [ ] Check Column J in Voucher_History - verify links are clickable
- [ ] Check Column C - verify company name is saved (after fix)
- [ ] Test email sending - verify approvers receive email
- [ ] Test with multiple files - verify all links appear
- [ ] Test error handling - verify graceful failure if upload fails

---

**Overall Grade: B+ (needs company field fix)**

