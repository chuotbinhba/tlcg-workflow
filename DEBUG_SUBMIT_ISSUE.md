# 🔍 Debug: Can't Submit Form Issue

## ❌ Problem:
User cannot submit the form when clicking "Gửi phê duyệt" button.

---

## 🔍 Possible Causes:

### 1. **Missing Signature (MOST LIKELY)**
Signature is required (marked with `*`) but validation might not be checking it in `sendForApproval()`.

**Check:**
- Step 2: Is signature uploaded?
- Signature preview should show an image
- If signature placeholder shows "Chưa có chữ ký", signature is missing

### 2. **Validation Errors**
Form might have validation errors preventing submission.

**Required Fields:**
- ✅ Company (Công ty)
- ✅ Voucher Type (Loại phiếu)
- ✅ Employee (Người đề nghị)
- ✅ Payee Name (Người nộp/nhận) - min 2 characters
- ✅ Currency (Loại tiền)
- ✅ Reason (Lý do) - min 10 characters
- ✅ Approver (Người phê duyệt)
- ✅ Signature (Chữ ký người đề nghị)
- ✅ At least 1 expense item with content and amount

### 3. **Invalid Voucher Number Format**
Voucher number must match pattern: `TL-YYYYMM-####` (e.g., `TL-202512-1234`)

**Current regex:** `/^TL-\d{4}\d{2}-\d{4}$/`

If voucher number doesn't match this format, submission will fail.

### 4. **JavaScript Errors**
JavaScript errors might prevent the function from executing.

---

## ✅ Steps to Debug:

### Step 1: Open Developer Console
1. Press `F12` or `Cmd+Option+I` (Mac)
2. Go to **Console** tab
3. Clear console (`Ctrl+L` or `Cmd+K`)

### Step 2: Try to Submit
1. Fill out the form completely
2. Click "Gửi phê duyệt"
3. **Watch console for errors**

### Step 3: Check for Specific Errors

**Look for these messages:**

#### A. Validation Errors:
```
❌ Validation failed messages
❌ "Vui lòng điền đầy đủ thông tin bắt buộc"
❌ "Vui lòng tải lên chữ ký"
❌ "Vui lòng nhập ít nhất một dòng chi tiết"
❌ "Invalid voucher number format"
```

#### B. JavaScript Errors:
```
❌ Uncaught TypeError: ...
❌ Uncaught ReferenceError: ...
❌ Cannot read property '...' of undefined
```

#### C. Network Errors:
```
❌ Failed to fetch
❌ CORS error
❌ Network request failed
```

---

## 🧪 Debug Commands:

**Run these in the browser console:**

### Check 1: Verify All Required Fields Are Filled
```javascript
// Check required fields
const required = ['company', 'voucher-type', 'employee', 'payee-name', 'currency', 'reason', 'approver'];
required.forEach(field => {
  const el = document.getElementById(field);
  console.log(`${field}:`, el ? el.value : 'NOT FOUND');
});
```

### Check 2: Check Signature
```javascript
// Check if signature exists
const signature = getSignatureData();
console.log('Signature:', signature ? 'EXISTS' : 'MISSING');
```

### Check 3: Check Expense Items
```javascript
// Check expense items
console.log('Expense Items:', expenseItems);
console.log('Item Count:', expenseItems.length);
console.log('Valid Items:', expenseItems.filter(item => item.content && item.amount > 0).length);
```

### Check 4: Check Voucher Number
```javascript
// Check voucher number format
const voucherNum = document.getElementById('voucher-number').value;
console.log('Voucher Number:', voucherNum);
console.log('Format Valid:', voucherNum.match(/^TL-\d{4}\d{2}-\d{4}$/) ? 'YES' : 'NO');
```

### Check 5: Try Manual Validation
```javascript
// Test validation
const approverField = document.getElementById('approver');
if (!approverField.value) {
  console.log('❌ Approver missing');
} else {
  console.log('✅ Approver:', approverField.value);
}

const signature = getSignatureData();
if (!signature) {
  console.log('❌ Signature missing');
} else {
  console.log('✅ Signature exists');
}

if (expenseItems.length === 0) {
  console.log('❌ No expense items');
} else {
  console.log('✅ Expense items:', expenseItems.length);
  const invalid = expenseItems.filter(item => !item.content || item.amount === 0);
  if (invalid.length > 0) {
    console.log('❌ Invalid items:', invalid);
  } else {
    console.log('✅ All items valid');
  }
}
```

### Check 6: Test sendForApproval Function
```javascript
// Check if function exists and can be called
console.log('sendForApproval:', typeof sendForApproval);
// DON'T actually call it, just check if it exists
```

---

## 🔧 Quick Fixes:

### Fix 1: Add Signature Validation to sendForApproval()

If signature validation is missing from `sendForApproval()`, we need to add it:

```javascript
async function sendForApproval() {
    // ... existing validation code ...
    
    // ADD THIS: Validate signature
    const signature = getSignatureData();
    if (!signature) {
        showToast('Vui lòng tải lên chữ ký người đề nghị', 'error', 'Thiếu chữ ký');
        // Scroll to signature field
        document.getElementById('signature-upload').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    // ... rest of function ...
}
```

### Fix 2: Fix Voucher Number Format

If voucher number format is wrong, check `generateVoucherNumber()` function to ensure it generates correct format.

---

## 📝 What to Report:

When reporting the issue, please provide:

1. **Console Errors:** All error messages from console
2. **Validation Status:** Which fields are filled/empty
3. **Signature Status:** Does signature exist?
4. **Expense Items:** How many items, are they valid?
5. **Voucher Number:** What is the current voucher number?
6. **Button Behavior:** Does button do nothing, or show an error message?

---

**Status:** Waiting for debug information from user

