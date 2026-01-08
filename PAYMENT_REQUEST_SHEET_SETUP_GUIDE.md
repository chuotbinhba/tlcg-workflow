# 📋 Payment Request Sheet Setup Guide

## ✅ Backend Updated Successfully!

The `PAYMENT_REQUEST_BACKEND.gs` has been updated to use your sheet name: **`Payment_Request_History`**

---

## 📊 Sheet Configuration

### **Google Spreadsheet:**
- **Spreadsheet ID:** `1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g`
- **Spreadsheet Name:** TLCG_Master Data
- **URL:** https://docs.google.com/spreadsheets/d/1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g

### **Sheets Used:**
1. ✅ **`Nhà cung cấp`** - Already exists (for suppliers)
2. 🆕 **`Payment_Request_History`** - You will create manually

---

## 🔧 What Was Updated in the Backend

### **1. Configuration Section:**
```javascript
const CONFIG = {
  SPREADSHEET_ID: '1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g',
  SHEET_NAME: 'Payment_Request_History',  // ← Your sheet name
  SUPPLIERS_SHEET_NAME: 'Nhà cung cấp',   // ← Existing sheet
  DRIVE_FOLDER_NAME: 'Payment Request Attachments',
  // ... column definitions
};
```

### **2. New Actions Added:**
- `submitPaymentRequest` - Submit new payment request
- `getRecentPaymentRequests` - Get user's recent requests
- `getSuppliers` - Load suppliers from "Nhà cung cấp"
- `addSupplier` - Add new supplier to "Nhà cung cấp"

