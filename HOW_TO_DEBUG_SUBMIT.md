# 🔍 How to Debug: Can't Submit Form

## ✅ What I Just Fixed:
I added **signature validation** to the submit function. Previously, signature wasn't being checked when clicking "Gửi phê duyệt", which could cause silent failures.

---

## 🧪 Step-by-Step Debug Process:

### Step 1: Check Developer Console

1. **Open Developer Console:**
   - Press `F12` (Windows) or `Cmd+Option+I` (Mac)
   - Or Right-click → Inspect → Console tab

2. **Clear the console:**
   - Click the 🚫 clear button
   - Or press `Ctrl+L` / `Cmd+K`

3. **Try to submit the form:**
   - Fill out all required fields
   - Click "Gửi phê duyệt"
   - **Watch the console for any errors**

### Step 2: Check What Error Messages You See

**Copy all error messages** (red text) from the console and tell me:

#### A. Validation Errors (Yellow/Red toasts on screen):
- "Vui lòng điền đầy đủ thông tin bắt buộc"
- "Vui lòng tải lên chữ ký người đề nghị" ← **NEW**
- "Vui lòng nhập ít nhất một dòng chi tiết"
- "Vui lòng điền đầy đủ Nội dung, Số tiền"

#### B. JavaScript Errors (Red in console):
- `Uncaught TypeError: ...`
- `Uncaught ReferenceError: ...`
- `Cannot read property '...' of undefined`

#### C. Network Errors:
- `Failed to fetch`
- `CORS policy`
- `Network request failed`

---

## ✅ Quick Checklist - Verify All Required Fields:

### 1. **Company (Công ty)**
- [ ] Selected from dropdown
- [ ] Not "-- Chọn công ty --"

### 2. **Voucher Type (Loại phiếu)**
- [ ] Selected "Thu" or "Chi"
- [ ] Not "-- Chọn loại phiếu --"

### 3. **Employee (Người đề nghị)**
- [ ] Selected from dropdown
- [ ] Not "-- Chọn nhân viên --"

### 4. **Payee Name (Người nộp/nhận)** - Step 2
- [ ] Filled in text field
- [ ] At least 2 characters

### 5. **Currency (Loại tiền)** - Step 3
- [ ] Selected (VNĐ, USD, or EUR)
- [ ] Not "-- Chọn loại tiền --"

### 6. **Reason (Lý do)** - Step 2
- [ ] Filled in textarea
- [ ] At least 10 characters

### 7. **Signature (Chữ ký người đề nghị)** - Step 2 ⚠️ **REQUIRED**
- [ ] Image uploaded and visible in preview
- [ ] NOT showing "Chưa có chữ ký"

### 8. **Expense Items (Chi tiết chi phí)** - Step 3
- [ ] At least 1 item added
- [ ] Each item has:
  - [ ] Content (Nội dung)
  - [ ] Amount (Số tiền) > 0

### 9. **Approver (Người phê duyệt)** - Step 4
- [ ] Selected from dropdown
- [ ] Not "-- Chọn người phê duyệt --"

---

## 🔧 Quick Test Commands:

**Open Console (F12) and run these commands:**

### Test 1: Check All Fields
```javascript
console.log('=== FIELD CHECK ===');
console.log('Company:', document.getElementById('company').value);
console.log('Voucher Type:', document.getElementById('voucher-type').value);
console.log('Employee:', document.getElementById('employee').value);
console.log('Payee Name:', document.getElementById('payee-name').value);
console.log('Currency:', document.getElementById('currency').value);
console.log('Reason:', document.getElementById('reason').value);
console.log('Approver:', document.getElementById('approver').value);
console.log('Signature:', getSignatureData() ? 'EXISTS ✅' : 'MISSING ❌');
console.log('Expense Items:', expenseItems.length);
```

### Test 2: Check Validation
```javascript
// This will show what's failing
const required = ['company', 'voucher-type', 'employee', 'payee-name', 'currency', 'reason', 'approver'];
required.forEach(field => {
  const el = document.getElementById(field);
  const value = el ? el.value : '';
  console.log(`${field}:`, value || '❌ EMPTY');
});
```

### Test 3: Check Signature
```javascript
const sig = getSignatureData();
if (sig) {
  console.log('✅ Signature exists');
} else {
  console.log('❌ Signature MISSING - Please upload signature!');
}
```

---

## 🐛 Common Issues & Solutions:

### Issue 1: "Nothing happens when I click submit"

**Possible causes:**
- ❌ JavaScript error preventing function execution
- ❌ Button is disabled
- ❌ Validation failing silently

**Solution:**
1. Check console for errors
2. Check if button is disabled (should be enabled)
3. Try the test commands above

### Issue 2: "Error: Thiếu chữ ký" (NEW)

**Cause:** Signature not uploaded

**Solution:**
1. Go to Step 2
2. Click "Tải chữ ký lên"
3. Select an image file (PNG, JPG, GIF)
4. Wait for preview to show
5. Try submitting again

### Issue 3: "Validation errors but don't know which field"

**Solution:**
1. Check console output from Test 2
2. Look for fields showing "❌ EMPTY"
3. Fill in those fields
4. Check for fields with red borders (`.invalid` class)

### Issue 4: "Form submits but shows CORS error"

**Solution:**
- This is a different issue (backend/CORS)
- Report the CORS error separately
- But first ensure all validation passes

---

## 📝 What to Tell Me:

When reporting, please provide:

1. **What happens when you click submit?**
   - Nothing at all?
   - Error message appears?
   - Loading indicator shows then fails?

2. **Console errors (if any):**
   - Copy all red error messages

3. **Field status:**
   - Run Test 1 commands and share output
   - Or manually check the checklist above

4. **Signature status:**
   - Does signature preview show an image?
   - Or does it show "Chưa có chữ ký"?

5. **Button status:**
   - Is the button enabled (can click)?
   - Or is it grayed out (disabled)?

---

## ✅ Expected Behavior:

When you click "Gửi phê duyệt":

1. ✅ Form validates all required fields
2. ✅ If signature missing → Shows error: "Vui lòng tải lên chữ ký người đề nghị"
3. ✅ If other fields missing → Shows error: "Vui lòng điền đầy đủ thông tin bắt buộc"
4. ✅ If validation passes → Shows loading indicator
5. ✅ Makes request to Google Apps Script
6. ✅ Shows success message or error

---

**Status:** Signature validation added. Need debug info from user to identify exact issue.

