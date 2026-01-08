# 🔄 Backend Changes Summary

## What Changed in PAYMENT_REQUEST_BACKEND.gs

---

## ✅ 1. Configuration Section (Lines 19-63)

### **BEFORE:**
```javascript
const CONFIG = {
  SHEET_NAME: 'PaymentRequests',
  HISTORY_SHEET_NAME: 'PaymentRequestHistory',
  DRIVE_FOLDER_NAME: 'Payment Request Attachments',
  // ...
};
```

### **AFTER:**
```javascript
const CONFIG = {
  SPREADSHEET_ID: '1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g', // ← NEW
  SHEET_NAME: 'Payment_Request_History',  // ← CHANGED
  SUPPLIERS_SHEET_NAME: 'Nhà cung cấp',   // ← NEW
  DRIVE_FOLDER_NAME: 'Payment Request Attachments',
  // ...
};
```

### **Changes:**
- ✅ Added `SPREADSHEET_ID` pointing to TLCG_Master Data
- ✅ Changed `SHEET_NAME` from `PaymentRequests` to `Payment_Request_History`
- ✅ Added `SUPPLIERS_SHEET_NAME` for supplier data
- ✅ Removed `HISTORY_SHEET_NAME` (using `SHEET_NAME` for everything)

---

## ✅ 2. Action Routing (Lines 91-109)

### **BEFORE:**
```javascript
switch (action) {
  case 'sendPaymentRequest':
    return handleSendPaymentRequest(data);
  case 'approvePaymentRequest':
    return handleApprovePaymentRequest(data);
  case 'rejectPaymentRequest':
    return handleRejectPaymentRequest(data);
  case 'getPaymentRequestHistory':
    return handleGetPaymentRequestHistory(data);
  case 'getPaymentRequestDetails':
    return handleGetPaymentRequestDetails(data);
  default:
    return createResponse(false, 'Invalid action: ' + action);
}
```

### **AFTER:**
```javascript
switch (action) {
  case 'submitPaymentRequest':           // ← NEW ALIAS
  case 'sendPaymentRequest':
    return handleSendPaymentRequest(data);
  case 'approvePaymentRequest':
    return handleApprovePaymentRequest(data);
  case 'rejectPaymentRequest':
    return handleRejectPaymentRequest(data);
  case 'getPaymentRequestHistory':
  case 'getRecentPaymentRequests':       // ← NEW ALIAS
    return handleGetPaymentRequestHistory(data);
  case 'getPaymentRequestDetails':
    return handleGetPaymentRequestDetails(data);
  case 'getSuppliers':                   // ← NEW
    return handleGetSuppliers(data);
  case 'addSupplier':                    // ← NEW
    return handleAddSupplier(data);
  default:
    return createResponse(false, 'Invalid action: ' + action);
}
```

### **Changes:**
- ✅ Added `submitPaymentRequest` alias (matches frontend)
- ✅ Added `getRecentPaymentRequests` alias (matches frontend)
- ✅ Added `getSuppliers` action
- ✅ Added `addSupplier` action

---

## ✅ 3. Sheet References Updated

### **All occurrences of `CONFIG.HISTORY_SHEET_NAME` changed to `CONFIG.SHEET_NAME`:**

**Line 418:**
```javascript
// BEFORE:
const historySheet = getOrCreateSheet(CONFIG.HISTORY_SHEET_NAME);

// AFTER:
const historySheet = getOrCreateSheet(CONFIG.SHEET_NAME);
```

**Line 766:**
```javascript
// BEFORE:
const historySheet = getOrCreateSheet(CONFIG.HISTORY_SHEET_NAME);

// AFTER:
const historySheet = getOrCreateSheet(CONFIG.SHEET_NAME);
```

**Line 808:**
```javascript
// BEFORE:
} else if (sheetName === CONFIG.HISTORY_SHEET_NAME) {
  sheet.appendRow(['Request ID', 'Timestamp', 'Action', 'Actor', 'Note']);
}

// AFTER:
} else if (sheetName === CONFIG.SHEET_NAME) {
  // Payment_Request_History sheet - will be created manually by user
  // Header row should already exist
}
```

---

## ✅ 4. New Functions Added (Lines 872-1010)

