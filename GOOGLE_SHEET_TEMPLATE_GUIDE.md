# Hướng dẫn Tạo Google Sheet Template cho Authentication

## 🎯 Mục đích

Tạo Google Sheet để lưu trữ thông tin users cho hệ thống authentication của TLCGroup Intranet.

---

## 📋 Cách 1: Import từ CSV Template (Nhanh nhất) ⭐

### Bước 1: Tạo Google Sheet mới

1. **Truy cập:** https://sheets.google.com
2. **Click:** "Blank" để tạo sheet mới
3. **Đặt tên:** `TLCG Users Database`

### Bước 2: Import CSV Template

1. **Mở file:** `users_template.csv` (đã có sẵn trong project)
2. **Copy toàn bộ nội dung**
3. **Vào Google Sheet:**
   - Click cell A1
   - Paste (Ctrl+V / Cmd+V)
4. **Kiểm tra:**
   - Row 1: Headers (email, password, name, role, isAdmin, employeeId, department, status)
   - Row 2+: User data

### Bước 3: Lưu Spreadsheet ID

1. **Copy URL** từ address bar:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
2. **Copy phần `SPREADSHEET_ID_HERE`**
3. **Lưu lại** để dùng trong Google Apps Script

---

## 📋 Cách 2: Tạo thủ công

### Bước 1: Tạo Headers (Row 1)

| Column | Header | Mô tả | Ví dụ |
|--------|--------|-------|-------|
| A | `email` | Email đăng nhập | admin@tlcgroup.com |
| B | `password` | Password đã hash | a665a45920422f9d417e... |
| C | `name` | Tên đầy đủ | Super Admin |
| D | `role` | Chức vụ | System Administrator |
| E | `isAdmin` | Quyền admin | TRUE / FALSE |
| F | `employeeId` | Mã nhân viên | ADM-001 |
| G | `department` | Bộ phận | IT |
| H | `status` | Trạng thái | Active / Inactive |

### Bước 2: Thêm Users

**User 1 - Admin:**
```
A2: admin@tlcgroup.com
B2: a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
C2: Super Admin
D2: System Administrator
E2: TRUE
F2: ADM-001
G2: IT
H2: Active
```

**User 2 - Employee:**
```
A3: chinh@tlcgroup.com
B3: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
C3: Nguyễn Văn Chinh
D3: Finance Manager
E3: FALSE
F3: EMP-001
G3: Finance
H3: Active
```

---

## 🔐 Tạo Password Hash

### Cách 1: Dùng Google Apps Script (Khuyến nghị)

1. **Mở Google Apps Script:**
   - Vào: https://script.google.com
   - Tạo project mới hoặc mở project hiện có

2. **Paste code này:**
   ```javascript
   function hashPassword(password) {
     const rawHash = Utilities.computeDigest(
       Utilities.DigestAlgorithm.SHA_256,
       password,
       Utilities.Charset.UTF_8
     );
     
     const hashString = rawHash.map(function(byte) {
       return ('0' + (byte & 0xFF).toString(16)).slice(-2);
     }).join('');
     
     return hashString;
   }
   
   function testHash() {
     // Test hash password
     const password = 'hello'; // Thay đổi password ở đây
     const hashed = hashPassword(password);
     Logger.log('Password: ' + password);
     Logger.log('Hashed: ' + hashed);
     return hashed;
   }
   ```

3. **Chạy function `testHash()`:**
   - Click "Run" → Chọn `testHash`
   - Xem kết quả trong "Execution log"
   - Copy hash string

4. **Paste vào Google Sheet** column B

### Cách 2: Dùng Online Tool (Nhanh)

1. **Truy cập:** https://emn178.github.io/online-tools/sha256.html
2. **Nhập password** vào text box
3. **Copy hash** (SHA-256)
4. **Paste vào Google Sheet** column B

---

## 📊 Sample Data

### Default Passwords (đã hash sẵn):

| Email | Password (plain) | Hash (đã có trong CSV) |
|-------|------------------|------------------------|
| admin@tlcgroup.com | `hello` | `a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3` |
| chinh@tlcgroup.com | `password` | `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8` |
| linh@tlcgroup.com | `password` | `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8` |
| luc@tlcgroup.com | `password` | `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8` |

**⚠️ Lưu ý:** Đổi password ngay sau khi test!

---

## ✅ Checklist

- [ ] Tạo Google Sheet mới
- [ ] Import CSV hoặc tạo headers thủ công
- [ ] Thêm ít nhất 1 user test
- [ ] Hash password cho user mới
- [ ] Copy Spreadsheet ID
- [ ] Test login với user trong sheet

---

## 🔧 Cấu trúc Google Sheet

### Format chuẩn:

