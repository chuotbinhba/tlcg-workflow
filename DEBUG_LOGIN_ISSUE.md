# Hướng dẫn Debug Login Issue

## 🔍 Vấn đề: Login không hoạt động

### Đã cập nhật code với:
1. ✅ Tự động detect password column (Column K hoặc Column J)
2. ✅ Debug logging chi tiết
3. ✅ So sánh password với logging

---

## 📋 Checklist Debug

### 1. Kiểm tra Google Sheet

**Mở Google Sheet:** [Link](https://docs.google.com/spreadsheets/d/1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c/edit)

**Kiểm tra:**
- [ ] Column K có header "Password" không?
- [ ] Row 2 (user đầu tiên) có password hash trong Column K không?
- [ ] Email trong Column E đúng format không?
- [ ] Status trong Column G = "Active" không?

**Ví dụ Row 2 (Lê Ngân Anh):**
- Column E: `anh.le@mediainsider.vn` ✅
- Column G: `Active` ✅
- Column K: `b1686a564fe55878e2a44c26f465815823d63172dd0fd667e900e506215fd076` ✅

---

### 2. Kiểm tra Google Apps Script Logs

1. **Mở Google Apps Script:**
   - Vào: https://script.google.com
   - Mở project của bạn

2. **Xem Execution Logs:**
   - Click "Executions" (bên trái)
   - Click vào execution mới nhất
   - Xem logs

3. **Tìm các log quan trọng:**
   ```
   === AUTHENTICATE USER ===
   Email: [email bạn nhập]
   Sheet headers: [...]
   Column mapping:
   Email: 4 (header: Email)
   Password: 10 (header: Password)
   ```

4. **Kiểm tra:**
   - Email column có đúng không? (phải là 4 = Column E)
   - Password column có đúng không? (phải là 10 = Column K)
   - "Found user" có xuất hiện không?
   - "Password match" có xuất hiện không?

---

### 3. Test Password Hash

**Kiểm tra password hash có đúng không:**

1. **Mở Google Apps Script**
2. **Chạy function:**
   ```javascript
   function testHash() {
     const password = 'yourpassword'; // Thay bằng password bạn muốn test
     const hash = hashPassword(password);
     Logger.log('Password: ' + password);
     Logger.log('Hash: ' + hash);
     return hash;
   }
   ```
3. **So sánh hash** với hash trong Google Sheet Column K

**Ví dụ:**
- Password: `password123`
- Hash trong sheet: `b1686a564fe55878e2a44c26f465815823d63172dd0fd667e900e506215fd076`
- Hash từ function: Phải giống nhau!

---

### 4. Test Authentication Function

**Test trực tiếp trong Apps Script:**

1. **Chạy function:**
   ```javascript
   function testAuth() {
     const result = authenticateUser('anh.le@mediainsider.vn', 'yourpassword');
     Logger.log('Result: ' + JSON.stringify(result));
     return result;
   }
   ```
2. **Xem logs** để biết lỗi gì

---

## 🐛 Common Issues & Fixes

### Issue 1: "Password column not found"

**Nguyên nhân:**
- Column K chưa có header "Password"
- Hoặc password column ở vị trí khác

**Fix:**
1. Kiểm tra Google Sheet
2. Đảm bảo Column K có header "Password"
3. Hoặc cập nhật code để dùng column khác

---

### Issue 2: "User not found"

**Nguyên nhân:**
- Email không khớp (case sensitive hoặc có khoảng trắng)
- Email không có trong sheet

**Fix:**
1. Kiểm tra email trong sheet (Column E)
2. Đảm bảo email chính xác (không có khoảng trắng)
3. Code đã tự động trim và lowercase, nhưng kiểm tra lại

---

### Issue 3: "Password mismatch"

**Nguyên nhân:**
- Password hash trong sheet không đúng
- Password bạn nhập không khớp với password đã hash

**Fix:**
1. **Tạo hash mới:**
   - Mở `create_password_hash.html`
   - Nhập password
   - Generate hash
   - Copy hash → Paste vào Column K

2. **Hoặc dùng Apps Script:**
   ```javascript
   function generateHashForUser() {
     const password = 'yourpassword';
     const hash = hashPassword(password);
     Logger.log('Hash: ' + hash);
     // Copy hash này vào Google Sheet Column K
   }
   ```

---

### Issue 4: "Account is inactive"

**Nguyên nhân:**
- Status trong Column G không phải "Active"

**Fix:**
1. Kiểm tra Column G
2. Đảm bảo giá trị = "Active" (case insensitive)

---

### Issue 5: "Password not configured"

**Nguyên nhân:**
- Column K trống hoặc không có giá trị

**Fix:**
1. Kiểm tra Column K có password hash chưa
2. Thêm password hash vào Column K

---

## 🔧 Debug Steps

### Step 1: Kiểm tra Sheet Structure

```javascript
function debugSheetStructure() {
  const spreadsheet = SpreadsheetApp.openById('1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c');
  const sheet = spreadsheet.getSheetByName('Nhân viên');
  const data = sheet.getDataRange().getValues();
  
  Logger.log('Headers: ' + JSON.stringify(data[0]));
  Logger.log('Row 2 (first user): ' + JSON.stringify(data[1]));
  Logger.log('Row 2 Email (col 4): ' + data[1][4]);
  Logger.log('Row 2 Password (col 10): ' + data[1][10]);
  Logger.log('Row 2 Status (col 6): ' + data[1][6]);
}
```

### Step 2: Test với Email cụ thể

```javascript
function testSpecificUser() {
  const email = 'anh.le@mediainsider.vn'; // Thay bằng email bạn muốn test
  const password = 'yourpassword'; // Thay bằng password
  
  Logger.log('Testing: ' + email);
  const result = authenticateUser(email, password);
  Logger.log('Result: ' + JSON.stringify(result, null, 2));
  return result;
}
```

### Step 3: Verify Password Hash

```javascript
function verifyPasswordHash() {
  const spreadsheet = SpreadsheetApp.openById('1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c');
  const sheet = spreadsheet.getSheetByName('Nhân viên');
  const data = sheet.getDataRange().getValues();
  
  // Get password from row 2, column K (index 10)
  const storedHash = data[1][10];
  Logger.log('Stored hash in sheet: ' + storedHash);
  
  // Hash a test password
  const testPassword = 'yourpassword'; // Thay bằng password bạn muốn test
  const computedHash = hashPassword(testPassword);
  Logger.log('Computed hash: ' + computedHash);
  
  Logger.log('Match: ' + (storedHash === computedHash));
}
```

---

## ✅ Quick Fix Checklist

- [ ] Google Sheet Column K có header "Password"
- [ ] Column K có password hash (64 ký tự hex)
- [ ] Email trong Column E đúng format
- [ ] Status trong Column G = "Active"
- [ ] Password hash được tạo đúng (dùng `create_password_hash.html`)
- [ ] Google Apps Script đã deploy lại sau khi sửa code
- [ ] Frontend đã cập nhật Web App URL

---

## 📞 Next Steps

1. **Chạy debug functions** ở trên
2. **Xem logs** trong Apps Script
3. **So sánh password hash** với hash trong sheet
4. **Báo lại kết quả** để tiếp tục debug

---

## 🔍 Sample Log Output (Expected)

```
=== AUTHENTICATE USER ===
Email: anh.le@mediainsider.vn
Sheet headers: ["Họ và tên","Chức vụ","Phòng ban","Công ty","Email","Điện thoại","Status","EmployeeId","Role","isAdmin","Password"]
Total columns: 11
Column mapping:
Email: 4 (header: Email)
Password: 10 (header: Password)
Name: 0, Role: 8, isAdmin: 9, Status: 6
Sample password from row 2, column 10: b1686a564fe55878e2a44...
Found user: anh.le@mediainsider.vn
Row password (raw): b1686a564fe55878e2a44...
Hashed password (input): b1686a564fe55878e2a44...
Comparing passwords - Stored: b1686a564fe55878e2a44... vs Hashed: b1686a564fe55878e2a44...
Password match! Authentication successful
```

Nếu logs khác với expected, copy logs và báo lại!