### **Function 1: handleGetSuppliers()**

**Purpose:** Load all suppliers from "Nhà cung cấp" sheet, Column C

**Features:**
- ✅ Opens spreadsheet by ID
- ✅ Reads Column C (Vendor_Full_Name)
- ✅ Filters empty rows
- ✅ Removes duplicates
- ✅ Sorts alphabetically
- ✅ Returns array of supplier names

**Example Response:**
```json
{
  "success": true,
  "message": "Suppliers retrieved successfully",
  "suppliers": [
    "CÔNG TY ABC",
    "CÔNG TY XYZ",
    "NHÀ CUNG CẤP 123"
  ],
  "count": 3
}
```

**Code:**
```javascript
function handleGetSuppliers(data) {
  try {
    Logger.log('[Payment Request] Getting suppliers from "Nhà cung cấp" sheet');
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const suppliersSheet = ss.getSheetByName(CONFIG.SUPPLIERS_SHEET_NAME);
    
    if (!suppliersSheet) {
      Logger.log('[Payment Request] Sheet "Nhà cung cấp" not found');
      return createResponse(false, 'Sheet "Nhà cung cấp" not found');
    }
    
    const lastRow = suppliersSheet.getLastRow();
    if (lastRow < 2) {
      Logger.log('[Payment Request] No suppliers found');
      return createResponse(true, 'No suppliers found', { suppliers: [], count: 0 });
    }
    
    // Get Column C (Vendor_Full_Name) - index 3
    const vendorNames = suppliersSheet.getRange(2, 3, lastRow - 1, 1).getValues();
    
    // Filter, clean, sort
    const suppliers = vendorNames
      .map(row => row[0])
      .filter(name => name && name.toString().trim() !== '')
      .map(name => name.toString().trim())
      .sort();
    
    const uniqueSuppliers = [...new Set(suppliers)];
    
    Logger.log('[Payment Request] Found ' + uniqueSuppliers.length + ' suppliers');
    
    return createResponse(true, 'Suppliers retrieved successfully', {
      suppliers: uniqueSuppliers,
      count: uniqueSuppliers.length
    });
    
  } catch (error) {
    Logger.log('[Payment Request] Error getting suppliers: ' + error.message);
    return createResponse(false, 'Error: ' + error.message);
  }
}
```

---

### **Function 2: handleAddSupplier()**

**Purpose:** Add new supplier to "Nhà cung cấp" sheet

