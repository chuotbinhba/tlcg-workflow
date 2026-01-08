# 📊 Payment Request Data Flow - Detailed Explanation

## Question 1: Where do you get the Vendor/Supplier information from? 🏢

### **Current Implementation** ✅

The vendor/supplier information comes from **two sources**:

---

### **Source 1: Embedded JSON Data** (Read-only list)

The initial list of suppliers is embedded in the HTML file as **base64-encoded JSON data**.

**Location:** `de_nghi_thanh_toan.html` line 1789

```javascript
const data = (function(b64){
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return JSON.parse(new TextDecoder('utf-8').decode(bytes));
})("eyJmb3JtX3RpdGxlIjoi...[base64 string]...");
```

**Decoded JSON Structure:**
```json
{
  "form_title": "Đề nghị mua hàng",
  "voucher_types": [...],
  "company_names": [...],
  "employee_names": [...],
  "approver_names": [...],
  "suppliers": [
    "Supplier A",
    "Supplier B",
    "Supplier C"
  ]
}
```

**How it's used:**
```javascript
// Initialize suppliers array from embedded data
let suppliers = [...data.supplier_names || []];

// Populate dropdown
function populateSupplierDropdown() {
    const dropdown = document.getElementById('supplier-dropdown');
    dropdown.innerHTML = '<option value="">-- Chọn nhà cung cấp --</option>';
    
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier;
        option.textContent = supplier;
        dropdown.appendChild(option);
    });
}
```

---

### **Source 2: "Tạo mới" (Create New) Modal** (Dynamic addition)

Users can add new suppliers on-the-fly using the modal popup.

**UI Location:** Step 2 → Supplier field → "Tạo mới" button

**Modal Form Fields:**
- Tên nhà cung cấp (Supplier Name) - **Required**
- Địa chỉ (Address)
- Số điện thoại (Phone)
- Email
- Mã số thuế (Tax Code)

**Function Flow:**
```javascript
// 1. User clicks "Tạo mới" button
openNewSupplierModal()
  ↓
// 2. Modal displays with empty form
document.getElementById('new-supplier-modal').style.display = 'flex';
  ↓
// 3. User fills in supplier details
// 4. User clicks "Thêm nhà cung cấp"
addNewSupplier()
  ↓
// 5. Validate supplier name
if (!name) {
    alert('Tên nhà cung cấp là bắt buộc.');
    return;
}
  ↓
// 6. Check for duplicates
if (suppliers.includes(name)) {
    alert('Nhà cung cấp này đã tồn tại.');
    return;
}
  ↓
// 7. Add to local array (in-memory only)
suppliers.push(name);
  ↓
// 8. Refresh dropdown
populateSupplierDropdown();
  ↓
// 9. Auto-select new supplier
document.getElementById('supplier-dropdown').value = name;
  ↓
// 10. Close modal
closeNewSupplierModal();
```

**⚠️ IMPORTANT:** Currently, new suppliers are **NOT saved to database**. They only exist in the current session (in-memory array).

---

## Question 2: How to store the request? 💾

### **Current Implementation** ❌ (Not fully implemented)

The form has a `sendForApproval()` function, but it's **partially implemented**:

**Function Location:** Line ~2900+

```javascript
async function sendForApproval() {
    // 1. Collect form data
    const formData = {
        company: document.getElementById('company').value,
        voucherNumber: document.getElementById('voucher-number').value,
        employee: document.getElementById('employee').value,
        // ... all other fields
        productItems: productItems,
        paymentPhases: paymentPhases,
        signatures: {
            requester: requesterSignature,
            budget: budgetSignature,
            supplier: supplierSignature,
            // ... other signatures
        }
    };
    
    // 2. Send to backend via Vercel proxy
    const response = await fetch(VERCEL_PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'submitPaymentRequest',
            data: formData
        })
    });
    
    // 3. Handle response
    const result = await response.json();
    if (result.success) {
        alert('✅ Đề nghị đã được gửi thành công!');
    } else {
        alert('❌ Lỗi: ' + result.message);
    }
}
```