### **3. Supplier Management:**
- ✅ Reads from "Nhà cung cấp" Column C (Vendor_Full_Name)
- ✅ Adds new suppliers with full 25-column structure
- ✅ Checks for duplicates before adding
- ✅ Auto-generates supplier IDs (VD###)

---

## 📝 Manual Steps: Create Payment_Request_History Sheet

### **Step 1: Open the Spreadsheet**
1. Go to: https://docs.google.com/spreadsheets/d/1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g
2. You should see existing sheets like "Nhà cung cấp", "Công ty", etc.

### **Step 2: Create New Sheet**
1. Click the **+** button at the bottom left (next to existing sheet tabs)
2. Name it: **`Payment_Request_History`** (exact name, case-sensitive)

### **Step 3: Add Header Row**

Copy and paste this header row into Row 1:

```
Request_ID	Request_Number	Company	Request_Date	Requester_Name	Requester_Email	Department	Purchase_Type	PR_Request_No	Purpose	Recipient	Supplier	Total_Amount	Currency	Payment_Type	PO_Number	Overall_Status	Budget_Approver	Budget_Approval_Status	Budget_Approval_Date	Supplier_Approver	Supplier_Approval_Status	Supplier_Approval_Date	Final_Approver	Final_Approval_Status	Final_Approval_Date	Product_Items_JSON	Payment_Phases_JSON	Attachments_JSON	Signatures_JSON	Created_Date	Last_Modified_Date	Modified_By	Notes	Rejection_Reason
```

**Or manually type these 35 column headers:**

| Col | Header |
|-----|--------|
| A | Request_ID |
| B | Request_Number |
| C | Company |
| D | Request_Date |
| E | Requester_Name |
| F | Requester_Email |
| G | Department |
| H | Purchase_Type |
| I | PR_Request_No |
| J | Purpose |
| K | Recipient |
| L | Supplier |
| M | Total_Amount |
| N | Currency |
| O | Payment_Type |
| P | PO_Number |
| Q | **Overall_Status** |
| R | Budget_Approver |
| S | Budget_Approval_Status |
| T | Budget_Approval_Date |
| U | Supplier_Approver |
| V | Supplier_Approval_Status |
| W | Supplier_Approval_Date |
| X | Final_Approver |
| Y | Final_Approval_Status |
| Z | Final_Approval_Date |
| AA | Product_Items_JSON |
| AB | Payment_Phases_JSON |
| AC | Attachments_JSON |
| AD | Signatures_JSON |
| AE | Created_Date |
| AF | Last_Modified_Date |
| AG | Modified_By |
| AH | Notes |
| AI | Rejection_Reason |

### **Step 4: Format Header Row (Optional but Recommended)**
1. Select Row 1 (the header row)
2. **Bold:** Ctrl+B (or Cmd+B on Mac)
3. **Background Color:** Choose a color (e.g., Blue #4285F4)
4. **Text Color:** White
5. **Freeze Row:** View → Freeze → 1 row

### **Step 5: Set Column Widths (Optional)**
Suggested widths:
- A-B: 150px (IDs)
- C-L: 200px (Text fields)
- M: 120px (Amount)
- N-P: 100px (Short fields)
- Q: 120px (Status)
- R-Z: 150px (Approvers)
- AA-AD: 100px (JSON - will show truncated)
- AE-AI: 150px (Metadata)

### **Step 6: Add Data Validation (Optional)**

**For Column Q (Overall_Status):**
1. Select column Q (starting from Q2)
2. Data → Data validation
3. Criteria: List of items
4. Items: `Pending,Approved,Rejected`
5. Show dropdown: ✅
6. Save

**For Columns S, V, Y (Approval Statuses):**
- Same as above: `Pending,Approved,Rejected`

---

## 🧪 Testing the Setup

### **Test 1: Check Backend Can Access Sheet**

Run this in Google Apps Script:

```javascript
function testSheetAccess() {
  const ss = SpreadsheetApp.openById('1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g');
  const sheet = ss.getSheetByName('Payment_Request_History');
  
  if (sheet) {
    Logger.log('✅ Sheet found!');
    Logger.log('Last row: ' + sheet.getLastRow());
    Logger.log('Last column: ' + sheet.getLastColumn());
  } else {
    Logger.log('❌ Sheet not found!');
  }
}
```

### **Test 2: Check Supplier Loading**

Run this in Google Apps Script:

```javascript
function testGetSuppliers() {
  const result = handleGetSuppliers({});
  Logger.log(result);
}
```

Expected output:
```
{
  success: true,
  message: "Suppliers retrieved successfully",
  suppliers: ["CÔNG TY ABC", "CÔNG TY XYZ", ...],
  count: 50
}
```

---

## 📊 Expected Data Flow

### **When User Submits Request:**

```
Frontend (de_nghi_thanh_toan.html)
    ↓
    POST: action=submitPaymentRequest
    ↓
Vercel Proxy (/api/voucher.js)
    ↓
Google Apps Script (PAYMENT_REQUEST_BACKEND.gs)
    ↓
    handleSendPaymentRequest()
    ↓
Append row to "Payment_Request_History" sheet
    ↓
Return: { success: true, requestId: "DNTT-2025-0001" }
```

### **When User Views Recent Requests:**

```
Frontend loads Recent Requests panel
    ↓
    POST: action=getRecentPaymentRequests
    ↓
Google Apps Script reads "Payment_Request_History"
    ↓
Filter by user email (requester or approver)
    ↓
Return: { requests: [...], stats: {...} }
    ↓
Display in Recent Requests panel
```

---

## ✅ Checklist

Before deploying:

- [ ] Created `Payment_Request_History` sheet
- [ ] Added all 35 column headers
- [ ] Formatted header row (bold, colored)
- [ ] Froze header row
- [ ] Added data validation for status columns
- [ ] Tested sheet access from Apps Script
- [ ] Tested supplier loading
- [ ] Deployed `PAYMENT_REQUEST_BACKEND.gs` to Google Apps Script
- [ ] Updated Vercel environment variable: `PAYMENT_REQUEST_BACKEND_URL`
- [ ] Tested end-to-end flow

---

## 🚀 Ready to Deploy!

Once you've created the `Payment_Request_History` sheet:

1. **Deploy Backend:**
   - Copy `PAYMENT_REQUEST_BACKEND.gs` to Google Apps Script
   - Deploy as Web App
   - Copy the Web App URL

2. **Update Vercel:**
   ```bash
   vercel env add PAYMENT_REQUEST_BACKEND_URL
   # Paste the Web App URL
   ```

3. **Test:**
   - Load `de_nghi_thanh_toan.html`
   - Suppliers should load automatically
   - Submit a test request
   - Check `Payment_Request_History` sheet for new row

---

## 📞 Need Help?

If you encounter issues:

1. **Sheet not found error:**
   - Check sheet name is exactly: `Payment_Request_History`
   - Check spreadsheet ID is correct
   - Check Apps Script has permission to access the sheet

2. **Suppliers not loading:**
   - Check "Nhà cung cấp" sheet exists
   - Check Column C has data
   - Check Apps Script logs for errors

3. **Requests not saving:**
   - Check all 35 columns exist
   - Check Apps Script logs
   - Check Vercel proxy logs

---

**All set! The backend is ready to use your `Payment_Request_History` sheet!** 🎉
