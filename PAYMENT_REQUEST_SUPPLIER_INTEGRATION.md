# 🔗 Payment Request - Supplier Integration Guide

## 📊 Using Existing Google Sheet

**Sheet URL:** https://docs.google.com/spreadsheets/d/1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g/edit

**Sheet Name:** `Nhà cung cấp` (Suppliers)

**Key Column:** Column C - `Vendor_Full_Name`

---

## 📋 Current Sheet Structure

From the Google Sheet, I can see the structure:

| Column | Header | Description |
|--------|--------|-------------|
| A | Name | Internal ID/Code |
| B | Vendor | Short name |
| C | **Vendor_Full_Name** | **Full supplier name (USE THIS)** |
| D | Công ty mua hàng | Purchasing company |
| E | QBO_Code | QuickBooks code |
| F | Vendor_Type | Type (Individual/Company) |
| G | Tax_ID | Tax identification number |
| H | Address | Full address |
| ... | ... | Additional fields |

---

## 🎯 Implementation Plan

### **Step 1: Update Backend to Read from "Nhà cung cấp" Sheet**

**File:** `PAYMENT_REQUEST_BACKEND.gs`

```javascript
/**
 * Get all suppliers from "Nhà cung cấp" sheet
 */
function handleGetSuppliers(requestBody) {
  try {
    const SPREADSHEET_ID = '1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g';
    const SHEET_NAME = 'Nhà cung cấp';
    
    // Open the sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const suppliersSheet = ss.getSheetByName(SHEET_NAME);
    
    if (!suppliersSheet) {
      return createResponse(false, 'Sheet "Nhà cung cấp" not found');
    }
    
    // Get all data (starting from row 2 to skip header)
    const lastRow = suppliersSheet.getLastRow();
    if (lastRow < 2) {
      return createResponse(true, 'No suppliers found', { suppliers: [] });
    }
    
    // Get Column C (Vendor_Full_Name) - index 3
    const vendorNames = suppliersSheet.getRange(2, 3, lastRow - 1, 1).getValues();
    
    // Filter out empty rows and create supplier list
    const suppliers = vendorNames
      .map(row => row[0])
      .filter(name => name && name.toString().trim() !== '')
      .map(name => name.toString().trim())
      .sort(); // Sort alphabetically
    
    // Remove duplicates
    const uniqueSuppliers = [...new Set(suppliers)];
    
    console.log('✅ Found ' + uniqueSuppliers.length + ' suppliers');
    
    return createResponse(true, 'Suppliers retrieved successfully', {
      suppliers: uniqueSuppliers,
      count: uniqueSuppliers.length
    });
    
  } catch (error) {
    console.error('❌ Error getting suppliers: ' + error);
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Add new supplier to "Nhà cung cấp" sheet
 */
function handleAddSupplier(requestBody) {
  try {
    const { name, address, phone, email, taxCode, companyType } = requestBody;
    
    // Validate required field
    if (!name || name.trim() === '') {
      return createResponse(false, 'Supplier name is required');
    }
    
    const SPREADSHEET_ID = '1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g';
    const SHEET_NAME = 'Nhà cung cấp';
    
    // Open the sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const suppliersSheet = ss.getSheetByName(SHEET_NAME);
    
    if (!suppliersSheet) {
      return createResponse(false, 'Sheet "Nhà cung cấp" not found');
    }
    
    // Check for duplicates in Column C
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
    
    // Generate unique ID for Column A
    const newId = 'VD' + String(lastRow).padStart(3, '0');
    
    // Prepare row data matching the sheet structure
    const newRow = [
      newId,                           // A: Name (ID)
      name.substring(0, 50),           // B: Vendor (short name)
      name,                            // C: Vendor_Full_Name
      '',                              // D: Công ty mua hàng (empty for now)
      '',                              // E: QBO_Code (empty for now)
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
    
    // Append the new row
    suppliersSheet.appendRow(newRow);
    
    console.log('✅ Added new supplier: ' + name);
    
    return createResponse(true, 'Supplier added successfully', {
      supplierId: newId,
      name: name
    });
    
  } catch (error) {
    console.error('❌ Error adding supplier: ' + error);
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Helper function to create standardized response
 */
function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message
  };
  
  if (data) {
    response.data = data;
  }
  
  return response;
}
```

---

### **Step 2: Update Frontend to Load Suppliers from Backend**

**File:** `de_nghi_thanh_toan.html`

**Replace the initialization code:**

