# 🔍 Debug Submit Form Error - Fallback to mailto

## ❌ Vấn đề hiện tại:
Form submit đang fallback sang `mailto:` link thay vì gửi email tự động qua Google Apps Script.

**Console log:**
```
Launched external handler for 'mailto:...'
```

Điều này có nghĩa request đến Google Apps Script đang **fail**, và code đang chạy vào **catch block**.

---

## 🔍 Cần kiểm tra:

### 1. Check Console Errors (QUAN TRỌNG)

**Mở Developer Console (F12) và tìm:**
- ❌ CORS errors
- ❌ Network errors (ERR_FAILED, Failed to fetch)
- ❌ Error messages từ catch block
- ❌ Response errors

**Tìm các log messages:**
- `❌ Lỗi khi gửi yêu cầu phê duyệt qua Google Apps Script:`
- `❌ Error details:`
- `❌ HTTP Error:`
- `❌ Failed to parse response:`

### 2. Check Network Tab

1. **Mở Developer Console (F12)**
2. **Click tab "Network"**
3. **Submit form**
4. **Tìm request đến Google Apps Script:**
   - URL: `https://script.google.com/macros/s/.../exec`
   - Method: POST
5. **Click vào request và check:**
   - Status code (200 = OK, 4xx/5xx = error)
   - Request Headers
   - Response Headers (có CORS headers không?)
   - Response Body (có JSON response không?)

### 3. Check Google Apps Script Execution Logs

1. **Mở Google Apps Script:** https://script.google.com
2. **Click "Executions"** (menu trái)
3. **Tìm execution mới nhất** (khi bạn submit form)
4. **Click vào execution**
5. **Xem logs:**
   - ✅ `=== doPost called ===`
   - ✅ `Action: sendApprovalEmail`
   - ✅ `=== ROUTING TO handleSendEmail ===`
   - ❌ Error messages (nếu có)

---

## 🔧 Các nguyên nhân có thể:

### 1. CORS Error (Phổ biến nhất)

**Symptom:**
```
Access to fetch at 'https://script.google.com/macros/s/.../exec' 
from origin 'https://workflow.egg-ventures.com' has been blocked by CORS policy
```

**Fix:**
- ✅ Đảm bảo deployment có "Anyone" access
- ✅ Deploy lại với version mới
- ✅ Clear browser cache

### 2. Request quá lớn (> 6MB limit)

**Symptom:**
- Request fails với error về size
- Files đính kèm quá lớn

**Fix:**
- Reduce file size
- Hoặc compress files

### 3. Invalid response format

**Symptom:**
```
❌ Failed to parse response
Invalid response from server
```

**Fix:**
- Check execution logs trong Apps Script
- Check response format

### 4. Authentication/Permission error

**Symptom:**
- 401/403 errors
- "Authorization required"

**Fix:**
- Check Apps Script permissions
- Re-authorize deployment

---

## ✅ Quick Test:

### Test 1: Direct URL Access

Mở URL này trong browser (thay YOUR_WEB_APP_ID):
```
https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec
```

**Expected:** `Google Apps Script is running!`

### Test 2: Simple POST Test

**Trong Google Apps Script, chạy function này:**
```javascript
function testDoPost() {
  const testPayload = {
    action: 'sendApprovalEmail',
    email: {
      to: 'test@example.com',
      subject: 'Test',
      body: 'Test body'
    },
    voucher: {
      voucherNumber: 'TEST-001'
    }
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload),
      type: 'application/json'
    }
  };
  
  try {
    const result = doPost(mockEvent);
    Logger.log('Result: ' + result.getContent());
    return 'Success';
  } catch (e) {
    Logger.log('Error: ' + e.toString());
    return 'Error: ' + e.toString();
  }
}
```

---

## 📝 Copy Error Messages:

**Khi submit form, copy toàn bộ error messages từ console:**
1. Mở Developer Console (F12)
2. Submit form
3. Copy tất cả messages màu đỏ (errors)
4. Gửi cho IT support

**Hoặc screenshot:**
- Console tab (tất cả errors)
- Network tab (request details)

---

## 🆘 Nếu không thấy error messages:

1. **Clear console:**
   - Click icon Clear (🚫) trong console
   - Hoặc Ctrl+L

2. **Submit form lại**

3. **Ngay lập tức xem console** (trước khi mailto popup xuất hiện)

4. **Copy tất cả messages**

---

**Status:** Need console errors to diagnose


