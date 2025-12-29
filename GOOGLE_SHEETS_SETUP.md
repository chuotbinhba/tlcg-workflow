# Hướng dẫn Setup Google Sheets cho Workflow Phiếu Thu/Chi

## 📋 Tổng quan

Workflow Phiếu Thu/Chi cần **2 Google Spreadsheets**:

1. **TLCG Master Data** - Chứa thông tin nhân viên và lịch sử voucher
2. **Phiếu Thu Chi Main** - Chứa thông tin chi tiết các phiếu (optional, nếu dùng sync feature)

---

## 📊 1. TLCG Master Data Spreadsheet

### Thông tin Spreadsheet
- **Spreadsheet ID:** `1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g`
- **Đã cấu hình trong:** `VOUCHER_WORKFLOW_BACKEND.gs` (dòng 15)

### Sheets cần có:

#### A. Sheet "Nhân viên" (Bắt buộc)
**Tên sheet:** `Nhân viên`

**Cấu trúc cột:**
| Cột | Tên cột | Mô tả | Ví dụ |
|-----|---------|-------|-------|
| A | Email | Email đăng nhập | chinh.nguyen@mediainsider.vn |
| B | Password Hash | Mật khẩu đã hash (SHA-256) | 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8 |
| C | Tên | Tên đầy đủ | Nguyễn Văn Chinh |
| D | Chức vụ | Vị trí công việc | Manager |
| E | Phòng ban | Bộ phận | Phòng Kinh doanh |
| F | Công ty | Công ty làm việc | CÔNG TY TNHH EGG VENTURES |
| G | Điện thoại | Số điện thoại | 0901234567 |
| H | Employee ID | Mã nhân viên | EMP001 |

**Ví dụ dữ liệu:**
```
Email                              | Password Hash | Tên              | Chức vụ  | Phòng ban        | Công ty
chinh.nguyen@mediainsider.vn       | [hash]        | Nguyễn Văn Chinh | Manager  | Phòng Kinh doanh | CÔNG TY TNHH EGG VENTURES
linh.le@tl-c.com.vn                | [hash]        | Lê Thùy Linh     | Director | Ban Giám đốc     | CÔNG TY TNHH TƯ VẤN TLC
```

**Lưu ý:**
- Password Hash phải là SHA-256 hash của mật khẩu
- Có thể tạo hash bằng tool: `create_password_hash.html` hoặc online SHA-256 generator

#### B. Sheet "Voucher_History" (Tự động tạo)
**Tên sheet:** `Voucher_History`

**Cấu trúc cột (tự động tạo khi chạy lần đầu):**
| Cột | Tên cột | Mô tả | Ví dụ |
|-----|---------|-------|-------|
| A | VoucherNumber | Số phiếu | TL-202512-0489 |
| B | VoucherType | Loại phiếu | Chi / Thu |
| C | Company | Công ty | CÔNG TY TNHH EGG VENTURES |
| D | Employee | Người đề nghị | Nguyễn Văn Chinh |
| E | Amount | Số tiền | 1000000 |
| F | Status | Trạng thái | Pending / Approved / Rejected |
| G | Action | Hành động | Submit / Approved / Rejected |
| H | By | Người thực hiện | Nguyễn Văn Chinh |
| I | Note | Ghi chú | Lý do từ chối (nếu có) |
| J | RequestorEmail | Email người đề nghị | chinh.nguyen@mediainsider.vn |
| K | ApproverEmail | Email người phê duyệt | linh.le@tl-c.com.vn |
| L | Timestamp | Thời gian | 2025-12-26 10:30:00 |
| M | MetaJSON | Metadata (JSON) | {"voucherDate":"2025-12-26","department":"Phòng Kinh doanh"} |

**Lưu ý:**
- Sheet này sẽ **tự động được tạo** khi chạy function `getVoucherHistorySheet_()` lần đầu
- Không cần tạo thủ công
- Mỗi action (Submit, Approve, Reject) sẽ tạo 1 dòng mới

---

## 📊 2. Phiếu Thu Chi Main Spreadsheet (Optional)

