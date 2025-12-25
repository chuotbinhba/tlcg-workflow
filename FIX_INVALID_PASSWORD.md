# Fix: "Invalid password" Error

## 🐛 Vấn đề

Login failed với message: `"Invalid password"`

**Từ logs:**
- Response: `{"success":false,"message":"Invalid password"}`
- Password field hiển thị hash: `62097fa526fc390d02863b5210eda5e0a39968b66a8991db98f5baeccd462d31`

---

## 🔍 Nguyên nhân

### Có thể do:

1. **User nhập hash thay vì plain password**
   - Password field hiển thị hash → User đang nhập hash
   - Backend hash lại → `hash(hash) != hash` trong sheet

2. **Password trong sheet chưa được hash**
   - Sheet có plain password
   - Backend hash password input
   - `hash(plain) != plain` trong sheet

3. **Password trong sheet hash sai**
   - Hash trong sheet không đúng format
   - Hash algorithm khác

---

## ✅ Giải pháp

### Bước 1: Kiểm tra Password trong Sheet

1. **Mở Google Sheet:** https://docs.google.com/spreadsheets/d/1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c/edit
2. **Vào sheet "Nhân viên"**
3. **Tìm row của:** `chinh.nguyen@mediainsider.vn`
4. **Kiểm tra Column K (Password):**
   - ✅ Có hash (64 ký tự hex)
   - ❌ Plain password → Cần hash

### Bước 2: Generate Password Hash

**Dùng tool:** `create_password_hash.html`

1. **Mở file:** `create_password_hash.html`
2. **Nhập password** bạn muốn dùng
3. **Click "Generate Hash"**
4. **Copy hash** (64 ký tự)
5. **Paste vào Column K** trong sheet

### Bước 3: Đảm bảo nhập Plain Password

**Khi login:**
- ✅ Nhập **plain password** (ví dụ: `mypassword123`)
- ❌ KHÔNG nhập hash

**Backend sẽ tự động hash password input và so sánh với hash trong sheet.**

---

## 🧪 Test

### Test 1: Kiểm tra Hash trong Sheet

1. **Mở sheet**
2. **Tìm email:** `chinh.nguyen@mediainsider.vn`
3. **Xem Column K:**
   - Hash phải là 64 ký tự hex
   - Ví dụ: `62097fa526fc390d02863b5210eda5e0a39968b66a8991db98f5baeccd462d31`

### Test 2: Generate Hash mới

1. **Mở:** `create_password_hash.html`
2. **Nhập password:** `test123` (hoặc password bạn muốn)
3. **Generate hash**
4. **Update vào sheet**

### Test 3: Test Login

1. **Login với:**
   - Email: `chinh.nguyen@mediainsider.vn`
   - Password: `test123` (plain password, không phải hash)
2. **Kiểm tra kết quả**

---

## 📝 Checklist

- [ ] Password trong sheet là hash (64 ký tự hex)
- [ ] Hash được generate bằng SHA-256
- [ ] User nhập plain password khi login
- [ ] Backend hash password input và so sánh với hash trong sheet
- [ ] Email trong sheet đúng (Column E)
- [ ] Status = "Active" (Column G)

---

## 🔧 Nếu vẫn không được

### Kiểm tra Google Apps Script Logs

1. **Mở:** https://script.google.com
2. **Click "Executions"**
3. **Xem execution mới nhất**
4. **Kiểm tra logs:**
   - `Found user:` - Có tìm thấy user không?
   - `Password match:` - Password có khớp không?
   - `Comparing passwords:` - So sánh hash

### Debug Password Hash

**Chạy function trong Apps Script:**
```javascript
function testPasswordHash() {
  const password = 'test123'; // Thay bằng password bạn muốn test
  const hash = hashPassword(password);
  Logger.log('Password: ' + password);
  Logger.log('Hash: ' + hash);
  Logger.log('Hash length: ' + hash.length);
  return hash;
}
```

**So sánh hash với hash trong sheet.**

---

## ✅ Expected Result

Sau khi fix:
- ✅ Login thành công
- ✅ Hiển thị đúng user info từ sheet
- ✅ Name, Role, ID đúng với data trong sheet

---

**Vui lòng:**
1. **Kiểm tra password trong sheet** (Column K)
2. **Generate hash mới** nếu cần
3. **Đảm bảo nhập plain password** khi login
4. **Test lại**

