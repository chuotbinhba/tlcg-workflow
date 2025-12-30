# 🔧 Fix Google Apps Script Deployment - URL Không Hoạt Động

## ❌ Vấn đề hiện tại:
URL không truy cập được: `Sorry, unable to open the file at this time`

## ✅ Giải pháp: Deploy lại Google Apps Script

### Bước 1: Mở Google Apps Script Project

1. Truy cập: https://script.google.com
2. Tìm project **"Phiếu Thu Chi"** hoặc tạo project mới:
   - Nếu không thấy project cũ → Click **"New Project"**
   - Đổi tên project: `TLCG Voucher Workflow Backend`

### Bước 2: Copy Code Backend

1. Mở file `VOUCHER_WORKFLOW_BACKEND.gs` trong folder này
2. **Copy toàn bộ** nội dung (Ctrl+A, Ctrl+C)
3. Quay lại Google Apps Script editor
4. Xóa code cũ (nếu có)
5. **Paste** code mới vào (Ctrl+V)
6. Click **Save** (💾 icon hoặc Ctrl+S / Cmd+S)

### Bước 3: Kiểm tra Cấu hình

Đảm bảo các biến sau được cấu hình đúng (ở đầu file):

```javascript
const USERS_SHEET_ID = '1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c';
const USERS_SHEET_NAME = 'Nhân viên';
const VOUCHER_HISTORY_SHEET_ID = '1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g';
const VH_SHEET_NAME = 'Voucher_History';
```

### Bước 4: Authorize Permissions (Lần đầu)

1. Click dropdown function (góc trên bên trái)
2. Chọn function bất kỳ (ví dụ: `doGet`)
3. Click **Run** (▶️)
4. Nếu hiện "Authorization required":
   - Click **"Review Permissions"**
   - Chọn Google account của bạn
   - Click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
   - Click **"Allow"**
5. Cấp các quyền:
   - ✅ Send email on your behalf
   - ✅ See, edit, create, and delete all your Google Sheets spreadsheets
   - ✅ View and manage Google Drive files

### Bước 5: Deploy as Web App ⭐ QUAN TRỌNG

1. Click **"Deploy"** (góc trên bên phải) → **"New deployment"**

2. Click icon **⚙️** (Settings) bên cạnh **"Select type"**

3. Chọn **"Web app"**

4. Điền thông tin:
   ```
   Description: TLCG Voucher Workflow v1.0
   Execute as: Me (your-email@gmail.com)
   Who has access: Anyone ⚠️ (QUAN TRỌNG!)
   ```

   **⚠️ LƯU Ý:**
   - **PHẢI** chọn "Anyone" hoặc "Anyone with Google account"
   - Nếu chọn "Only myself" → Frontend sẽ không gọi được API

5. Click **"Deploy"**

6. **Authorize** nếu được hỏi:
   - Click **"Authorize access"**
   - Chọn account
   - Click **"Allow"**

7. **SAO CHÉP Web App URL** (sẽ hiện sau khi deploy)
   
   URL có dạng:
   ```
   https://script.google.com/macros/s/AKfycby...XYZ.../exec
   ```
   
   **LƯU Ý:** 
   - URL phải có `/exec` ở cuối
   - URL KHÔNG có `/u/9/` trong đường dẫn
   - URL đúng: `https://script.google.com/macros/s/.../exec`
   - URL sai: `https://script.google.com/macros/u/9/s/.../exec`

### Bước 6: Cập nhật URL trong HTML

1. Mở file `phieu_thu_chi.html`

2. Tìm dòng (khoảng dòng 2253):
   ```javascript
   const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbymzvpxnbdqRF5Io8KTDQrE-DIcw-3XF4Jbp-ohgEx3mEy2vMsFztbskUJKml0OujT9/exec';
   ```

3. Thay thế URL cũ bằng **Web App URL mới** vừa copy:
   ```javascript
   const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/YOUR_NEW_SCRIPT_ID/exec';
   ```

4. **Lưu file**

### Bước 7: Kiểm tra Deployment

1. Mở `phieu_thu_chi.html` trong browser
2. Mở **Developer Console** (F12)
3. Submit form để test
4. Xem console logs:
   - ✅ Nếu thành công: `✅ Response received`
   - ❌ Nếu lỗi: Xem error message chi tiết

### Bước 8: Xem Execution Logs (nếu có lỗi)

1. Quay lại Google Apps Script
2. Click **"Executions"** (menu bên trái)
3. Click vào execution mới nhất
4. Xem logs để debug:
   - ✅ Success logs
   - ❌ Error messages

---

## 🔍 Troubleshooting

### ❌ Lỗi: "You do not have access to library 1iiT-o7Q1DFEGaKBEUgTSJAaCcd2z9n5Nj9zul8YZglYFoysHBvwLa1KX"

**Nguyên nhân:** Project có reference đến một library không còn tồn tại hoặc không có quyền truy cập.

**Giải pháp:**

1. **Mở Google Apps Script project**
2. **Click menu bên trái:** "Libraries" (hoặc "Libraries" ở thanh menu trên)
3. **Tìm library có ID:** `1iiT-o7Q1DFEGaKBEUgTSJAaCcd2z9n5Nj9zul8YZglYFoysHBvwLa1KX`
4. **Click icon X** (xóa) hoặc **"Remove"** để xóa library
5. **Hoặc:** Click vào library → "Remove library"
6. **Lưu project** (Ctrl+S)
7. **Thử deploy lại** (Bước 5)

**Lưu ý:** 
- Code hiện tại **KHÔNG cần** library này
- Việc xóa library sẽ không ảnh hưởng đến chức năng
- Code chỉ sử dụng các built-in Google Apps Script services (SpreadsheetApp, GmailApp, etc.)

### ❌ Lỗi: "Sorry, unable to open the file"
- ✅ **Giải pháp:** Deploy lại Web App (Bước 5)
- ✅ Đảm bảo chọn "Anyone" trong "Who has access"

### Lỗi: "Authorization required"
- ✅ **Giải pháp:** Chạy function bất kỳ và authorize (Bước 4)

### Lỗi: "Cannot access spreadsheet"
- ✅ **Giải pháp:** 
  - Kiểm tra Spreadsheet ID đúng chưa
  - Kiểm tra Google Sheet có share với Apps Script account không

### Lỗi: "CORS error" hoặc "Network error"
- ✅ **Giải pháp:**
  - Đảm bảo deployment chọn "Anyone"
  - Kiểm tra Web App URL đúng chưa (có `/exec` ở cuối)
  - Thử deploy lại với version mới

### Lỗi: "Invalid action"
- ✅ **Giải pháp:**
  - Kiểm tra `doPost` function có xử lý action `'sendApprovalEmail'` chưa
  - Xem logs trong "Executions"

---

## ✅ Checklist

- [ ] Đã copy code từ `VOUCHER_WORKFLOW_BACKEND.gs` vào Google Apps Script
- [ ] Đã check cấu hình Spreadsheet ID
- [ ] Đã authorize permissions
- [ ] Đã deploy as Web App với "Anyone" access
- [ ] Đã copy Web App URL (không có `/u/9/`)
- [ ] Đã cập nhật URL trong `phieu_thu_chi.html`
- [ ] Đã test submit form và xem console logs
- [ ] Form hoạt động bình thường

---

## 📞 Nếu vẫn gặp lỗi

1. Mở Developer Console (F12)
2. Submit form lại
3. Copy toàn bộ error message từ console
4. Copy execution logs từ Google Apps Script → Executions
5. Gửi cho IT support với thông tin trên