---

## **Recommended Implementation** ✅

### **Architecture Overview**

```
┌─────────────────┐
│  Frontend Form  │
│ (HTML/JS)       │
└────────┬────────┘
         │ POST request
         │ (FormData or JSON)
         ↓
┌─────────────────┐
│ Vercel Proxy    │
│ (/api/voucher)  │
└────────┬────────┘
         │ Routes by action
         │
         ↓
┌─────────────────────────────────┐
│ Google Apps Script Backend      │
│ (PAYMENT_REQUEST_BACKEND.gs)    │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ Google Sheets                   │
│ - PaymentRequestHistory         │
│ - Suppliers (Master Data)       │
└─────────────────────────────────┘
```

---

### **Step-by-Step Implementation Guide**

#### **1. Store Suppliers in Google Sheets** 📊

**Sheet Name:** `Suppliers`

**Columns:**
| Column | Description | Type |
|--------|-------------|------|
| A | Supplier ID | Auto-increment |
| B | Supplier Name | Text (Unique) |
| C | Address | Text |
| D | Phone | Text |
| E | Email | Email |
| F | Tax Code | Text |
| G | Created Date | Date |
| H | Created By | Email |
| I | Status | Active/Inactive |

**Backend Function (PAYMENT_REQUEST_BACKEND.gs):**

```javascript
/**
 * Add new supplier to master data
 */
function handleAddSupplier(requestBody) {
  try {
    const { name, address, phone, email, taxCode } = requestBody;
    
    // Validate
    if (!name) {
      return createResponse(false, 'Supplier name is required');
    }
    
    // Open Suppliers sheet
    const ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
    const suppliersSheet = ss.getSheetByName('Suppliers');
    
    // Check for duplicates
    const existingSuppliers = suppliersSheet.getRange(2, 2, suppliersSheet.getLastRow() - 1, 1).getValues();
    const isDuplicate = existingSuppliers.some(row => row[0] === name);
    
    if (isDuplicate) {
      return createResponse(false, 'Supplier already exists');
    }
    
    // Generate ID
    const lastRow = suppliersSheet.getLastRow();
    const supplierId = 'SUP' + String(lastRow).padStart(5, '0');
    
    // Add supplier
    suppliersSheet.appendRow([
      supplierId,
      name,
      address || '',
      phone || '',
      email || '',
      taxCode || '',
      new Date(),
      Session.getActiveUser().getEmail(),
      'Active'
    ]);
    
    return createResponse(true, 'Supplier added successfully', {
      supplierId: supplierId,
      name: name
    });
    
  } catch (error) {
    Logger.log('Error adding supplier: ' + error);
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Get all active suppliers
 */
function handleGetSuppliers(requestBody) {
  try {
    const ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
    const suppliersSheet = ss.getSheetByName('Suppliers');
    
    const data = suppliersSheet.getRange(2, 1, suppliersSheet.getLastRow() - 1, 9).getValues();
    
    const suppliers = data
      .filter(row => row[8] === 'Active') // Status column
      .map(row => ({
        id: row[0],
        name: row[1],
        address: row[2],
        phone: row[3],
        email: row[4],
        taxCode: row[5]
      }));
    
    return createResponse(true, 'Suppliers retrieved', { suppliers: suppliers });
    
  } catch (error) {
    Logger.log('Error getting suppliers: ' + error);
    return createResponse(false, 'Error: ' + error.message);
  }
}
```

---

#### **2. Store Payment Requests in Google Sheets** 📝

**Sheet Name:** `PaymentRequestHistory`

