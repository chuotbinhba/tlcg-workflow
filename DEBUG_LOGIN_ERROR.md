# Debug: "Login error. Please check your connection and try again."

## 🔍 Nguyên nhân có thể

Lỗi này xuất hiện khi có exception trong try-catch block của `handleLogin()`. Có thể do:

1. **CORS Error** - Browser chặn request
2. **Network Error** - Không kết nối được đến server
3. **Response parsing error** - Response không phải JSON
4. **Web App URL sai** - URL không đúng hoặc chưa deploy

---

## 🛠️ Cách Debug

### Bước 1: Mở Browser Console

1. **Mở** `tlcgroup-intranet.html` trong browser
2. **Press** F12 (hoặc Cmd+Option+I trên Mac)
3. **Click** tab "Console"
4. **Thử login** lại
5. **Xem logs** trong console

### Bước 2: Kiểm tra Logs

**Bạn sẽ thấy các logs sau:**

```
Sending login request to: [URL]
Request payload: { action: 'login', email: '...', password: '***' }
Response status: [status code]
Response ok: [true/false]
Response text: [response content]
```

**Copy toàn bộ logs** và gửi lại để debug.

---

## 🔧 Common Issues & Fixes

### Issue 1: CORS Error

**Logs sẽ hiện:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Fix:**
1. Kiểm tra Google Apps Script deployment
2. Đảm bảo "Who has access" = "Anyone"
3. Deploy lại Web App

---

### Issue 2: Network Error

**Logs sẽ hiện:**
```
Failed to fetch
NetworkError
```

**Fix:**
1. Kiểm tra internet connection
2. Kiểm tra Web App URL đúng chưa
3. Thử mở Web App URL trực tiếp trong browser

---

### Issue 3: Response không phải JSON

**Logs sẽ hiện:**
```
Failed to parse JSON: ...
Response text: [non-JSON content]
```

**Fix:**
1. Kiểm tra Google Apps Script logs
2. Đảm bảo `createResponse()` function trả về JSON
3. Kiểm tra có lỗi trong Apps Script không

---

### Issue 4: Web App URL chưa set

**Logs sẽ hiện:**
```
⚠️ Web App URL not configured. Using fallback authentication.
```

**Fix:**
1. Kiểm tra `GOOGLE_APPS_SCRIPT_WEB_APP_URL` trong code
2. Đảm bảo đã paste Web App URL từ Google Apps Script
3. Save file và refresh browser

---

## 📋 Checklist Debug

- [ ] Đã mở Browser Console (F12)
- [ ] Đã thử login và xem logs
- [ ] Đã copy logs từ console
- [ ] Đã kiểm tra Web App URL đúng chưa
- [ ] Đã kiểm tra Google Apps Script deployment
- [ ] Đã kiểm tra Apps Script logs

---

## 🧪 Test Web App URL trực tiếp

### Test 1: Mở URL trong browser

1. **Copy** Web App URL từ code
2. **Mở** trong browser
3. **Expected:** Thấy message "Google Apps Script is running!" hoặc JSON response

### Test 2: Test với curl (nếu có terminal)

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"chinh.nguyen@mediainsider.vn","password":"yourpassword"}'
```

**Expected:** JSON response với `success: true/false`

---

## 🔍 Kiểm tra Google Apps Script

### 1. Xem Execution Logs

1. **Mở:** https://script.google.com
2. **Click** "Executions" (menu bên trái)
3. **Click** vào execution mới nhất
4. **Xem logs** để biết lỗi gì

### 2. Test Function trực tiếp

**Chạy function này trong Apps Script:**

```javascript
function testLoginAPI() {
  const requestBody = {
    action: 'login',
    email: 'chinh.nguyen@mediainsider.vn',
    password: 'yourpassword' // Thay bằng password thực tế
  };
  
  const result = handleLogin(requestBody);
  Logger.log('Result: ' + JSON.stringify(result, null, 2));
  return result;
}
```

**Xem logs** để biết kết quả.

---

## 📝 Sample Console Logs (Expected)

**Nếu thành công:**
```
Sending login request to: https://script.google.com/macros/s/...
Request payload: { action: 'login', email: 'chinh.nguyen@mediainsider.vn', password: '***' }
Response status: 200
Response ok: true
Response text: {"success":true,"message":"Login successful","data":{...}}
Login response: { success: true, message: "Login successful", data: {...} }
Current user set: { email: "...", name: "...", role: "...", ... }
```

**Nếu có lỗi:**
```
Sending login request to: ...
Request payload: ...
Response status: [error code]
Response ok: false
Response text: [error message]
```

---

## 🆘 Next Steps

1. **Mở Browser Console** (F12)
2. **Thử login** lại
3. **Copy toàn bộ logs** từ console
4. **Gửi logs** để tiếp tục debug

**Hoặc:**

1. **Mở Google Apps Script**
2. **Xem Execution logs**
3. **Copy logs** và gửi lại

---

## ✅ Quick Fixes

### Fix 1: Kiểm tra Web App URL

```javascript
// Trong tlcgroup-intranet.html, tìm dòng:
const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'YOUR_WEB_APP_URL_HERE';

// Đảm bảo đã paste Web App URL từ Google Apps Script
// URL có dạng: https://script.google.com/macros/s/AKfycb.../exec
```

### Fix 2: Deploy lại Web App

1. **Mở** Google Apps Script
2. **Click** "Deploy" → "Manage deployments"
3. **Click** icon ✏️ (Edit)
4. **Click** "Deploy"
5. **Copy** Web App URL mới
6. **Update** trong frontend

### Fix 3: Kiểm tra Permissions

1. **Mở** Google Apps Script
2. **Chạy** function bất kỳ
3. **Authorize** nếu được hỏi
4. **Đảm bảo** có quyền truy cập Google Sheets

---

**Vui lòng mở Browser Console và gửi logs để tiếp tục debug!**

