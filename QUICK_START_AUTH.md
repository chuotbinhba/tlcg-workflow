# 🚀 Quick Start: Setup Authentication trong 5 phút

## ⚡ Các bước nhanh

### 1️⃣ Tạo Google Sheet (2 phút)

1. **Mở:** https://sheets.google.com
2. **Tạo sheet mới:** `TLCG Users Database`
3. **Import CSV:**
   - Mở file `users_template.csv`
   - Copy toàn bộ
   - Paste vào Google Sheet (cell A1)
4. **Copy Spreadsheet ID:**
   - Từ URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy `SPREADSHEET_ID`

### 2️⃣ Setup Google Apps Script (2 phút)

1. **Mở:** https://script.google.com
2. **Mở project hiện có** (hoặc tạo mới)
3. **Thêm file mới:** `auth.gs`
4. **Copy code** từ `google-apps-script-auth.gs`
5. **Cập nhật:**
   ```javascript
   const USERS_SHEET_ID = 'PASTE_SPREADSHEET_ID_HERE';
   ```
6. **Cập nhật `doPost`** (thêm vào đầu function):
   ```javascript
   if (action === 'login') {
     return handleLogin(requestBody);
   }
   ```
7. **Deploy:**
   - Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone
   - Copy Web App URL

### 3️⃣ Cập nhật Frontend (1 phút)

1. **Mở:** `tlcgroup-intranet.html`
2. **Tìm dòng:**
   ```javascript
   const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'YOUR_WEB_APP_URL_HERE';
   ```
3. **Paste Web App URL** từ bước 2

### 4️⃣ Test (30 giây)

1. **Mở:** `tlcgroup-intranet.html` trong browser
2. **Click:** "Order to Cash" (sẽ hiện login)
3. **Login với:**
   - Email: `admin@tlcgroup.com`
   - Password: `hello`
4. **✅ Done!**

---

## 📋 Default Users (đã có sẵn trong CSV)

| Email | Password | Role |
|-------|----------|------|
| admin@tlcgroup.com | `hello` | Admin |
| chinh@tlcgroup.com | `password` | Employee |
| linh@tlcgroup.com | `password` | Employee |
| luc@tlcgroup.com | `password` | Employee |

**⚠️ Đổi password ngay sau khi test!**

---

## 🔐 Tạo Password Hash mới

### Option 1: Dùng Tool HTML (Nhanh nhất)

1. **Mở:** `create_password_hash.html` trong browser
2. **Nhập password**
3. **Click:** "Generate Hash"
4. **Copy hash** → Paste vào Google Sheet

### Option 2: Dùng Google Apps Script

1. **Mở Apps Script**
2. **Paste code:**
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
3. **Chạy:** `testHash()`
4. **Copy hash** từ Execution log

---

## ✅ Checklist

- [ ] Google Sheet đã tạo và có data
- [ ] Spreadsheet ID đã copy
- [ ] Google Apps Script đã thêm auth code
- [ ] `USERS_SHEET_ID` đã cập nhật
- [ ] `doPost` đã thêm login handler
- [ ] Web App đã deploy
- [ ] Web App URL đã copy
- [ ] Frontend đã cập nhật URL
- [ ] Test login thành công

---

## 🆘 Troubleshooting

### Login không hoạt động?

1. **Kiểm tra Console (F12):**
   - Có error không?
   - Request có gửi đi không?

2. **Kiểm tra Apps Script Logs:**
   - Execution → View logs
   - Có error không?

3. **Kiểm tra Google Sheet:**
   - Email đúng format?
   - Password đã hash?
   - Status = "Active"?

### "Spreadsheet not found"?

- Kiểm tra `USERS_SHEET_ID` đúng chưa
- Kiểm tra sheet có share với Apps Script không

### "Invalid password"?

- Kiểm tra password đã hash chưa
- Hash đúng format (64 ký tự hex)

---

## 📚 Files cần thiết

- ✅ `users_template.csv` - Import vào Google Sheet
- ✅ `google-apps-script-auth.gs` - Code authentication
- ✅ `create_password_hash.html` - Tool tạo hash
- ✅ `tlcgroup-intranet.html` - Frontend (đã cập nhật)

---

## 🎯 Next Steps

Sau khi setup xong:

1. ✅ Test với các users mặc định
2. ✅ Thêm users mới vào Google Sheet
3. ✅ Đổi password mặc định
4. ✅ (Optional) Thêm tính năng "Forgot Password"
5. ✅ (Optional) Thêm tính năng "Change Password"

---

**🎉 Chúc bạn setup thành công!**

