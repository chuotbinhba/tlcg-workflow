# PHIẾU THU CHI WORKFLOW ANALYSIS
## Issues Found & Root Causes

Generated: $(date)

---

## 🔍 ISSUE 1: TASK DUPLICATION

### Symptoms:
- User inputs task once, but it appears duplicated
- Email is sent successfully
- Data NOT appearing in Google Sheet (Voucher_History)

### Root Causes Identified:

#### 1.1 NO DUPLICATE SUBMISSION PREVENTION IN FRONTEND
**Location**: `phieu_thu_chi.html` line 5621

```javascript
document.getElementById('send-approval-btn').disabled = true;
```

**Problem**: 
- Button is disabled AFTER validation passes
- If user double-clicks quickly BEFORE validation completes, multiple submissions can occur
- No flag to track if submission is in progress

**Evidence**:
- Only ONE event listener exists (line 2984): ✅ GOOD
- Button disabled INSIDE async function: ❌ BAD
- No submission flag check: ❌ BAD

---

#### 1.2 NO DUPLICATE CHECK IN BACKEND BEFORE SUBMISSION
**Location**: `VOUCHER_WORKFLOW_BACKEND.gs` line 168 `handleSendEmail()`

**Problem**:
- Backend does NOT check if voucher number already exists before appending to history
- `appendHistory_()` always appends without checking for duplicates
- If frontend sends same request twice (network retry, double-click), backend will create 2 entries

**Evidence**:
```javascript
// Line 251 - Direct append without duplicate check
appendHistory_({
  voucherNumber: voucherNo,
  voucherType: voucher.voucherType || '',
  // ... no duplicate check before this
});
```

**Compare with Approval/Rejection**:
- `handleApproveVoucher()` (line 273) HAS duplicate check ✅
- `handleRejectVoucher()` (line 361) HAS duplicate check ✅
- `handleSendEmail()` (line 168) NO duplicate check ❌

---

## 🔍 ISSUE 2: DATA NOT APPEARING IN GOOGLE SHEET

### Possible Causes:

#### 2.1 SHEET NAME MISMATCH
**Check**: 
- Frontend expects: (not explicitly defined, uses backend)
- Backend uses: `VH_SHEET_NAME = 'Voucher_History'` (line 7)
- Actual sheet name in Google Sheets: **NEEDS VERIFICATION**

**Action Required**:
1. Open: https://docs.google.com/spreadsheets/d/1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g/
2. Verify sheet tab name is EXACTLY: `Voucher_History` (case-sensitive)

---

#### 2.2 SHEET PERMISSION ISSUES
**Check**:
- Script may not have write permission to sheet
- Sheet may be protected
- Script owner may not be sheet owner

**Action Required**:
1. Check Google Apps Script execution logs
2. Look for errors like: "Permission denied" or "Cannot access sheet"

---

#### 2.3 VOUCHER NUMBER GENERATION ISSUE
**Location**: `phieu_thu_chi.html` line 5624-5638

```javascript
let voucherNumber = document.getElementById('voucher-number').value;
if (!voucherNumber || voucherNumber.trim() === '' || voucherNumber === 'TL-2023-') {
    console.log('⚠️ Voucher number missing or invalid, generating new one...');
    generateVoucherNumber();
    voucherNumber = document.getElementById('voucher-number').value;
}
```

**Potential Issue**:
- If `generateVoucherNumber()` fails silently, voucher number may be invalid
- Backend uses: `voucherNo = voucher.voucherNumber || 'AUTO-' + new Date().getTime();` (line 175)
- If voucher number is empty, backend generates AUTO-timestamp which may cause lookup issues

---

#### 2.4 BACKEND ERROR NOT PROPAGATED TO FRONTEND
**Location**: `VOUCHER_WORKFLOW_BACKEND.gs` line 665-672

```javascript
function appendHistory_(entry) {
  const sheet = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID).getSheetByName(VH_SHEET_NAME);
  sheet.appendRow([...]);
}
```

**Problem**:
- No try-catch in `appendHistory_()`
- If sheet append fails, error is not caught
- Parent function `handleSendEmail()` has try-catch, but may not catch sheet errors
- Frontend may show "success" even if sheet write failed

---

## 🔍 ISSUE 3: EMAIL SENT BUT NO HISTORY

### Scenario Analysis:

If email is sent successfully BUT no history entry:

1. **Email sending succeeds** (line 213)
2. **History append fails** (line 251)
3. **Error caught** (line 268) but email already sent
4. **Frontend shows error** but email was already delivered

**This explains**:
- ✅ Email received
- ❌ No history in sheet
- ❌ Duplicate if user retries

---

## 🛠️ RECOMMENDED FIXES

### FIX 1: Add Duplicate Submission Prevention (Frontend)

**File**: `phieu_thu_chi.html`
**Location**: Before line 5563

```javascript
// Add at top of file with other global variables
let isSubmitting = false;

async function sendForApproval() {
    // CRITICAL: Prevent duplicate submissions
    if (isSubmitting) {
        console.log('⚠️ Submission already in progress, ignoring duplicate click');
        showToast('Đang xử lý yêu cầu trước đó, vui lòng đợi...', 'warning');
        return;
    }
    
    isSubmitting = true;
    
    // Disable button immediately (before validation)
    const submitBtn = document.getElementById('send-approval-btn');
    submitBtn.disabled = true;
    
    try {
        // ... existing validation and submission code ...
        
    } catch (error) {
        // ... existing error handling ...
    } finally {
        // Always reset flag and re-enable button
        isSubmitting = false;
        submitBtn.disabled = false;
    }
}
```