```javascript
// ==================== SUPPLIER MANAGEMENT ====================

let suppliers = []; // Will be loaded from backend

/**
 * Load suppliers from backend (Google Sheets)
 */
async function loadSuppliersFromBackend() {
    try {
        console.log('📥 Loading suppliers from Google Sheets...');
        
        const response = await fetch(VERCEL_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'getSuppliers'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            suppliers = result.data.suppliers || [];
            console.log('✅ Loaded ' + suppliers.length + ' suppliers');
            
            // Populate dropdown
            populateSupplierDropdown();
        } else {
            console.error('❌ Failed to load suppliers:', result.message);
            
            // Fallback to empty array
            suppliers = [];
            populateSupplierDropdown();
            
            // Show error toast
            showToast('Không thể tải danh sách nhà cung cấp: ' + result.message, 'error');
        }
        
    } catch (error) {
        console.error('❌ Error loading suppliers:', error);
        
        // Fallback to empty array
        suppliers = [];
        populateSupplierDropdown();
        
        showToast('Lỗi khi tải danh sách nhà cung cấp', 'error');
    }
}

/**
 * Populate supplier dropdown
 */
function populateSupplierDropdown() {
    const dropdown = document.getElementById('supplier-dropdown');
    
    // Clear existing options
    dropdown.innerHTML = '<option value="">-- Chọn nhà cung cấp --</option>';
    
    // Add suppliers
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier;
        option.textContent = supplier;
        dropdown.appendChild(option);
    });
    
    console.log('✅ Populated supplier dropdown with ' + suppliers.length + ' options');
}

/**
 * Add new supplier (updated to save to backend)
 */
async function addNewSupplier() {
    const name = document.getElementById('new-supplier-name').value.trim();
    const address = document.getElementById('new-supplier-address').value.trim();
    const phone = document.getElementById('new-supplier-phone').value.trim();
    const email = document.getElementById('new-supplier-email').value.trim();
    const taxCode = document.getElementById('new-supplier-tax-code').value.trim();

    // Validate
    if (!name) {
        alert('❌ Tên nhà cung cấp là bắt buộc.');
        return;
    }

    try {
        // Show loading
        const addButton = document.querySelector('#new-supplier-modal .btn-primary');
        const originalText = addButton.textContent;
        addButton.disabled = true;
        addButton.textContent = '⏳ Đang thêm...';
        
        console.log('📤 Adding supplier to backend:', name);
        
        // Send to backend
        const response = await fetch(VERCEL_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'addSupplier',
                name: name,
                address: address,
                phone: phone,
                email: email,
                taxCode: taxCode,
                companyType: 'Others' // Default type
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Supplier added:', result.data);
            
            // Reload suppliers from backend
            await loadSuppliersFromBackend();
            
            // Auto-select new supplier
            document.getElementById('supplier-dropdown').value = name;
            
            // Close modal
            closeNewSupplierModal();
            
            // Show success message
            showToast('✅ Nhà cung cấp "' + name + '" đã được thêm thành công!', 'success');
        } else {
            console.error('❌ Failed to add supplier:', result.message);
            alert('❌ Lỗi: ' + result.message);
        }
        
    } catch (error) {
        console.error('❌ Error adding supplier:', error);
        alert('❌ Lỗi khi thêm nhà cung cấp: ' + error.message);
    } finally {
        // Reset button
        const addButton = document.querySelector('#new-supplier-modal .btn-primary');
        addButton.disabled = false;
        addButton.textContent = 'Thêm nhà cung cấp';
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="font-size: 1.25rem;">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </div>
            <div>${message}</div>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}
```

---

### **Step 3: Update DOMContentLoaded to Load Suppliers**

**Find this section in `de_nghi_thanh_toan.html`:**

```javascript
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setCurrentDate();
    generateVoucherNumber();
    renderProductTable();
    renderPaymentTable();
    
    // ... other initializations ...
    
    renderApprovalHistory();
    
    // Load recent requests
    setTimeout(() => {
        loadRecentRequests();
        startAutoRefresh();
    }, 1000);
});
```

**Add supplier loading:**

```javascript
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setCurrentDate();
    generateVoucherNumber();
    renderProductTable();
    renderPaymentTable();
    
    // ... other initializations ...
    
    renderApprovalHistory();
    
    // 🆕 Load suppliers from Google Sheets
    loadSuppliersFromBackend();
    
    // Load recent requests
    setTimeout(() => {
        loadRecentRequests();
        startAutoRefresh();
    }, 1000);
});
```

---

### **Step 4: Update Vercel Proxy to Route Supplier Actions**

**File:** `api/voucher.js`

**Add routing for supplier actions:**

