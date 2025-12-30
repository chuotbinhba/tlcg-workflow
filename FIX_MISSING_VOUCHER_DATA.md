# Fix Missing Voucher Data in Modal

## Problem
When viewing a voucher in the detail modal, all fields show "TEST" values or missing information:
- Company: "TEST COMPANY"
- Employee: "Test Employee"
- Department: "Test Department"
- Payee: "Test Payee"

## Root Cause

The "TEST" data comes from the `testAppendHistory()` function in the backend (line 197-231). This function creates test entries with hardcoded "TEST" values.

If you see voucher number "TEST-1767071771757", this is a **test entry** that was created by running the test function.

## Solution

### Option 1: Delete Test Entries (Recommended)

1. **Open your Google Sheet:**
   - Go to: `https://docs.google.com/spreadsheets/d/1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g`
   - Open the **"Voucher_History"** sheet

2. **Find and Delete Test Rows:**
   - Look for rows where `VoucherNumber` starts with "TEST-"
   - Select the entire row(s) and delete them

3. **Verify Real Data:**
   - Check that real vouchers (with numbers like "TL-2025-12-XXXX") have complete data in columns:
     - Column C: Company
     - Column D: Employee
     - Column N (MetaJSON): Should contain JSON with `department` and `payeeName`

### Option 2: Check if Real Data is Actually Missing

If you're viewing a **real voucher** (not TEST-*) but data is still missing, check:

#### 1. Check Backend Logs

In Google Apps Script editor:
- Go to **Executions** tab
- Find the execution when the voucher was submitted
- Check logs for:
  ```
  === APPENDING HISTORY ===
  Entry data: {...}
  ```

Look for the `entry` object to see if `company`, `employee`, `department`, `payeeName` are present.

#### 2. Check Sheet Data Directly

Open the Voucher_History sheet and find the row for your voucher:
- Column C (Company): Should have company name
- Column D (Employee): Should have employee name
- Column N (MetaJSON): Should be valid JSON containing:
  ```json
  {
    "department": "...",
    "payeeName": "...",
    "voucherDate": "...",
    ...
  }
  ```

#### 3. Verify Frontend is Sending Data

When submitting a voucher, check browser console (F12) for:
```
=== VOUCHER DATA FOR HISTORY ===
Company: [should show company name]
Employee: [should show employee name]
...
```

If these are empty, the form fields might not be populated correctly.

## How Data Flows

```
1. Frontend (phieu_thu_chi.html)
   ↓
   sendForApproval() function (line 5651-5665)
   ↓
   Payload with voucher object:
   {
     company: companyName,
     employee: requestorName,
     department: department,
     payeeName: payeeName,
     ...
   }
   ↓
2. Backend (VOUCHER_WORKFLOW_BACKEND.gs)
   ↓
   handleSendEmail() function (line 1214-1234)
   ↓
   appendHistory_() function (line 277-447)
   ↓
   Saves to sheet:
   - Column C: company
   - Column D: employee
   - Column N (MetaJSON): {department, payeeName, ...}
   ↓
3. Frontend Retrieval
   ↓
   openVoucherDetail() function (line 3334)
   ↓
   getVoucherHistory API call
   ↓
   Backend: getVoucherHistory_() function (line 470-633)
   ↓
   Returns history array with:
   - voucher.company (from Column C)
   - voucher.employee (from Column D)
   - voucher.meta.department (from MetaJSON)
   - voucher.meta.payeeName (from MetaJSON)
   ↓
   renderVoucherDetails() function (line 3496)
   ↓
   Displays:
   - ${voucher.company || 'N/A'}
   - ${voucher.employee || 'N/A'}
   - ${meta.department || 'N/A'}
   - ${meta.payeeName || voucher.employee || 'N/A'}
```

## Debugging Steps

### Step 1: Check What's in the Sheet

Run this in Google Apps Script editor:

```javascript
function checkVoucherData() {
  const sheet = SpreadsheetApp.openById('1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g')
    .getSheetByName('Voucher_History');
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find last 5 rows
  for (let i = Math.max(1, data.length - 5); i < data.length; i++) {
    Logger.log(`Row ${i}:`);
    Logger.log(`  VoucherNumber: ${data[i][headers.indexOf('VoucherNumber')]}`);
    Logger.log(`  Company: ${data[i][headers.indexOf('Company')]}`);
    Logger.log(`  Employee: ${data[i][headers.indexOf('Employee')]}`);
    
    const metaJSON = data[i][headers.indexOf('MetaJSON')];
    if (metaJSON) {
      try {
        const meta = JSON.parse(metaJSON);
        Logger.log(`  Department: ${meta.department || 'MISSING'}`);
        Logger.log(`  PayeeName: ${meta.payeeName || 'MISSING'}`);
      } catch (e) {
        Logger.log(`  MetaJSON parse error: ${e}`);
      }
    }
  }
}
```

### Step 2: Test with Real Data

1. **Fill out a complete voucher form:**
   - Select a company
   - Select an employee
   - Enter department
   - Enter payee name
   - Fill all required fields

2. **Submit for approval**

3. **Check the console logs** (F12) for:
   ```
   === VOUCHER DATA FOR HISTORY ===
   Company: [your company]
   Employee: [your employee]
   ```

4. **After submission, check the sheet** to verify data was saved

5. **Open the voucher detail modal** and verify all fields show correctly

## Expected Behavior

When viewing a **real voucher** (not TEST-*), the modal should show:
- **Số phiếu**: TL-2025-12-XXXX (or similar)
- **Công ty**: Actual company name (e.g., "CÔNG TY TNHH EGG VENTURES")
- **Người đề nghị**: Actual employee name (e.g., "Nguyễn Văn Chinh")
- **Phòng ban**: Actual department from form
- **Người nhận tiền**: Actual payee name from form
- **Số tiền**: Actual amount
- **Trạng thái**: Pending/Approved/Rejected

## If Data is Still Missing After Checking

1. **Check browser console** when opening the modal:
   - Look for `Current voucher:` log
   - Check if `voucher.company`, `voucher.employee` are present
   - Check if `meta.department`, `meta.payeeName` are present

2. **Check backend logs** in Google Apps Script:
   - Look at the execution when voucher was submitted
   - Verify `appendHistory_` received complete data

3. **Verify form fields are populated:**
   - Make sure all form fields are filled before submitting
   - Check that `getElementById('company').value` returns a value
   - Check that `getElementById('employee').value` returns a value
   - Check that `getElementById('department').value` returns a value
   - Check that `getElementById('payee-name').value` returns a value

## Quick Fix: Delete Test Data

**IMPORTANT:** If you see "TEST-*" voucher numbers, these are test entries. Delete them from the sheet:

1. Open Voucher_History sheet
2. Filter/sort by VoucherNumber column
3. Delete all rows where VoucherNumber starts with "TEST-"
4. Refresh the voucher list
5. Submit a new real voucher to verify it works correctly

