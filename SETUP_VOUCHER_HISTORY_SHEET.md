# Hướng dẫn Setup Sheet Voucher_History

## 📋 Thông tin Spreadsheet

**Spreadsheet ID:** `1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c`

**Link:** https://docs.google.com/spreadsheets/d/1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c/edit

**Sheet Name:** `Voucher_History`

---

## ✅ Đã cấu hình trong Code

**File:** `VOUCHER_WORKFLOW_BACKEND.gs`

```javascript
const VOUCHER_HISTORY_SHEET_ID = '1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c';
const VH_SHEET_NAME = 'Voucher_History';
```

**Lưu ý:** Sheet sẽ tự động được tạo với headers đúng khi chạy lần đầu.

---

## 📊 Cấu trúc Sheet "Voucher_History"

### Headers (Row 1)

| Cột | Header Name | Mô tả | Ví dụ |
|-----|-------------|-------|-------|
| A | VoucherNumber | Số phiếu | TL-202512-0489 |
| B | VoucherType | Loại phiếu | Chi / Thu |
| C | Company | Công ty | CÔNG TY TNHH EGG VENTURES |
| D | Employee | Người đề nghị | Nguyễn Văn Chinh |
| E | Amount | Số tiền | 1000000 |
| F | Status | Trạng thái | Pending / Approved / Rejected |
| G | Action | Hành động | Submit / Approved / Rejected |
| H | By | Người thực hiện | Nguyễn Văn Chinh / linh.le@tl-c.com.vn |
| I | Note | Ghi chú | Lý do từ chối (nếu có) |
| J | RequestorEmail | Email người đề nghị | chinh.nguyen@mediainsider.vn |
| K | ApproverEmail | Email người phê duyệt | linh.le@tl-c.com.vn |
| L | Timestamp | Thời gian | 2025-12-26 10:30:00 |
| M | MetaJSON | Metadata (JSON) | {"voucherDate":"2025-12-26","department":"Phòng Kinh doanh"} |

---

## 🔧 Cách Setup

### Option 1: Tự động tạo (Khuyến nghị)

1. **Không cần làm gì** - Sheet sẽ tự động được tạo khi:
   - Submit voucher đầu tiên
   - Hoặc gọi function `getVoucherHistorySheet_()` lần đầu

2. **Headers sẽ tự động được tạo** với format đúng

### Option 2: Tạo thủ công

1. **Mở spreadsheet:** https://docs.google.com/spreadsheets/d/1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c/edit

2. **Tạo sheet mới:**
   - Click "+" ở bottom tabs
   - Đặt tên: `Voucher_History`

3. **Thêm headers (Row 1):**
   ```
   A1: VoucherNumber
   B1: VoucherType
   C1: Company
   D1: Employee
   E1: Amount
   F1: Status
   G1: Action
   H1: By
   I1: Note
   J1: RequestorEmail
   K1: ApproverEmail
   L1: Timestamp
   M1: MetaJSON
   ```

4. **Format headers:**
   - Select Row 1
   - Bold (Ctrl+B / Cmd+B)
   - Background color: Blue (#4285F4)
   - Text color: White
   - Center align

5. **Freeze Row 1:**
   - View → Freeze → 1 row

---

## 📝 Template Data (Ví dụ)

### Row 2 (Ví dụ Submit):

```
A2: TL-202512-0489
B2: Chi
C2: CÔNG TY TNHH EGG VENTURES
D2: Nguyễn Văn Chinh
E2: 1000000
F2: Pending
G2: Submit
H2: Nguyễn Văn Chinh
I2: Chi phí văn phòng tháng 12
J2: chinh.nguyen@mediainsider.vn
K2: linh.le@tl-c.com.vn
L2: 2025-12-26 10:30:00
M2: {"voucherDate":"2025-12-26","department":"Phòng Kinh doanh","payeeName":"Người nhận","timestamp":"2025-12-26T10:30:00.000Z","actionType":"Submit","status":"Pending"}
```

### Row 3 (Ví dụ Approved):

```
A3: TL-202512-0489
B3: Chi
C3: CÔNG TY TNHH EGG VENTURES
D3: Nguyễn Văn Chinh
E3: 1000000
F3: Approved
G3: Approved
H3: linh.le@tl-c.com.vn
I3: 
J3: chinh.nguyen@mediainsider.vn
K3: linh.le@tl-c.com.vn
L3: 2025-12-26 11:00:00
M3: {"timestamp":"2025-12-26T11:00:00.000Z","actionType":"Approved","status":"Approved"}
```

---

## 🎨 Formatting Recommendations

### Headers (Row 1):
- **Font:** Bold
- **Background:** #4285F4 (Blue)
- **Text Color:** #FFFFFF (White)
- **Alignment:** Center
- **Freeze:** Row 1

### Data Rows:
- **Amount (Column E):** Number format: `#,##0`
- **Timestamp (Column L):** Date format: `dd/mm/yyyy HH:mm`
- **Status (Column F):** Conditional formatting:
  - Pending → Yellow background (#FFF8E1)
  - Approved → Green background (#E8F5E9)
  - Rejected → Red background (#FFEBEE)

---

## 🔍 Kiểm tra Setup

### 1. Kiểm tra Sheet tồn tại:
- Mở spreadsheet
- Kiểm tra có sheet "Voucher_History" không
- Nếu chưa có, sẽ tự động tạo khi submit voucher đầu tiên

### 2. Kiểm tra Headers:
- Row 1 phải có đúng 13 cột headers
- Headers phải đúng tên (case-sensitive)

### 3. Kiểm tra Permissions:
- Google Apps Script phải có quyền Editor trên spreadsheet
- Share spreadsheet với Google Apps Script service account nếu cần

### 4. Test:
- Submit một voucher test
- Kiểm tra sheet "Voucher_History" có dòng mới không
- Kiểm tra dữ liệu có đúng không

---

## 📊 Sample Data để Test

Nếu muốn thêm dữ liệu mẫu để test, có thể copy vào sheet:

```
VoucherNumber	VoucherType	Company	Employee	Amount	Status	Action	By	Note	RequestorEmail	ApproverEmail	Timestamp	MetaJSON
TL-202512-0489	Chi	CÔNG TY TNHH EGG VENTURES	Nguyễn Văn Chinh	1000000	Pending	Submit	Nguyễn Văn Chinh	Chi phí văn phòng	chinh.nguyen@mediainsider.vn	linh.le@tl-c.com.vn	2025-12-26 10:30:00	{"voucherDate":"2025-12-26","department":"Phòng Kinh doanh"}
TL-202512-0490	Thu	CÔNG TY TNHH TƯ VẤN TLC	Lê Thùy Linh	2000000	Approved	Approved	linh.le@tl-c.com.vn		linh.le@tl-c.com.vn	linh.le@tl-c.com.vn	2025-12-26 09:00:00	{"timestamp":"2025-12-26T09:00:00.000Z","actionType":"Approved","status":"Approved"}
```

---

## 🔗 Links

- **Spreadsheet:** https://docs.google.com/spreadsheets/d/1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c/edit
- **Sheet ID:** `1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c`
- **GID:** `757118994` (có thể là sheet ID của một sheet khác)

---

**Last Updated:** 2025-12-26
**Version:** 1.0