```javascript
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Parse request body
    const body = req.method === 'POST' ? req.body : {};
    const action = body.action || req.query.action;

    console.log('📥 Vercel Proxy received action:', action);

    // Route to appropriate backend
    let backendUrl;
    
    // Payment Request actions
    if (action === 'submitPaymentRequest' || 
        action === 'getPaymentRequestHistory' ||
        action === 'approvePaymentRequest' ||
        action === 'rejectPaymentRequest' ||
        action === 'getSuppliers' ||           // 🆕 Supplier actions
        action === 'addSupplier') {            // 🆕 Supplier actions
      backendUrl = process.env.PAYMENT_REQUEST_BACKEND_URL;
    }
    // Voucher actions
    else {
      backendUrl = process.env.VOUCHER_BACKEND_URL;
    }

    if (!backendUrl) {
      return res.status(500).json({
        success: false,
        message: 'Backend URL not configured for action: ' + action
      });
    }

    // Forward request to Google Apps Script
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    
    console.log('✅ Backend response:', result.success ? 'Success' : 'Failed');
    
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Vercel Proxy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Proxy error: ' + error.message
    });
  }
}
```

---

### **Step 5: Update PAYMENT_REQUEST_BACKEND.gs Main Handler**

**Add routing for supplier actions:**

```javascript
/**
 * Main entry point for POST requests
 */
function doPost(e) {
  try {
    // Parse request body
    let requestBody;
    
    if (e.postData && e.postData.contents) {
      requestBody = JSON.parse(e.postData.contents);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'No request body provided'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = requestBody.action;
    console.log('📥 Received action: ' + action);
    
    let result;
    
    // Route to appropriate handler
    switch (action) {
      case 'submitPaymentRequest':
        result = handleSubmitPaymentRequest(requestBody);
        break;
        
      case 'getPaymentRequestHistory':
        result = handleGetPaymentRequestHistory(requestBody);
        break;
        
      case 'approvePaymentRequest':
        result = handleApprovePaymentRequest(requestBody);
        break;
        
      case 'rejectPaymentRequest':
        result = handleRejectPaymentRequest(requestBody);
        break;
        
      case 'getSuppliers':              // 🆕 Get suppliers
        result = handleGetSuppliers(requestBody);
        break;
        
      case 'addSupplier':               // 🆕 Add supplier
        result = handleAddSupplier(requestBody);
        break;
        
      default:
        result = createResponse(false, 'Unknown action: ' + action);
    }
    
    console.log('✅ Action completed: ' + action);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('❌ Error in doPost: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## 🎯 Summary of Changes

### **What's Using the Existing Sheet:**

1. ✅ **Supplier List**: Loaded from `Nhà cung cấp` sheet, Column C
2. ✅ **New Suppliers**: Added to `Nhà cung cấp` sheet
3. ✅ **No Duplication**: Checks existing suppliers before adding
4. ✅ **Real-time Sync**: Frontend reloads after adding new supplier

### **Data Flow:**

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (de_nghi_thanh_toan.html)                     │
│  - Load suppliers on page load                          │
│  - Display in dropdown                                  │
│  - Add new supplier via modal                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ POST: action=getSuppliers
                 │ POST: action=addSupplier
                 ↓
┌─────────────────────────────────────────────────────────┐
│  Vercel Proxy (/api/voucher.js)                         │
│  - Routes to PAYMENT_REQUEST_BACKEND_URL                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│  Google Apps Script (PAYMENT_REQUEST_BACKEND.gs)        │
│  - handleGetSuppliers()                                 │
│  - handleAddSupplier()                                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│  Google Sheets                                          │
│  Sheet: "Nhà cung cấp"                                  │
│  Column C: "Vendor_Full_Name"                           │
│  - Read existing suppliers                              │
│  - Append new suppliers                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Steps

1. **Update `PAYMENT_REQUEST_BACKEND.gs`**
   - Add `handleGetSuppliers()` function
   - Add `handleAddSupplier()` function
   - Update `doPost()` routing

2. **Deploy to Google Apps Script**
   - Copy updated code
   - Deploy as web app
   - Copy the Web App URL

3. **Update Vercel Environment Variable**
   ```bash
   vercel env add PAYMENT_REQUEST_BACKEND_URL
   # Paste the Web App URL
   ```

4. **Update Frontend**
   - Add `loadSuppliersFromBackend()` function
   - Update `addNewSupplier()` function
   - Update `DOMContentLoaded` event

5. **Test**
   - Load page → suppliers should populate
   - Add new supplier → should save to sheet
   - Refresh page → new supplier should appear

---

## ✅ Benefits

- ✅ **Single Source of Truth**: All suppliers in one Google Sheet
- ✅ **Real-time Updates**: Changes reflect immediately
- ✅ **No Duplication**: Checks before adding
- ✅ **Consistent Data**: Same suppliers across all forms
- ✅ **Easy Management**: Edit directly in Google Sheets if needed

---

**Ready to implement?** Let me know if you want me to:
1. Create the complete backend code file
2. Update the frontend code
3. Help with deployment

Just say the word! 🚀