**Columns:**
| Column | Description |
|--------|-------------|
| A | Request ID |
| B | Request Number (PR-2025-001) |
| C | Company |
| D | Request Date |
| E | Requester Name |
| F | Department |
| G | Purchase Type |
| H | PR Request No |
| I | Purpose & Reason |
| J | Recipient |
| K | Supplier |
| L | Total Amount |
| M | Currency |
| N | Payment Type |
| O | PO Number |
| P | Status (Pending/Approved/Rejected) |
| Q | Budget Approver |
| R | Budget Approval Status |
| S | Supplier Approver |
| T | Supplier Approval Status |
| U | Final Approver |
| V | Final Approval Status |
| W | Product Items (JSON) |
| X | Payment Phases (JSON) |
| Y | Attachments (JSON) |
| Z | Signatures (JSON) |
| AA | Created Date |
| AB | Last Modified Date |
| AC | Notes/Comments |

**Backend Function:**

```javascript
/**
 * Submit payment request
 */
function handleSubmitPaymentRequest(requestBody) {
  try {
    const {
      company,
      voucherNumber,
      voucherDate,
      employee,
      department,
      purchaseType,
      prRequestNo,
      purpose,
      recipient,
      supplier,
      totalAmount,
      currency,
      paymentType,
      poNumber,
      productItems,
      paymentPhases,
      attachments,
      signatures
    } = requestBody;
    
    // Validate required fields
    if (!company || !employee || !supplier) {
      return createResponse(false, 'Missing required fields');
    }
    
    // Open sheet
    const ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
    const historySheet = ss.getSheetByName('PaymentRequestHistory');
    
    // Generate request ID
    const lastRow = historySheet.getLastRow();
    const requestId = 'PR' + String(lastRow).padStart(6, '0');
    
    // Prepare data row
    const rowData = [
      requestId,                          // A: Request ID
      voucherNumber,                      // B: Request Number
      company,                            // C: Company
      voucherDate,                        // D: Request Date
      employee,                           // E: Requester
      department,                         // F: Department
      purchaseType,                       // G: Purchase Type
      prRequestNo,                        // H: PR Request No
      purpose,                            // I: Purpose
      recipient,                          // J: Recipient
      supplier,                           // K: Supplier
      totalAmount,                        // L: Total Amount
      currency,                           // M: Currency
      paymentType,                        // N: Payment Type
      poNumber || '',                     // O: PO Number
      'Pending',                          // P: Status
      requestBody.budgetApprover || '',   // Q: Budget Approver
      'Pending',                          // R: Budget Status
      requestBody.supplierApprover || '', // S: Supplier Approver
      'Pending',                          // T: Supplier Status
      requestBody.finalApprover || '',    // U: Final Approver
      'Pending',                          // V: Final Status
      JSON.stringify(productItems),       // W: Product Items
      JSON.stringify(paymentPhases),      // X: Payment Phases
      JSON.stringify(attachments),        // Y: Attachments
      JSON.stringify(signatures),         // Z: Signatures
      new Date(),                         // AA: Created Date
      new Date(),                         // AB: Modified Date
      ''                                  // AC: Notes
    ];
    
    // Append to sheet
    historySheet.appendRow(rowData);
    
    // Send approval emails
    sendApprovalEmails_(requestId, requestBody);
    
    return createResponse(true, 'Payment request submitted successfully', {
      requestId: requestId,
      requestNumber: voucherNumber
    });
    
  } catch (error) {
    Logger.log('Error submitting payment request: ' + error);
    return createResponse(false, 'Error: ' + error.message);
  }
}
```

---

#### **3. Frontend Integration** 🔗

**Update `addNewSupplier()` function:**

