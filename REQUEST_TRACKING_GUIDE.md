# Hướng dẫn Request Tracking và History cho Workflow Phiếu Thu/Chi

## 📋 Tổng quan

Hệ thống tự động lưu và tracking tất cả các requests và history của workflow Phiếu Thu/Chi vào Google Sheets.

---

## 🔄 Flow Tracking

### 1. Khi Submit Request (Gửi yêu cầu phê duyệt)

**Trigger:** User click "Gửi yêu cầu phê duyệt" trong `phieu_thu_chi.html`

**Backend:** `handleSendEmail()` → `appendHistory_()`

**Dữ liệu được lưu:**
```javascript
{
  voucherNumber: "TL-202512-0489",
  voucherType: "Chi",
  company: "CÔNG TY TNHH EGG VENTURES",
  employee: "Nguyễn Văn Chinh",
  amount: "1000000",
  status: "Pending",
  action: "Submit",
  by: "Nguyễn Văn Chinh",
  note: "Lý do chi phí",
  requestorEmail: "chinh.nguyen@mediainsider.vn",
  approverEmail: "linh.le@tl-c.com.vn",
  timestamp: "2025-12-26 10:30:00",
  meta: {
    voucherDate: "2025-12-26",
    department: "Phòng Kinh doanh",
    payeeName: "Người nhận",
    timestamp: "2025-12-26T10:30:00.000Z",
    actionType: "Submit",
    status: "Pending"
  }
}
```

**Lưu vào:** Sheet "Voucher_History" trong TLCG Master Data

---

### 2. Khi Approve Request (Phê duyệt)

**Trigger:** Approver click "Approve" trong email hoặc `approve_voucher.html`

**Backend:** `handleApproveVoucher()` → `appendHistory_()`

**Dữ liệu được lưu:**
```javascript
{
  voucherNumber: "TL-202512-0489",
  voucherType: "Chi",
  company: "CÔNG TY TNHH EGG VENTURES",
  employee: "Nguyễn Văn Chinh",
  amount: "1000000",
  status: "Approved",
  action: "Approved",
  by: "linh.le@tl-c.com.vn",
  note: "",
  requestorEmail: "chinh.nguyen@mediainsider.vn",
  approverEmail: "linh.le@tl-c.com.vn",
  timestamp: "2025-12-26 11:00:00",
  meta: {
    timestamp: "2025-12-26T11:00:00.000Z",
    actionType: "Approved",
    status: "Approved"
  }
}
```

**Lưu vào:** Sheet "Voucher_History" (dòng mới)

**Email:** Gửi thông báo "Đã phê duyệt" đến requestor

---

### 3. Khi Reject Request (Từ chối)

**Trigger:** Approver click "Reject" trong email hoặc `reject_voucher.html`

**Backend:** `handleRejectVoucher()` → `appendHistory_()`

**Dữ liệu được lưu:**
```javascript
{
  voucherNumber: "TL-202512-0489",
  voucherType: "Chi",
  company: "CÔNG TY TNHH EGG VENTURES",
  employee: "Nguyễn Văn Chinh",
  amount: "1000000",
  status: "Rejected",
  action: "Rejected",
  by: "linh.le@tl-c.com.vn",
  note: "Lý do từ chối: Thiếu thông tin",
  requestorEmail: "chinh.nguyen@mediainsider.vn",
  approverEmail: "linh.le@tl-c.com.vn",
  timestamp: "2025-12-26 11:15:00",
  meta: {
    timestamp: "2025-12-26T11:15:00.000Z",
    actionType: "Rejected",
    status: "Rejected",
    rejectReason: "Lý do từ chối: Thiếu thông tin"
  }
}
```

**Lưu vào:** Sheet "Voucher_History" (dòng mới)

**Email:** Gửi thông báo "Đã từ chối" đến requestor

---

## 📊 Cấu trúc Sheet "Voucher_History"

### Headers (Tự động tạo)

| Cột | Tên | Mô tả | Ví dụ |
|-----|-----|-------|-------|
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
| M | MetaJSON | Metadata (JSON) | {"voucherDate":"2025-12-26",...} |

### Ví dụ dữ liệu:

```
VoucherNumber | VoucherType | Company | Employee | Amount | Status | Action | By | Note | RequestorEmail | ApproverEmail | Timestamp | MetaJSON
TL-202512-0489 | Chi | CÔNG TY TNHH EGG VENTURES | Nguyễn Văn Chinh | 1000000 | Pending | Submit | Nguyễn Văn Chinh | | chinh.nguyen@mediainsider.vn | linh.le@tl-c.com.vn | 2025-12-26 10:30:00 | {...}
TL-202512-0489 | Chi | CÔNG TY TNHH EGG VENTURES | Nguyễn Văn Chinh | 1000000 | Approved | Approved | linh.le@tl-c.com.vn | | chinh.nguyen@mediainsider.vn | linh.le@tl-c.com.vn | 2025-12-26 11:00:00 | {...}
```

**Lưu ý:** Mỗi action (Submit, Approve, Reject) tạo **1 dòng mới**, không update dòng cũ.

---

## 🔍 API để Lấy History

### 1. Lấy History của một Voucher cụ thể

**Action:** `getVoucherHistory`

**Request:**
```javascript
{
  action: 'getVoucherHistory',
  voucherNumber: 'TL-202512-0489'
}
```

**Response:**
```javascript
{
  success: true,
  message: 'History retrieved successfully',
  data: {
    voucherNumber: 'TL-202512-0489',
    history: [
      {
        voucherNumber: 'TL-202512-0489',
        voucherType: 'Chi',
        company: 'CÔNG TY TNHH EGG VENTURES',
        employee: 'Nguyễn Văn Chinh',
        amount: '1000000',
        status: 'Approved',
        action: 'Approved',
        by: 'linh.le@tl-c.com.vn',
        note: '',
        requestorEmail: 'chinh.nguyen@mediainsider.vn',
        approverEmail: 'linh.le@tl-c.com.vn',
        timestamp: '2025-12-26T11:00:00.000Z',
        timestampFormatted: '26/12/2025 11:00',
        meta: {...}
      },
      {
        voucherNumber: 'TL-202512-0489',
        status: 'Pending',
        action: 'Submit',
        timestamp: '2025-12-26T10:30:00.000Z',
        timestampFormatted: '26/12/2025 10:30',
        ...
      }
    ],
    totalEntries: 2
  }
}
```

**Sắp xếp:** Mới nhất trước (newest first)

---

### 2. Lấy tất cả Vouchers của một User

**Action:** `getUserVouchers`

**Request:**
```javascript
{
  action: 'getUserVouchers',
  userEmail: 'chinh.nguyen@mediainsider.vn',
  // hoặc
  employee: 'Nguyễn Văn Chinh'
}
```

**Response:**
```javascript
{
  success: true,
  message: 'User vouchers retrieved successfully',
  data: {
    userEmail: 'chinh.nguyen@mediainsider.vn',
    employeeName: '',
    vouchers: [
      {
        voucherNumber: 'TL-202512-0489',
        voucherType: 'Chi',
        company: 'CÔNG TY TNHH EGG VENTURES',
        employee: 'Nguyễn Văn Chinh',
        amount: '1000000',
        status: 'Approved',
        action: 'Approved',
        by: 'linh.le@tl-c.com.vn',
        timestamp: '2025-12-26T11:00:00.000Z',
        timestampFormatted: '26/12/2025 11:00',
        statusText: 'Approved'
      },
      {
        voucherNumber: 'TL-202512-0490',
        status: 'Pending',
        action: 'Submit',
        statusText: 'Đã gửi thông tin',
        ...
      }
    ],
    total: 2
  }
}
```

**Lưu ý:** 
- Chỉ trả về voucher **duy nhất** (latest status) cho mỗi voucher number
- Sắp xếp: Mới nhất trước

---

### 3. Lấy Summary (Đã có sẵn)

**Action:** `getVoucherSummary`

**Request:**
```javascript
{
  action: 'getVoucherSummary',
  userEmail: 'chinh.nguyen@mediainsider.vn', // Optional: filter by user
  employee: 'Nguyễn Văn Chinh' // Optional: filter by employee name
}
```

**Response:**
```javascript
{
  success: true,
  message: 'Summary retrieved successfully',
  data: {
    total: 10,
    pending: 3,
    approved: 5,
    rejected: 2,
    recent: [
      {
        voucherNumber: 'TL-202512-0489',
        voucherType: 'Chi',
        company: 'CÔNG TY TNHH EGG VENTURES',
        employee: 'Nguyễn Văn Chinh',
        amount: 1000000,
        status: 'Approved',
        action: 'Approved',
        by: 'linh.le@tl-c.com.vn',
        timestamp: '26/12/2025 11:00'
      },
      ...
    ]
  }
}
```