---

### FIX 2: Add Duplicate Check in Backend (Before Submission)

**File**: `VOUCHER_WORKFLOW_BACKEND.gs`
**Location**: In `handleSendEmail()` after line 175

```javascript
function handleSendEmail(requestBody) {
  try {
    const emailData = requestBody.email;
    const requesterEmailData = requestBody.requesterEmail || null;
    const voucher = requestBody.voucher || {};
    if (!emailData || !emailData.to) return createResponse(false, 'Thiếu người nhận');

    const voucherNo = voucher.voucherNumber || 'AUTO-' + new Date().getTime();
    
    // ✅ ADD DUPLICATE CHECK HERE
    const sheet = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID).getSheetByName(VH_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1); // Skip header
    
    // Check if this voucher was already submitted
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === voucherNo && rows[i][6] === 'Submit') {
        Logger.log('⚠️ Duplicate submission detected for voucher: ' + voucherNo);
        return createResponse(false, 'Phiếu này đã được gửi trước đó. Vui lòng kiểm tra lại.');
      }
    }
    
    // ... rest of existing code ...
```

---

### FIX 3: Add Error Handling to appendHistory_

**File**: `VOUCHER_WORKFLOW_BACKEND.gs`
**Location**: Replace function at line 665

```javascript
function appendHistory_(entry) {
  try {
    const sheet = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID).getSheetByName(VH_SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet "' + VH_SHEET_NAME + '" not found');
    }
    
    sheet.appendRow([
      entry.voucherNumber, entry.voucherType, entry.company || '', entry.employee,
      entry.amount, entry.status, entry.action, entry.by, entry.note,
      entry.attachments, entry.requestorEmail, entry.approverEmail, new Date()
    ]);
    
    Logger.log('✅ History appended for voucher: ' + entry.voucherNumber);
    return true;
  } catch (error) {
    Logger.log('❌ ERROR in appendHistory_: ' + error.toString());
    throw error; // Re-throw so parent function can handle
  }
}
```

---

### FIX 4: Verify Sheet Configuration

**Action Items**:

1. **Check Sheet Name**:
   - Open: https://docs.google.com/spreadsheets/d/1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g/
   - Verify tab name is: `Voucher_History` (exact match, case-sensitive)

2. **Check Sheet Permissions**:
   - Script owner must have edit access
   - Sheet must not be protected
   - Check: File > Share > Advanced settings

3. **Check Column Headers**:
   Expected columns (A-M):
   - A: Voucher Number
   - B: Voucher Type
   - C: Company
   - D: Employee
   - E: Amount
   - F: Status
   - G: Action
   - H: By
   - I: Note
   - J: Attachments
   - K: Requestor Email
   - L: Approver Email
   - M: Timestamp

---

## 🧪 DEBUGGING STEPS

### Step 1: Check Google Apps Script Logs

1. Open: https://script.google.com/
2. Find project: "VOUCHER_WORKFLOW_BACKEND"
3. Click: Executions
4. Look for recent executions
5. Check for errors

### Step 2: Test with Console Logging

Add this to frontend before submission (line 6203):

```javascript
console.log('=== PRE-SUBMISSION CHECK ===');
console.log('isSubmitting flag:', isSubmitting);
console.log('Button disabled:', document.getElementById('send-approval-btn').disabled);
console.log('Voucher Number:', voucherNumber);
console.log('=== END PRE-SUBMISSION CHECK ===');
```

### Step 3: Check Sheet Directly

After submission, immediately check:
1. Open Google Sheet
2. Go to "Voucher_History" tab
3. Check if new row was added
4. If no row: Check Apps Script logs for errors

---

## 📊 SUMMARY

| Issue | Severity | Impact | Fix Priority |
|-------|----------|--------|--------------|
| No duplicate prevention (frontend) | HIGH | Users can double-submit | 🔴 CRITICAL |
| No duplicate check (backend) | HIGH | Duplicate history entries | 🔴 CRITICAL |
| No error handling in appendHistory_ | MEDIUM | Silent failures | 🟡 HIGH |
| Sheet name/permission issues | HIGH | Data not saved | 🔴 CRITICAL |

---

## 🎯 IMMEDIATE ACTION PLAN

1. **Verify Sheet Configuration** (5 min)
   - Check sheet name
   - Check permissions
   - Check column headers

2. **Check Apps Script Logs** (5 min)
   - Look for recent errors
   - Identify failure point

3. **Apply Frontend Fix** (10 min)
   - Add `isSubmitting` flag
   - Test double-click prevention

4. **Apply Backend Fix** (15 min)
   - Add duplicate check in `handleSendEmail()`
   - Add error handling in `appendHistory_()`
   - Deploy new version

5. **Test End-to-End** (10 min)
   - Submit voucher
   - Check email received
   - Verify history in sheet
   - Try duplicate submission

---

**Total Estimated Time**: 45 minutes

