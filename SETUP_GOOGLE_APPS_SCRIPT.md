# Hướng dẫn Setup Google Apps Script cho Authentication

## 📋 Tổng quan

Hướng dẫn này sẽ giúp bạn setup Google Apps Script để xử lý authentication cho TLCGroup Intranet.

---

## 🚀 Bước 1: Tạo Google Apps Script Project

### 1.1. Truy cập Google Apps Script

1. **Mở trình duyệt** và truy cập: https://script.google.com
2. **Đăng nhập** bằng Google account của bạn
3. **Click** "New Project" (hoặc "Dự án mới")

### 1.2. Đặt tên Project

1. **Click** vào "Untitled project" (góc trên bên trái)
2. **Đổi tên** thành: `TLCG Intranet Backend`
3. **Enter** để lưu

---

## 📝 Bước 2: Thêm Code

### 2.1. Copy Code Authentication

1. **Mở file:** `google-apps-script-auth.gs` trong project của bạn
2. **Copy toàn bộ** nội dung file
3. **Quay lại** Google Apps Script
4. **Paste** vào file `Code.gs` (mặc định)

### 2.2. Thêm Code Voucher (nếu chưa có)

1. **Mở file:** `google-apps-script-code.gs`
2. **Copy toàn bộ** nội dung
3. **Paste** vào cùng file `Code.gs` (append vào cuối)

**Hoặc** nếu bạn đã có code voucher rồi:
- Chỉ cần thêm phần authentication functions vào file hiện có
- Đảm bảo `doPost` function có xử lý action `'login'`

### 2.3. Kiểm tra Code

**Đảm bảo có các functions sau:**
- ✅ `doPost()` - với case `'login'`
- ✅ `doGet()` - (nếu cần)
- ✅ `authenticateUser()`
- ✅ `hashPassword()`
- ✅ `handleLogin()`
- ✅ `createResponse()`
- ✅ Các functions voucher khác (nếu có)

---

## ⚙️ Bước 3: Cấu hình Constants

### 3.1. Kiểm tra Spreadsheet ID

**Trong code, tìm dòng:**
```javascript
const USERS_SHEET_ID = '1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c';
```

**Đảm bảo:**
- ✅ Spreadsheet ID đúng (từ URL Google Sheet)
- ✅ Sheet name: `'Nhân viên'` (hoặc tên sheet của bạn)

### 3.2. Kiểm tra Permissions

**Code cần các permissions:**
- ✅ Google Sheets API (để đọc user data)
- ✅ Gmail API (để gửi email - nếu có voucher functions)

---

## 🔐 Bước 4: Authorize Permissions

### 4.1. Chạy Function Test

1. **Click** vào function dropdown (góc trên)
2. **Chọn** function `hashPassword` (hoặc bất kỳ function nào)
3. **Click** "Run" (▶️)

### 4.2. Authorize

1. **Lần đầu chạy** sẽ hiện popup "Authorization required"
2. **Click** "Review Permissions"
3. **Chọn** Google account
4. **Click** "Advanced" → "Go to [Project Name] (unsafe)"
5. **Click** "Allow"

**Permissions cần authorize:**
- ✅ See, edit, create, and delete all your Google Sheets spreadsheets
- ✅ Send email on your behalf (nếu có voucher functions)

---

## 🧪 Bước 5: Test Functions

### 5.1. Test Hash Password

1. **Tạo function test:**
   ```javascript
   function testHash() {
     const password = 'test123';
     const hash = hashPassword(password);
     Logger.log('Password: ' + password);
     Logger.log('Hash: ' + hash);
     return hash;
   }
   ```

2. **Chạy** function `testHash`
3. **Xem logs:**
   - Click "Execution log" (bên dưới)
   - Xem hash được tạo

### 5.2. Test Authentication

1. **Tạo function test:**
   ```javascript
   function testAuth() {
     const email = 'anh.le@mediainsider.vn'; // Thay bằng email trong sheet
     const password = 'yourpassword'; // Thay bằng password
     const result = authenticateUser(email, password);
     Logger.log('Result: ' + JSON.stringify(result, null, 2));
     return result;
   }
   ```

2. **Chạy** function `testAuth`
3. **Xem logs** để kiểm tra kết quả

---

## 🚀 Bước 6: Deploy as Web App

### 6.1. Deploy

1. **Click** "Deploy" (góc trên bên phải)
2. **Chọn** "New deployment"
3. **Click** icon ⚙️ (Settings) bên cạnh "Select type"
4. **Chọn** "Web app"

### 6.2. Cấu hình Deployment

**Điền thông tin:**
- **Description:** `TLCG Intranet Backend v1.0`
- **Execute as:** `Me` (chọn account của bạn)
- **Who has access:** `Anyone` (quan trọng!)

**⚠️ Lưu ý:**
- Phải chọn "Anyone" để frontend có thể gọi API
- Nếu chọn "Only myself" → Frontend sẽ không gọi được

### 6.3. Deploy

