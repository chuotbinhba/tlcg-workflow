# Debug: User Data không hiển thị đúng

## 🐛 Vấn đề

Login thành công nhưng vẫn hiển thị "Alex Smith" thay vì thông tin từ Google Sheet.

---

## 🔍 Cách Debug

### Bước 1: Kiểm tra Console Logs

1. **Mở Browser Console** (F12)
2. **Thử login** lại
3. **Xem logs:**
   - `Login response:` - Xem response từ server
   - `Result data:` - Xem data object
   - `Current user set:` - Xem user object đã set
   - `User name:`, `User role:`, `User id:` - Xem từng field

### Bước 2: Kiểm tra Response Structure

**Expected response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "email": "chinh.nguyen@mediainsider.vn",
    "name": "Tên từ sheet",
    "role": "Chức vụ từ sheet",
    "employeeId": "ID từ sheet",
    "department": "Phòng ban từ sheet",
    "company": "Công ty từ sheet",
    "isAdmin": false
  }
}
```

### Bước 3: Kiểm tra Google Apps Script Logs

1. **Mở:** https://script.google.com
2. **Click** "Executions"
3. **Xem** execution mới nhất
4. **Kiểm tra logs:**
   - `Column mapping:` - Xem column mapping
   - `Found user:` - Xem có tìm thấy user không
   - `Return user data:` - Xem data được return

---

## 🔧 Common Issues

### Issue 1: Fallback vẫn được dùng

**Nguyên nhân:** URL check condition sai

**Fix:** Đã sửa trong code - check `YOUR_WEB_APP_URL_HERE` thay vì actual URL

### Issue 2: Response không có data

**Nguyên nhân:** Backend không return đúng format

**Fix:** Kiểm tra `handleLogin()` function trong Apps Script

### Issue 3: Column mapping sai

**Nguyên nhân:** Column indices không đúng với sheet structure

**Fix:** Kiểm tra logs trong Apps Script để xem column mapping

---

## 📋 Checklist

- [ ] Console logs hiển thị `Login response` với `success: true`
- [ ] Console logs hiển thị `Result data` với đầy đủ fields
- [ ] Console logs hiển thị `Current user set` với đúng data
- [ ] Apps Script logs hiển thị `Found user` và `Return user data`
- [ ] Column mapping trong Apps Script logs đúng

---

## 🧪 Test Functions

### Test trong Browser Console

Sau khi login, chạy:
```javascript
console.log('Current user:', currentUser);
console.log('User name:', currentUser.name);
console.log('User role:', currentUser.role);
```

### Test trong Google Apps Script

Chạy function:
```javascript
function testAuth() {
  const result = authenticateUser('chinh.nguyen@mediainsider.vn', 'yourpassword');
  Logger.log('Result: ' + JSON.stringify(result, null, 2));
  return result;
}
```

---

## ✅ Expected Result

Sau khi fix, bạn sẽ thấy:
- **Name:** Tên từ column "Họ và tên" trong sheet
- **Role:** Chức vụ từ column "Chức vụ" hoặc "Role" trong sheet
- **ID:** Employee ID từ column "EmployeeId" trong sheet
- **Department:** Phòng ban từ column "Phòng ban" trong sheet

---

**Vui lòng check console logs và gửi lại để tiếp tục debug!**

