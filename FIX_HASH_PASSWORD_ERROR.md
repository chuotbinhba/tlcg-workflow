# Fix: Hash Password Error - "Argument cannot be null"

## 🐛 Lỗi

```
Hash error: Exception: Argument cannot be null: value
```

## 🔍 Nguyên nhân

Function `hashPassword()` nhận được `null` hoặc `undefined` thay vì password string.

**Có thể do:**
1. Frontend không gửi password trong request
2. Password bị null/undefined trong quá trình parse request body
3. Test function không truyền password

---

## ✅ Đã sửa

### 1. Thêm validation trong `hashPassword()`

```javascript
function hashPassword(password) {
  // Validate input
  if (!password || password === null || password === undefined) {
    Logger.log('Hash error: Password is null or undefined');
    throw new Error('Password cannot be null or undefined');
  }
  
  // Convert to string if not already
  const passwordString = password.toString().trim();
  
  if (passwordString === '') {
    Logger.log('Hash error: Password is empty');
    throw new Error('Password cannot be empty');
  }
  
  // ... rest of code
}
```

### 2. Thêm validation trong `authenticateUser()`

```javascript
// Validate password input
if (!password || password === null || password === undefined || password.toString().trim() === '') {
  Logger.log('ERROR: Password is null, undefined, or empty');
  return { success: false, message: 'Password is required' };
}
```

### 3. Thêm validation trong `handleLogin()`

```javascript
if (!password || password === null || password === undefined || password.toString().trim() === '') {
  Logger.log('ERROR: Password is missing, null, or empty');
  return createResponse(false, 'Password is required');
}
```

---

## 🧪 Test sau khi sửa

### Test 1: Test với password hợp lệ

```javascript
function testHashValid() {
  const password = 'test123';
  const hash = hashPassword(password);
  Logger.log('Password: ' + password);
  Logger.log('Hash: ' + hash);
  return hash;
}
```

**Expected:** Hash được tạo thành công (64 ký tự hex)

---

### Test 2: Test với null/undefined

```javascript
function testHashNull() {
  try {
    const hash = hashPassword(null);
    Logger.log('ERROR: Should have thrown error');
  } catch (error) {
    Logger.log('SUCCESS: Error caught: ' + error.message);
  }
}
```

**Expected:** Error được throw với message rõ ràng

---

### Test 3: Test login với password hợp lệ

```javascript
function testLoginValid() {
  const requestBody = {
    action: 'login',
    email: 'anh.le@mediainsider.vn',
    password: 'yourpassword' // Thay bằng password thực tế
  };
  
  const result = handleLogin(requestBody);
  Logger.log('Result: ' + JSON.stringify(result, null, 2));
  return result;
}
```

**Expected:** Login thành công hoặc lỗi rõ ràng

---

### Test 4: Test login với password null

```javascript
function testLoginNullPassword() {
  const requestBody = {
    action: 'login',
    email: 'anh.le@mediainsider.vn',
    password: null
  };
  
  const result = handleLogin(requestBody);
  Logger.log('Result: ' + JSON.stringify(result, null, 2));
  return result;
}
```

**Expected:** 
```json
{
  "success": false,
  "message": "Password is required"
}
```

---

## 🔧 Cách sửa trong Google Apps Script

### Bước 1: Cập nhật Code

1. **Mở** Google Apps Script: https://script.google.com
2. **Mở** file `Code.gs`
3. **Tìm** function `hashPassword`
4. **Thay thế** bằng code mới (đã có trong `google-apps-script-auth.gs`)
5. **Save** (Ctrl+S / Cmd+S)

### Bước 2: Test lại

1. **Chạy** function `testHashValid()`
2. **Xem logs** - không còn lỗi
3. **Chạy** function `testLoginValid()`
4. **Kiểm tra** kết quả

### Bước 3: Deploy lại (nếu cần)

1. **Click** "Deploy" → "Manage deployments"
2. **Click** icon ✏️ (Edit) bên cạnh deployment
3. **Click** "Deploy"
4. **Copy** Web App URL mới (nếu có)

---

## 📋 Checklist

- [ ] Đã cập nhật function `hashPassword()` với validation
- [ ] Đã cập nhật function `authenticateUser()` với validation
- [ ] Đã cập nhật function `handleLogin()` với validation
- [ ] Đã test `hashPassword()` với password hợp lệ
- [ ] Đã test `hashPassword()` với null/undefined (throw error)
- [ ] Đã test `handleLogin()` với password hợp lệ
- [ ] Đã test `handleLogin()` với password null (return error)
- [ ] Đã deploy lại (nếu cần)
- [ ] Đã test login từ frontend

---

## 🆘 Nếu vẫn gặp lỗi

### Lỗi: "Password is required"

**Nguyên nhân:** Frontend không gửi password

**Fix:**
1. Kiểm tra frontend code
2. Đảm bảo `login-pass` input có value
3. Kiểm tra console logs trong browser

### Lỗi: "Error processing password"

**Nguyên nhân:** Password không thể hash được

**Fix:**
1. Kiểm tra password có ký tự đặc biệt không
2. Kiểm tra password length
3. Xem logs chi tiết trong Apps Script

---

## 📝 Sample Request Body (Expected)

**Valid request:**
```json
{
  "action": "login",
  "email": "anh.le@mediainsider.vn",
  "password": "yourpassword"
}
```

**Invalid request (missing password):**
```json
{
  "action": "login",
  "email": "anh.le@mediainsider.vn"
}
```

**Invalid request (null password):**
```json
{
  "action": "login",
  "email": "anh.le@mediainsider.vn",
  "password": null
}
```

---

## ✅ Sau khi sửa

1. **Test lại** với password hợp lệ
2. **Kiểm tra logs** - không còn lỗi "Argument cannot be null"
3. **Test login** từ frontend
4. **Xác nhận** login hoạt động

---

**🎉 Lỗi đã được fix!**

Nếu vẫn gặp vấn đề, xem thêm:
- `DEBUG_LOGIN_ISSUE.md` - Debug login issues
- `SETUP_GOOGLE_APPS_SCRIPT.md` - Setup guide