```
Row 1 (Headers):
email | password | name | role | isAdmin | employeeId | department | status

Row 2+ (Data):
admin@tlcgroup.com | [hash] | Super Admin | System Administrator | TRUE | ADM-001 | IT | Active
chinh@tlcgroup.com | [hash] | Nguyễn Văn Chinh | Finance Manager | FALSE | EMP-001 | Finance | Active
```

### Rules:

1. **email:** Bắt buộc, unique, format email hợp lệ
2. **password:** Bắt buộc, phải là SHA-256 hash (64 ký tự hex)
3. **name:** Bắt buộc, tên đầy đủ
4. **role:** Tùy chọn, mô tả chức vụ
5. **isAdmin:** TRUE hoặc FALSE (case-sensitive)
6. **employeeId:** Tùy chọn, mã nhân viên
7. **department:** Tùy chọn, bộ phận
8. **status:** Active hoặc Inactive (case-sensitive)

---

## 🎨 Formatting (Optional)

### Để dễ đọc, bạn có thể:

1. **Freeze Row 1:**
   - View → Freeze → 1 row

2. **Format Headers:**
   - Select Row 1
   - Bold (Ctrl+B)
   - Background color: Light blue

3. **Protect Headers:**
   - Right-click Row 1 → Protect range
   - Chỉ cho phép edit data rows

4. **Data Validation:**
   - Column E (isAdmin): Dropdown (TRUE, FALSE)
   - Column H (status): Dropdown (Active, Inactive)

---

## 📝 Thêm User Mới

### Cách 1: Thêm trực tiếp trong Google Sheet

1. **Thêm row mới** ở cuối sheet
2. **Điền thông tin:**
   - Email
   - Password (hash) - dùng Apps Script để hash
   - Name
   - Role
   - isAdmin (TRUE/FALSE)
   - EmployeeId
   - Department
   - Status (Active/Inactive)

### Cách 2: Dùng Google Apps Script Function

1. **Mở Apps Script**
2. **Chạy function `createUser`:**
   ```javascript
   createUser(
     'newuser@tlcgroup.com',  // email
     'password123',            // password (sẽ tự hash)
     'New User',               // name
     'Employee',               // role
     false,                    // isAdmin
     'EMP-004',               // employeeId
     'Sales'                   // department
   );
   ```

---

## 🔒 Bảo mật

### Quan trọng:

1. **Không share sheet** với người không cần thiết
2. **Chỉ cho phép edit** cho admin
3. **Backup sheet** định kỳ
4. **Đổi password mặc định** ngay sau khi test
5. **Không lưu plain text password** trong sheet

### Best Practices:

- ✅ Dùng password mạnh (8+ ký tự, có số, chữ, ký tự đặc biệt)
- ✅ Hash password trước khi lưu
- ✅ Kiểm tra status = "Active" trước khi cho login
- ✅ Log mọi thay đổi user data
- ✅ Review user list định kỳ

---

## 🧪 Test Sheet

### Test 1: Kiểm tra Format

1. **Mở Google Sheet**
2. **Kiểm tra:**
   - Row 1 có đúng 8 columns?
   - Headers đúng tên không?
   - Có ít nhất 1 user data?

### Test 2: Kiểm tra Data

1. **Email:** Format hợp lệ?
2. **Password:** 64 ký tự hex?
3. **isAdmin:** TRUE hoặc FALSE?
4. **status:** Active hoặc Inactive?

### Test 3: Test với Apps Script

1. **Mở Apps Script**
2. **Chạy:**
   ```javascript
   authenticateUser('admin@tlcgroup.com', 'hello');
   ```
3. **Kiểm tra kết quả** trong Execution log

---

## 📞 Next Steps

Sau khi tạo xong Google Sheet:

1. ✅ Copy Spreadsheet ID
2. ✅ Cập nhật `USERS_SHEET_ID` trong `google-apps-script-auth.gs`
3. ✅ Deploy Google Apps Script
4. ✅ Test login từ frontend

Xem thêm: `SETUP_AUTHENTICATION.md`

---

## 🆘 Troubleshooting

### Error: "Spreadsheet not found"
- Kiểm tra Spreadsheet ID đúng chưa
- Kiểm tra quyền truy cập (sheet phải share với Apps Script)

### Error: "No users configured"
- Kiểm tra có data trong sheet chưa
- Kiểm tra headers đúng tên chưa

### Error: "Invalid password"
- Kiểm tra password đã được hash chưa
- Kiểm tra hash đúng format (64 ký tự hex)

### Error: "User not found"
- Kiểm tra email đúng format chưa
- Kiểm tra email có trong sheet chưa
- Kiểm tra status = "Active"

---

## 📎 Files liên quan

- `users_template.csv` - CSV template để import
- `google-apps-script-auth.gs` - Code authentication
- `SETUP_AUTHENTICATION.md` - Hướng dẫn setup đầy đủ
- `AUTHENTICATION_OPTIONS.md` - So sánh các phương án

