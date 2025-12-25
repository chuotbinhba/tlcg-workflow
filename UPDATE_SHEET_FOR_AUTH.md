# Cập nhật Google Sheet "Nhân viên" cho Authentication

## 📋 Tình trạng hiện tại

Bạn đã có Google Sheet: [TLCG Master Data](https://docs.google.com/spreadsheets/d/1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c/edit)

**Sheet "Nhân viên" có cấu trúc:**
- Column A: Họ và tên
- Column B: Chức vụ
- Column C: Phòng ban
- Column D: Công ty
- Column E: Email ✅
- Column F: Điện thoại
- Column G: Status ✅
- Column H: EmployeeId ✅
- Column I: Role ✅
- Column J: isAdmin ✅
- **Column K: password** ❌ **CẦN THÊM**

---

## ✅ Cần làm

### Bước 1: Thêm cột "password" vào Google Sheet

1. **Mở Google Sheet:** [Link](https://docs.google.com/spreadsheets/d/1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c/edit)

2. **Thêm header "password" vào Column K:**
   - Click vào cell **K1**
   - Gõ: `password`
   - Enter

3. **Thêm password hash cho từng user:**
   - Mở file: `create_password_hash.html` trong browser
   - Nhập password cho user
   - Click "Generate Hash"
   - Copy hash → Paste vào Column K tương ứng với email của user

---

## 🔐 Tạo Password cho Users

### Option 1: Dùng Tool HTML (Nhanh nhất)

1. **Mở:** `create_password_hash.html` trong browser
2. **Nhập password** (ví dụ: `password123`)
3. **Click:** "Generate Hash"
4. **Copy hash** → Paste vào Google Sheet Column K

### Option 2: Dùng Google Apps Script

1. **Mở Apps Script**
2. **Chạy function:**
   ```javascript
   function hashPassword(password) {
     const rawHash = Utilities.computeDigest(
       Utilities.DigestAlgorithm.SHA_256,
       password,
       Utilities.Charset.UTF_8
     );
     return rawHash.map(function(byte) {
       return ('0' + (byte & 0xFF).toString(16)).slice(-2);
     }).join('');
   }
   
   function testHash() {
     Logger.log(hashPassword('yourpassword'));
   }
   ```
3. **Copy hash** từ Execution log

---

## 📊 Cấu trúc Sheet sau khi cập nhật

| A (Họ và tên) | B (Chức vụ) | C (Phòng ban) | D (Công ty) | E (Email) | F (Điện thoại) | G (Status) | H (EmployeeId) | I (Role) | J (isAdmin) | **K (password)** |
|---------------|-------------|---------------|-------------|----------|----------------|------------|----------------|----------|-------------|------------------|
| Lê Ngân Anh | Manager 1 | ... | ... | anh.le@mediainsider.vn | ... | Active | ... | System Administrator | TRUE | **[hash]** |
| Nguyễn Văn Chinh | Manager 4 | ... | ... | chinh.nguyen@mediainsider.vn | ... | Active | ... | User | FALSE | **[hash]** |

---

## 🎯 Quick Setup

### 1. Thêm Column K Header:
```
K1: password
```

### 2. Tạo Password Hash cho từng user:

**Ví dụ cho admin:**
- Email: `anh.le@mediainsider.vn`
- Password: `admin123` (hoặc password bạn muốn)
- Hash: Dùng `create_password_hash.html` để tạo
- Paste hash vào cell K2 (cùng row với email)

**Lặp lại cho các users khác**

---

## ✅ Checklist

- [ ] Đã thêm header "password" vào Column K
- [ ] Đã tạo password hash cho ít nhất 1 user test
- [ ] Đã paste hash vào Column K
- [ ] Đã test login với user đó
- [ ] (Optional) Đã thêm password cho tất cả users

---

## 🧪 Test

### Test 1: Kiểm tra Sheet
1. Mở Google Sheet
2. Kiểm tra Column K có header "password"
3. Kiểm tra có ít nhất 1 user có password hash

### Test 2: Test Login
1. Mở `tlcgroup-intranet.html`
2. Click vào "Order to Cash" (sẽ hiện login)
3. Nhập:
   - Email: Email của user trong sheet
   - Password: Password bạn đã hash
4. Click "Sign In"
5. ✅ Nếu thành công → Done!

---

## 📝 Sample Data

### User 1 - Admin:
- **Email:** `anh.le@mediainsider.vn`
- **Password:** `admin123`
- **Hash:** (dùng tool để tạo)
- **isAdmin:** `TRUE`

### User 2 - Employee:
- **Email:** `chinh.nguyen@mediainsider.vn`
- **Password:** `password123`
- **Hash:** (dùng tool để tạo)
- **isAdmin:** `FALSE`

---

## 🔒 Security Notes

1. **Không lưu plain text password** trong sheet
2. **Chỉ lưu hash** (SHA-256)
3. **Share sheet cẩn thận** - chỉ cho admin
4. **Đổi password mặc định** sau khi test

---

## 🆘 Troubleshooting

### Error: "Password not configured"
- Kiểm tra Column K có header "password" chưa
- Kiểm tra user có password hash trong Column K chưa
- Kiểm tra password hash đúng format (64 ký tự hex)

### Error: "Invalid password"
- Kiểm tra password bạn nhập có đúng với password đã hash không
- Kiểm tra hash đúng format chưa
- Thử tạo hash mới

### Error: "User not found"
- Kiểm tra email đúng format chưa
- Kiểm tra email có trong sheet chưa
- Kiểm tra email có khoảng trắng thừa không

---

## 📚 Files liên quan

- ✅ `google-apps-script-auth.gs` - Đã cập nhật với Spreadsheet ID
- ✅ `create_password_hash.html` - Tool tạo hash
- ✅ `tlcgroup-intranet.html` - Frontend (đã cập nhật)

---

**🎉 Sau khi thêm password column, hệ thống sẽ hoạt động!**