```javascript
async function addNewSupplier() {
    const name = document.getElementById('new-supplier-name').value.trim();
    const address = document.getElementById('new-supplier-address').value.trim();
    const phone = document.getElementById('new-supplier-phone').value.trim();
    const email = document.getElementById('new-supplier-email').value.trim();
    const taxCode = document.getElementById('new-supplier-tax-code').value.trim();

    if (!name) {
        alert('Tên nhà cung cấp là bắt buộc.');
        return;
    }

    try {
        // Show loading
        const addButton = event.target;
        addButton.disabled = true;
        addButton.textContent = 'Đang thêm...';
        
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
                taxCode: taxCode
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Add to local array
            suppliers.push(name);
            
            // Refresh dropdown
            populateSupplierDropdown();
            
            // Auto-select new supplier
            document.getElementById('supplier-dropdown').value = name;
            
            // Close modal
            closeNewSupplierModal();
            
            // Show success message
            alert('✅ Nhà cung cấp đã được thêm thành công!');
        } else {
            alert('❌ Lỗi: ' + result.message);
        }
        
    } catch (error) {
        console.error('Error adding supplier:', error);
        alert('❌ Lỗi khi thêm nhà cung cấp: ' + error.message);
    } finally {
        // Reset button
        addButton.disabled = false;
        addButton.textContent = 'Thêm nhà cung cấp';
    }
}
```

**Update `sendForApproval()` function:**

```javascript
async function sendForApproval() {
    try {
        // Show loading
        const sendBtn = document.getElementById('send-approval-btn');
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<svg>...</svg> Đang gửi...';
        
        // Collect all form data
        const formData = {
            action: 'submitPaymentRequest',
            company: document.getElementById('company').value,
            voucherNumber: document.getElementById('voucher-number').value,
            voucherDate: document.getElementById('voucher-date').value,
            employee: document.getElementById('employee').value,
            department: document.getElementById('department').value,
            purchaseType: document.getElementById('purchase-voucher-type').value,
            prRequestNo: document.getElementById('pr-request-no').value,
            purpose: document.getElementById('purchase-purpose-reason').value,
            recipient: document.getElementById('recipient-name').value,
            supplier: document.getElementById('supplier-dropdown').value,
            totalAmount: calculateTotal(),
            currency: document.getElementById('currency').value,
            paymentType: document.getElementById('payment-type').value,
            poNumber: document.getElementById('po-request-no').value,
            productItems: productItems,
            paymentPhases: paymentPhases,
            attachments: collectAttachments(),
            signatures: collectSignatures(),
            budgetApprover: document.getElementById('budget-approver').value,
            supplierApprover: document.getElementById('supplier-approver').value,
            finalApprover: document.getElementById('final-approver').value
        };
        
        // Validate
        if (!formData.company || !formData.employee || !formData.supplier) {
            alert('❌ Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        
        // Send to backend
        const response = await fetch(VERCEL_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Đề nghị thanh toán đã được gửi thành công!\n\nMã số: ' + result.data.requestId);
            
            // Optionally: redirect or clear form
            // window.location.href = 'index.html';
        } else {
            alert('❌ Lỗi: ' + result.message);
        }
        
    } catch (error) {
        console.error('Error submitting request:', error);
        alert('❌ Lỗi khi gửi đề nghị: ' + error.message);
    } finally {
        // Reset button
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<svg>...</svg> Gửi phê duyệt';
    }
}
```

---

## **Summary** 📋

### **Current State:**
1. ❌ Suppliers are loaded from embedded JSON (read-only)
2. ⚠️ "Tạo mới" adds suppliers to memory only (not persisted)
3. ⚠️ Payment requests are not stored to database

### **Recommended Solution:**
1. ✅ Create `Suppliers` sheet in Google Sheets
2. ✅ Create `PaymentRequestHistory` sheet in Google Sheets
3. ✅ Implement backend functions in `PAYMENT_REQUEST_BACKEND.gs`
4. ✅ Update frontend to call backend APIs
5. ✅ Update Vercel proxy to route new actions

### **Next Steps:**
1. Deploy `PAYMENT_REQUEST_BACKEND.gs` to Google Apps Script
2. Create Google Sheets with proper structure
3. Update frontend integration
4. Test end-to-end flow

---

**Want me to help implement any of these parts?** 🚀

I can:
- Write the complete Google Apps Script backend
- Create the sheet structure
- Update the frontend integration
- Test the full flow

Let me know what you need! 😊