**Features:**
- ✅ Validates supplier name (required)
- ✅ Checks for duplicates
- ✅ Auto-generates supplier ID (VD###)
- ✅ Creates full 25-column row
- ✅ Matches existing sheet structure

**Example Request:**
```json
{
  "action": "addSupplier",
  "name": "CÔNG TY MỚI",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "phone": "0901234567",
  "email": "contact@congty.com",
  "taxCode": "0123456789",
  "companyType": "Supplier"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Supplier added successfully",
  "supplierId": "VD050",
  "name": "CÔNG TY MỚI"
}
```

**Row Structure (25 columns):**
```javascript
const newRow = [
  newId,                           // A: Name (ID) - VD###
  name.substring(0, 50),           // B: Vendor (short name)
  name,                            // C: Vendor_Full_Name ← MAIN FIELD
  '',                              // D: Công ty mua hàng
  '',                              // E: QBO_Code
  companyType || 'Others',         // F: Vendor_Type
  taxCode || '',                   // G: Tax_ID
  address || '',                   // H: Address
  '',                              // I: QB_ID
  '',                              // J: FCT
  'VND',                           // K: Payment_Currency
  '',                              // L: Quoc_tich
  '',                              // M: Khong_cu_tru
  '',                              // N: Loai_giay_to
  '',                              // O: CMND/CCCD/Ho_Chieu
  '',                              // P: Ngay_cap
  '',                              // Q: Noi_cap
  phone || '',                     // R: So_dien_thoai_lien_he
  address || '',                   // S: Dia_chi_lien_he
  email || '',                     // T: Email_lien_he
  '',                              // U: Gioi_tinh
  '',                              // V: Ngay_sinh
  '',                              // W: Loan
  '',                              // X: Freelancer_Job_Name
  'Yes'                            // Y: Active
];
```

**Code:**
```javascript
function handleAddSupplier(data) {
  try {
    const { name, address, phone, email, taxCode, companyType } = data;
    
    Logger.log('[Payment Request] Adding new supplier: ' + name);
    
    // Validate
    if (!name || name.trim() === '') {
      return createResponse(false, 'Supplier name is required');
    }
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const suppliersSheet = ss.getSheetByName(CONFIG.SUPPLIERS_SHEET_NAME);
    
    if (!suppliersSheet) {
      return createResponse(false, 'Sheet "Nhà cung cấp" not found');
    }
    
    // Check duplicates
    const lastRow = suppliersSheet.getLastRow();
    if (lastRow > 1) {
      const existingNames = suppliersSheet.getRange(2, 3, lastRow - 1, 1).getValues();
      const isDuplicate = existingNames.some(row => 
        row[0] && row[0].toString().trim().toLowerCase() === name.trim().toLowerCase()
      );
      
      if (isDuplicate) {
        return createResponse(false, 'Supplier "' + name + '" already exists');
      }
    }
    
    // Generate ID
    const newId = 'VD' + String(lastRow).padStart(3, '0');
    
    // Create full row (25 columns)
    const newRow = [ /* ... as shown above ... */ ];
    
    // Append
    suppliersSheet.appendRow(newRow);
    
    Logger.log('[Payment Request] Successfully added: ' + name + ' with ID: ' + newId);
    
    return createResponse(true, 'Supplier added successfully', {
      supplierId: newId,
      name: name
    });
    
  } catch (error) {
    Logger.log('[Payment Request] Error adding supplier: ' + error.message);
    return createResponse(false, 'Error: ' + error.message);
  }
}
```

---

## 📊 Summary of Changes

| Change | Type | Impact |
|--------|------|--------|
| Added `SPREADSHEET_ID` | Config | Points to TLCG_Master Data |
| Changed `SHEET_NAME` | Config | Now uses `Payment_Request_History` |
| Added `SUPPLIERS_SHEET_NAME` | Config | References existing "Nhà cung cấp" |
| Removed `HISTORY_SHEET_NAME` | Config | Simplified to single sheet |
| Added `submitPaymentRequest` | Action | Frontend compatibility |
| Added `getRecentPaymentRequests` | Action | Frontend compatibility |
| Added `getSuppliers` | Action | Load suppliers from sheet |
| Added `addSupplier` | Action | Add new suppliers |
| Added `handleGetSuppliers()` | Function | Supplier loading logic |
| Added `handleAddSupplier()` | Function | Supplier creation logic |
| Updated sheet references | Multiple | All now use `CONFIG.SHEET_NAME` |

---

## 🎯 Key Benefits

### **1. Centralized Data Storage**
- ✅ All data in one spreadsheet (TLCG_Master Data)
- ✅ Easy to manage and backup
- ✅ Consistent with existing workflow

### **2. Reusable Supplier Data**
- ✅ Shares supplier list with other workflows
- ✅ No duplicate data entry
- ✅ Single source of truth

### **3. Flexible Sheet Naming**
- ✅ User can create sheet manually
- ✅ Clear, descriptive name: `Payment_Request_History`
- ✅ Easy to find and identify

### **4. Enhanced Functionality**
- ✅ Load suppliers dynamically
- ✅ Add new suppliers from frontend
- ✅ Duplicate checking
- ✅ Auto-generate IDs

---

## 🚀 Next Steps

1. **Create the Sheet:**
   - Follow `PAYMENT_REQUEST_SHEET_SETUP_GUIDE.md`
   - Create `Payment_Request_History` sheet
   - Add 35 column headers

2. **Deploy Backend:**
   - Copy updated `PAYMENT_REQUEST_BACKEND.gs` to Google Apps Script
   - Deploy as Web App
   - Test with `testSheetAccess()` and `testGetSuppliers()`

3. **Update Vercel:**
   - Set `PAYMENT_REQUEST_BACKEND_URL` environment variable
   - Deploy changes

4. **Test End-to-End:**
   - Load `de_nghi_thanh_toan.html`
   - Verify suppliers load
   - Submit test request
   - Check sheet for new row

---

**All changes committed and pushed to GitHub!** ✅