1. **Click** "Deploy"
2. **Authorize** nếu được hỏi
3. **Copy Web App URL** (sẽ hiện sau khi deploy)

**Web App URL có dạng:**
```
https://script.google.com/macros/s/AKfycby.../exec
```

---

## 📋 Bước 7: Cập nhật Frontend

### 7.1. Cập nhật Web App URL

1. **Mở file:** `tlcgroup-intranet.html`
2. **Tìm dòng:**
   ```javascript
   const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'YOUR_WEB_APP_URL_HERE';
   ```
3. **Paste** Web App URL vừa copy
4. **Lưu** file

### 7.2. Test Login

1. **Mở** `tlcgroup-intranet.html` trong browser
2. **Click** "Order to Cash" (sẽ hiện login)
3. **Nhập:**
   - Email: Email từ Google Sheet (Column E)
   - Password: Password bạn đã hash
4. **Click** "Sign In"
5. **Kiểm tra** kết quả

---

## 🔍 Bước 8: Debug (nếu cần)

### 8.1. Xem Execution Logs

1. **Quay lại** Google Apps Script
2. **Click** "Executions" (menu bên trái)
3. **Click** vào execution mới nhất
4. **Xem logs** để debug

### 8.2. Common Issues

**Issue 1: "Authorization required"**
- **Fix:** Chạy lại function và authorize

**Issue 2: "Cannot access spreadsheet"**
- **Fix:** 
  - Kiểm tra Spreadsheet ID đúng chưa
  - Kiểm tra sheet có share với Apps Script account không

**Issue 3: "Invalid action"**
- **Fix:** 
  - Kiểm tra `doPost` có xử lý action `'login'` chưa
  - Kiểm tra frontend gửi đúng action không

**Issue 4: "CORS error"**
- **Fix:**
  - Đảm bảo deployment chọn "Anyone"
  - Kiểm tra Web App URL đúng chưa

---

## ✅ Checklist Setup

- [ ] Đã tạo Google Apps Script project
- [ ] Đã copy code authentication vào Code.gs
- [ ] Đã copy code voucher vào Code.gs (nếu cần)
- [ ] Đã kiểm tra USERS_SHEET_ID đúng
- [ ] Đã authorize permissions
- [ ] Đã test hashPassword function
- [ ] Đã test authenticateUser function
- [ ] Đã deploy as Web App
- [ ] Đã copy Web App URL
- [ ] Đã cập nhật frontend với Web App URL
- [ ] Đã test login từ frontend
- [ ] Login hoạt động thành công

---

## 📝 Sample Code Structure

**File Code.gs nên có cấu trúc:**

```javascript
// ============================================================================
// CONFIGURATION
// ============================================================================
const USERS_SHEET_ID = '1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c';
const USERS_SHEET_NAME = 'Nhân viên';

// ============================================================================
// MAIN REQUEST HANDLERS
// ============================================================================
function doPost(e) {
  // ... parse request body
  // ... handle actions: login, sendEmail, syncToSheets, etc.
}

function doGet(e) {
  // ... handle GET requests
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================
function authenticateUser(email, password) {
  // ... authentication logic
}

function hashPassword(password) {
  // ... hash password
}

function handleLogin(requestBody) {
  // ... handle login request
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function createResponse(success, message, data) {
  // ... create JSON response
}

// ... other functions
```

---

## 🆘 Troubleshooting

### Lỗi: "Script function not found"

**Nguyên nhân:** Function không tồn tại hoặc tên sai

**Fix:**
1. Kiểm tra function name đúng chưa
2. Kiểm tra code đã save chưa
3. Refresh Apps Script page

---

### Lỗi: "Access denied"

**Nguyên nhân:** Không có quyền truy cập Google Sheet

**Fix:**
1. Kiểm tra Google Sheet có share với Apps Script account không
2. Kiểm tra Spreadsheet ID đúng chưa
3. Re-authorize permissions

---

### Lỗi: "Execution failed"

**Nguyên nhân:** Code có lỗi syntax hoặc runtime error

**Fix:**
1. Xem Execution logs để biết lỗi cụ thể
2. Kiểm tra code syntax
3. Test từng function riêng lẻ

---

## 📞 Next Steps

Sau khi setup xong:

1. ✅ Test login với user trong Google Sheet
2. ✅ Thêm users mới vào Google Sheet
3. ✅ (Optional) Thêm tính năng "Forgot Password"
4. ✅ (Optional) Thêm tính năng "Change Password"

---

## 🔗 Links hữu ích

- **Google Apps Script:** https://script.google.com
- **Google Sheet:** https://docs.google.com/spreadsheets/d/1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c/edit
- **Apps Script Documentation:** https://developers.google.com/apps-script

---

**🎉 Chúc bạn setup thành công!**

Nếu gặp vấn đề, xem thêm:
- `DEBUG_LOGIN_ISSUE.md` - Debug login issues
- `QUICK_START_AUTH.md` - Quick start guide