---

## 🛡️ Bảo vệ chống Double Processing

### Logic kiểm tra:

**Function:** `getLastActionForVoucher_(voucherNumber)`

**Cách hoạt động:**
1. Tìm tất cả entries của voucher number
2. Lấy action cuối cùng (latest timestamp)
3. Nếu action là "Approved" hoặc "Rejected" → **Không cho phép** approve/reject lại

**Code:**
```javascript
const lastAction = getLastActionForVoucher_(voucherNumber);
if (lastAction === 'Approved' || lastAction === 'Rejected') {
  return createResponse(false, 'Voucher already processed: ' + lastAction);
}
```

**Kết quả:**
- ✅ Submit có thể làm nhiều lần (nếu cần)
- ❌ Approve chỉ được làm 1 lần
- ❌ Reject chỉ được làm 1 lần

---

## 📈 Tracking Timeline

### Ví dụ Timeline của một Voucher:

```
1. 2025-12-26 10:30:00 - Submit
   - Action: Submit
   - Status: Pending
   - By: Nguyễn Văn Chinh
   - Email gửi đến: Approvers

2. 2025-12-26 11:00:00 - Approved
   - Action: Approved
   - Status: Approved
   - By: linh.le@tl-c.com.vn
   - Email gửi đến: Requestor

3. (Nếu reject)
   2025-12-26 11:15:00 - Rejected
   - Action: Rejected
   - Status: Rejected
   - By: linh.le@tl-c.com.vn
   - Note: "Lý do từ chối"
   - Email gửi đến: Requestor
```

---

## 🔧 Functions trong Backend

### Helper Functions:

1. **`appendHistory_(entry)`**
   - Lưu một entry vào Voucher_History
   - Tự động thêm timestamp và enhanced metadata

2. **`getLastActionForVoucher_(voucherNumber)`**
   - Lấy action cuối cùng của một voucher
   - Dùng để check duplicate approval/rejection

3. **`getVoucherHistory_(voucherNumber)`**
   - Lấy toàn bộ history của một voucher
   - Trả về array các entries, sorted by timestamp

4. **`getUserVouchers_(userEmail, employeeName)`**
   - Lấy tất cả vouchers của một user
   - Filter theo email hoặc employee name
   - Trả về unique vouchers với latest status

### Handler Functions:

1. **`handleGetVoucherHistory(requestBody)`**
   - API handler để lấy history của một voucher
   - Format timestamps cho display

2. **`handleGetUserVouchers(requestBody)`**
   - API handler để lấy vouchers của một user
   - Format timestamps và status text

---

## 💡 Best Practices

### 1. Luôn lưu đầy đủ thông tin:
- ✅ VoucherNumber (bắt buộc)
- ✅ RequestorEmail (bắt buộc)
- ✅ Timestamp (tự động)
- ✅ Action và Status (bắt buộc)

### 2. Metadata trong MetaJSON:
- Lưu thêm thông tin không có trong columns chính
- Ví dụ: voucherDate, department, payeeName, rejectReason

### 3. Error Handling:
- Tất cả functions đều có try-catch
- Log errors để debug
- Không fail toàn bộ request nếu history append fail

### 4. Performance:
- Sử dụng Map để group vouchers
- Sort một lần sau khi filter
- Limit recent vouchers (10 items)

---

## 📝 Checklist Setup

- [x] Sheet "Voucher_History" tự động tạo khi chạy lần đầu
- [x] Headers đúng format
- [x] `appendHistory_()` được gọi ở tất cả actions
- [x] `getLastActionForVoucher_()` check duplicate
- [x] API `getVoucherHistory` hoạt động
- [x] API `getUserVouchers` hoạt động
- [x] API `getVoucherSummary` filter theo user

---

## 🔗 Related Files

- **Backend:** `VOUCHER_WORKFLOW_BACKEND.gs`
  - Functions: `appendHistory_()`, `getVoucherHistory_()`, `getUserVouchers_()`
  - Handlers: `handleGetVoucherHistory()`, `handleGetUserVouchers()`

- **Frontend:** `tlcgroup-intranet.html`
  - Function: `loadCashSummary()` - gọi `getVoucherSummary`

- **Sheet Setup:** `GOOGLE_SHEETS_SETUP.md`
  - Hướng dẫn setup sheet "Voucher_History"

---

**Last Updated:** 2025-12-26
**Version:** 1.0