### Khi nào cần?
- Nếu bạn muốn lưu thông tin chi tiết của từng phiếu vào một sheet riêng
- Nếu bạn muốn có báo cáo tổng hợp các phiếu
- Nếu bạn muốn export/import dữ liệu

### Cách tạo:

1. **Tạo Google Spreadsheet mới:**
   - Vào [Google Sheets](https://sheets.google.com)
   - Tạo spreadsheet mới
   - Đặt tên: "Phiếu Thu Chi - [Năm]" (ví dụ: "Phiếu Thu Chi - 2025")

2. **Lấy Spreadsheet ID:**
   - Mở spreadsheet vừa tạo
   - Copy ID từ URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
   - Ví dụ: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t`

3. **Cấu hình trong `phieu_thu_chi.html`:**
   - Tìm `GOOGLE_SHEETS_CONFIG` (khoảng dòng 1700)
   - Cập nhật:
   ```javascript
   const GOOGLE_SHEETS_CONFIG = {
       spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE', // Thay bằng Spreadsheet ID của bạn
       sheetName: 'Phiếu Thu Chi' // Tên sheet (có thể đổi)
   };
   ```

4. **Cấu trúc Sheet (tự động tạo):**
   - Sheet sẽ tự động được tạo với tên "Phiếu Thu Chi" (hoặc tên bạn chỉ định)
   - Headers tự động:
   
   | Cột | Tên cột | Mô tả |
   |-----|---------|-------|
   | A | Thời gian | Timestamp khi submit |
   | B | Số phiếu | VoucherNumber |
   | C | Loại phiếu | Chi / Thu |
   | D | Ngày lập | VoucherDate |
   | E | Công ty | Company |
   | F | Người đề nghị | Employee |
   | G | Bộ phận | Department |
   | H | Người nộp/nhận | PayeeName |
   | I | Loại tiền | Currency (VND) |
   | J | Tổng số tiền | TotalAmount |
   | K | Số tiền bằng chữ | AmountInWords |
   | L | Lý do | Reason |
   | M | Người phê duyệt | Approver |
   | N | Trạng thái | Status |
   | O | Số dòng chi tiết | ExpenseItems count |
   | P | Chi tiết (JSON) | ExpenseItems JSON |
   | Q | Lịch sử phê duyệt (JSON) | ApprovalHistory JSON |

5. **Detail Sheets (tự động tạo):**
   - Mỗi voucher có expense items sẽ tự động tạo sheet riêng
   - Tên sheet: `Chi tiết {VoucherNumber}` (ví dụ: "Chi tiết TL-202512-0489")
   - Cấu trúc:
   
   | STT | Nội dung | Số tiền | Số file đính kèm |
   |-----|----------|---------|------------------|
   | 1 | Chi phí văn phòng | 500000 | 0 |
   | 2 | Chi phí đi lại | 300000 | 2 |
   | ... | ... | ... | ... |
   | TỔNG CỘNG | | =SUM(...) | |

---

## 🔧 Setup Steps

### Bước 1: Tạo/Cấu hình TLCG Master Data

1. **Mở spreadsheet:** `1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g`
2. **Kiểm tra sheet "Nhân viên":**
   - Đảm bảo có đầy đủ cột: Email, Password Hash, Tên, Chức vụ, Phòng ban, Công ty, Điện thoại, Employee ID
   - Thêm dữ liệu nhân viên nếu chưa có
3. **Kiểm tra quyền truy cập:**
   - Share spreadsheet với Google Apps Script service account
   - Hoặc đảm bảo account chạy script có quyền Editor

### Bước 2: (Optional) Tạo Phiếu Thu Chi Main Spreadsheet

1. **Tạo spreadsheet mới:**
   ```
   Tên: "Phiếu Thu Chi - 2025"
   ```

2. **Lấy Spreadsheet ID:**
   - Copy ID từ URL
   - Ví dụ: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t`

3. **Cấu hình trong code:**
   - Mở `phieu_thu_chi.html`
   - Tìm `GOOGLE_SHEETS_CONFIG`
   - Cập nhật `spreadsheetId`

4. **Share spreadsheet:**
   - Share với Google Apps Script service account
   - Hoặc đảm bảo account chạy script có quyền Editor

### Bước 3: Test

1. **Test Voucher History:**
   - Submit một voucher
   - Kiểm tra sheet "Voucher_History" có dòng mới không
   - Kiểm tra status trong `tlcgroup-intranet.html` có load được không

2. **Test Main Sheet (nếu có):**
   - Submit một voucher
   - Kiểm tra sheet "Phiếu Thu Chi" có dòng mới không
   - Kiểm tra detail sheet có được tạo không

---

## 📝 Template Files

### Template 1: Sheet "Nhân viên"

**File:** `TEMPLATE_NHAN_VIEN.csv` (có thể tạo từ Google Sheets)

```csv
Email,Tên,Chức vụ,Phòng ban,Công ty,Điện thoại,Employee ID
chinh.nguyen@mediainsider.vn,Nguyễn Văn Chinh,Manager,Phòng Kinh doanh,CÔNG TY TNHH EGG VENTURES,0901234567,EMP001
linh.le@tl-c.com.vn,Lê Thùy Linh,Director,Ban Giám đốc,CÔNG TY TNHH TƯ VẤN TLC,0907654321,EMP002
```

**Lưu ý:** Password Hash cần tạo riêng (không có trong CSV template)

### Template 2: Sheet "Voucher_History"

**Không cần template** - Sheet sẽ tự động được tạo với headers đúng khi chạy lần đầu.

---

## 🔐 Permissions & Sharing

### Quyền cần thiết:

1. **Google Apps Script cần quyền:**
   - ✅ Read/Write Google Sheets
   - ✅ Send emails (Gmail)
   - ✅ Access to specific spreadsheets

2. **Cách cấp quyền:**
   - Khi chạy script lần đầu, Google sẽ yêu cầu authorize
   - Hoặc vào **Deploy** → **Manage deployments** → **Edit** → Chọn account có quyền

3. **Share Spreadsheets:**
   - Share với email của Google Apps Script service account
   - Hoặc share với account đang chạy script
   - Quyền: **Editor** (để có thể tạo sheets mới)

---

## 🐛 Troubleshooting

### Lỗi: "Cannot read properties of null (reading 'getSheetByName')"
- **Nguyên nhân:** Spreadsheet ID không đúng hoặc không có quyền truy cập
- **Giải pháp:**
  1. Kiểm tra Spreadsheet ID trong code
  2. Kiểm tra spreadsheet đã được share chưa
  3. Kiểm tra quyền của Google Apps Script account

### Lỗi: "Sheet 'Voucher_History' not found"
- **Nguyên nhân:** Sheet chưa được tạo
- **Giải pháp:** 
  - Chạy function `getVoucherHistorySheet_()` một lần để tự động tạo
  - Hoặc tạo thủ công sheet "Voucher_History" với headers đúng

### Lỗi: "Cannot access spreadsheet. Check ID & sharing"
- **Nguyên nhân:** Spreadsheet ID không đúng hoặc không có quyền
- **Giải pháp:**
  1. Kiểm tra Spreadsheet ID
  2. Share spreadsheet với Google Apps Script account
  3. Kiểm tra spreadsheet có tồn tại không

---

## 📊 Summary

### Spreadsheets cần có:

| Spreadsheet | Sheet Name | Tự động tạo? | Bắt buộc? |
|-------------|------------|--------------|-----------|
| TLCG Master Data | Nhân viên | ❌ | ✅ |
| TLCG Master Data | Voucher_History | ✅ | ✅ |
| Phiếu Thu Chi Main | Phiếu Thu Chi | ✅ | ❌ (Optional) |
| Phiếu Thu Chi Main | Chi tiết {VoucherNumber} | ✅ | ❌ (Auto) |

### IDs cần cấu hình:

1. **VOUCHER_WORKFLOW_BACKEND.gs:**
   - `USERS_SHEET_ID` = `1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c`
   - `VOUCHER_HISTORY_SHEET_ID` = `1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c` (cùng spreadsheet)

2. **phieu_thu_chi.html:**
   - `GOOGLE_SHEETS_CONFIG.spreadsheetId` = Spreadsheet ID của bạn (nếu dùng sync feature)

---

**Last Updated:** 2025-12-26
**Version:** 1.0

