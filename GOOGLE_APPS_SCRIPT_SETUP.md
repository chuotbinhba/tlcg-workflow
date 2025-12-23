# Hướng dẫn Setup Google Apps Script

## 📋 Tổng quan

Google Apps Script cho phép ứng dụng web gửi email và đồng bộ dữ liệu vào Google Sheets tự động.

## 🚀 Bước 1: Tạo Google Apps Script Project

1. Truy cập: https://script.google.com
2. Click **"New Project"**
3. Đổi tên project: `Phiếu Thu Chi - Email & Sheets Sync`

## 📝 Bước 2: Copy Code

1. Mở file `google-apps-script-code.gs`
2. Copy **toàn bộ** nội dung
3. Paste vào file `Code.gs` trong Google Apps Script editor
4. Click **"Save"** (Ctrl+S / Cmd+S)

## 🔐 Bước 3: Cấp quyền

1. Click **"Run"** → Chọn hàm `doGet` → Click **"Run"**
2. Hệ thống sẽ yêu cầu cấp quyền
3. Click **"Review Permissions"**
4. Chọn tài khoản Google của bạn
5. Click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
6. Click **"Allow"** để cấp các quyền:
   - Gửi email qua Gmail
   - Truy cập Google Sheets
   - Chạy script

## 🌐 Bước 4: Deploy Web App

1. Click **"Deploy"** → **"New deployment"**
2. Click icon **⚙️** (Settings) bên cạnh "Select type"
3. Chọn **"Web app"**
4. Điền thông tin:
   - **Description**: `Phiếu Thu Chi Sync v1.0`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` (hoặc `Anyone with Google account` nếu muốn bảo mật hơn)
5. Click **"Deploy"**
6. **Copy Web App URL** (sẽ có dạng: `https://script.google.com/macros/s/.../exec`)

## 🔗 Bước 5: Cấu hình trong HTML

1. Mở file HTML (`phieu_thu_chi_auto_email_working (final).html`)
2. Tìm dòng:
   ```javascript
   const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Thay thế bằng Web App URL vừa copy:
   ```javascript
   const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```
4. Lưu file

## 📊 Bước 6: Tạo Google Sheets (cho Sync)

### Cách 1: Tự động tạo
- Khi click "Đồng bộ với Google Sheets" lần đầu, hệ thống sẽ tự động tạo sheet với header

### Cách 2: Tạo thủ công
1. Tạo Google Sheet mới tại: https://sheets.google.com
2. Copy **Spreadsheet ID** từ URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```
3. Khi click "Đồng bộ", nhập Spreadsheet ID vào prompt

### Cấu hình Sharing
- **Quan trọng**: Sheet phải được share với email của Google Apps Script
- Click **"Share"** → Thêm email Google Apps Script → Chọn **"Editor"**

## ✅ Bước 7: Test

### Test Email
1. Điền đầy đủ form
2. Click **"Gửi phê duyệt"**
3. Kiểm tra email đã được gửi

### Test Sheets Sync
1. Điền đầy đủ form
2. Click **"Đồng bộ với Google Sheets"**
3. Nhập Spreadsheet ID
4. Kiểm tra dữ liệu đã được ghi vào sheet

## 🐛 Troubleshooting

### Lỗi: "Cannot access spreadsheet"
- **Nguyên nhân**: Sheet chưa được share với Google Apps Script account
- **Giải pháp**: Share sheet với email Google Apps Script với quyền Editor

### Lỗi: "Script authorization required"
- **Nguyên nhân**: Chưa cấp quyền đầy đủ
- **Giải pháp**: Chạy lại hàm `doGet` và cấp quyền

### Lỗi: "Web app URL not found"
- **Nguyên nhân**: URL chưa được copy đúng hoặc deployment chưa hoàn tất
- **Giải pháp**: Kiểm tra lại URL và đảm bảo deployment đã thành công

### Email không được gửi
- Kiểm tra email người nhận có hợp lệ không
- Kiểm tra Google Apps Script có quyền gửi email không
- Xem logs trong Google Apps Script: **"Executions"** tab

### Dữ liệu không sync vào Sheets
- Kiểm tra Spreadsheet ID đúng chưa
- Kiểm tra sheet đã được share chưa
- Xem logs trong Google Apps Script để biết lỗi cụ thể

## 📝 Cấu trúc Sheet

### Sheet chính: "Phiếu Thu Chi"
Các cột:
1. Thời gian
2. Số phiếu
3. Loại phiếu
4. Ngày lập
5. Công ty
6. Người đề nghị
7. Bộ phận
8. Người nộp/nhận
9. Loại tiền
10. Tổng số tiền
11. Số tiền bằng chữ
12. Lý do
13. Người phê duyệt
14. Trạng thái
15. Số dòng chi tiết
16. Chi tiết (JSON)
17. Lịch sử phê duyệt (JSON)

### Sheet chi tiết: "Chi tiết [Số phiếu]"
Tự động tạo cho mỗi phiếu với các cột:
1. STT
2. Nội dung
3. Số tiền
4. Số file đính kèm

## 🔄 Update Script

Khi cần update code:
1. Sửa code trong Google Apps Script editor
2. Click **"Deploy"** → **"Manage deployments"**
3. Click icon **✏️** (Edit) bên cạnh deployment
4. Chọn **"New version"**
5. Click **"Deploy"**
6. URL sẽ giữ nguyên, không cần update trong HTML

## 🔒 Security Notes

- Web App URL có thể được share công khai nếu chọn "Anyone"
- Nên sử dụng "Anyone with Google account" để bảo mật hơn
- Không commit Web App URL vào public repository
- Thường xuyên kiểm tra logs trong "Executions" tab

## 📚 Tài liệu tham khảo

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [GmailApp API](https://developers.google.com/apps-script/reference/gmail/gmail-app)
- [SpreadsheetApp API](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app)

