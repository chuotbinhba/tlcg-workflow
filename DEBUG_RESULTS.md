# Kết quả Debug: Voucher_History không ghi khi Submit

## ✅ Đã test thành công

**Date:** 2025-12-26  
**Voucher Number:** TL-202512-3753  
**Status:** Submit thành công

---

## 📊 Kết quả từ Browser Debug

### 1. Frontend hoạt động đúng ✅

**Console Logs:**
```
✅ Voucher Number: TL-202512-3753
✅ Voucher data đầy đủ trong payload
✅ POST request đã được gửi đến Google Apps Script
✅ Response status: 0 (no-cors mode - bình thường)
```

**Payload gửi đi:**
```javascript
{
  action: 'sendApprovalEmail',
  email: {
    to: 'linh.le@tl-c.com.vn,anh.le@mediainsider.vn,nguyennhanh863@gmail.com',
    cc: '',
    subject: '[YÊU CẦU PHÊ DUYỆT] Phiếu Thu TL-202512-3753',
    body: '...' // HTML email với approval buttons
  },
  requesterEmail: {
    to: 'chinh.nguyen@mediainsider.vn',
    subject: '[THÔNG BÁO] Phiếu Thu TL-202512-3753 đã được gửi phê duyệt',
    body: '...' // HTML email không có buttons
  },
  voucher: {
    voucherNumber: 'TL-202512-3753',
    voucherType: 'Thu',
    company: 'CÔNG TY TNHH MEDIA INSIDER',
    employee: 'Nguyễn Văn Chinh',
    amount: '86.665 ₫',
    requestorEmail: 'chinh.nguyen@mediainsider.vn',
    approverEmail: 'linh.le@tl-c.com.vn',
    voucherDate: '2025-12-26',
    department: 'Phòng Kinh doanh',
    payeeName: 'Nguyễn Văn Chinh',
    reason: 'Test lần ##32'
  }
}
```

### 2. UI Update đúng ✅

- Status đã đổi từ "Pending" → **"Đã gửi thông tin"**
- Success message hiển thị: "Gửi thành công"
- Button "Gửi phê duyệt" đã disabled sau khi submit

---

## 🔍 Cần kiểm tra Backend

### Bước tiếp theo: Kiểm tra Google Apps Script Logs

1. **Mở Google Apps Script:**
   - https://script.google.com
   - Vào project "Phiếu Thu Chi - Email & Sheets Sync"

2. **Kiểm tra Executions:**
   - Vào **Executions** (bên trái)
   - Tìm execution mới nhất (voucher TL-202512-3753)
   - Click vào để xem logs

3. **Logs cần tìm:**

**Nếu hoạt động đúng, sẽ thấy:**
```
=== handleSendEmail START ===
Full requestBody: {...}
voucher object: {...}
voucher.voucherNumber: TL-202512-3753
=== CHECKING VOUCHER DATA FOR HISTORY ===
✅ Voucher number found: TL-202512-3753
✅ Attempting to append history...
=== appendHistory_ START ===
Entry data: {...}
✅ Sheet accessed successfully
Row data to append: [...]
✅ Row appended to sheet
✅ Last row in sheet: X
✅ History appended successfully
=== appendHistory_ END ===
✅ History append completed successfully
```

**Nếu có lỗi, sẽ thấy:**
```
❌ ERROR appending history: [Error message]
History error name: [Error name]
History error message: [Error message]
History error stack: [Stack trace]
```

---

## 🐛 Các nguyên nhân có thể

### 1. Sheet không được tạo/access

**Triệu chứng:**
```
❌ ERROR appending history: Cannot read properties of null (reading 'appendRow')
```

**Giải pháp:**
- Chạy function `setupVoucherHistorySheet()` trong Apps Script
- Kiểm tra `VOUCHER_HISTORY_SHEET_ID` đúng chưa
- Đảm bảo Apps Script có quyền Editor trên spreadsheet

### 2. Spreadsheet ID sai

**Triệu chứng:**
```
❌ ERROR: Cannot open spreadsheet with ID: ...
```

**Giải pháp:**
- Kiểm tra `VOUCHER_HISTORY_SHEET_ID = '1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c'`
- Đảm bảo ID đúng với spreadsheet hiện tại

### 3. Sheet name không đúng

**Triệu chứng:**
```
Sheet "Voucher_History" not found, creating new sheet...
```

**Giải pháp:**
- Sheet sẽ tự động được tạo nếu chưa có
- Kiểm tra sheet đã được tạo chưa trong spreadsheet

### 4. Quota exceeded

**Triệu chứng:**
```
❌ ERROR: Quota exceeded
```

**Giải pháp:**
- Đợi một chút rồi thử lại
- Kiểm tra quota của Google Sheets API

---

## ✅ Code đã được cải thiện

### 1. Frontend (`phieu_thu_chi.html`)
- ✅ Validation voucher number trước khi submit
- ✅ Auto-generate voucher number nếu thiếu
- ✅ Logging chi tiết voucher data
- ✅ Đảm bảo tất cả fields có giá trị mặc định

### 2. Backend (`VOUCHER_WORKFLOW_BACKEND.gs`)
- ✅ Luôn append history, kể cả khi voucherNumber thiếu (dùng fallback)
- ✅ Logging chi tiết từng bước
- ✅ Error handling tốt hơn
- ✅ Fallback voucher number: `AUTO-{timestamp}`

---

## 📋 Checklist Debug

- [x] Frontend submit thành công
- [x] Payload có đầy đủ voucher data
- [x] POST request đã được gửi đến Apps Script
- [ ] `handleSendEmail()` được gọi (cần check Apps Script logs)
- [ ] `voucher.voucherNumber` có giá trị (cần check Apps Script logs)
- [ ] `appendHistory_()` được gọi (cần check Apps Script logs)
- [ ] Sheet "Voucher_History" tồn tại (cần check spreadsheet)
- [ ] Row được append thành công (cần check spreadsheet)
- [ ] Không có lỗi trong Apps Script logs

---

## 🔧 Next Steps

1. **Kiểm tra Apps Script Executions:**
   - Xem logs chi tiết của execution mới nhất
   - Tìm các log messages về `appendHistory_`
   - Copy logs nếu có lỗi

2. **Kiểm tra Spreadsheet:**
   - Mở: https://docs.google.com/spreadsheets/d/1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c/edit
   - Vào sheet "Voucher_History"
   - Kiểm tra có dòng mới với voucher TL-202512-3753 không

3. **Nếu vẫn không có dòng mới:**
   - Chạy function `setupVoucherHistorySheet()` trong Apps Script
   - Test lại với một voucher mới
   - Gửi logs từ Apps Script để phân tích thêm

---

## 📝 Test Data

**Voucher Test:**
- Number: TL-202512-3753
- Type: Thu
- Company: CÔNG TY TNHH MEDIA INSIDER
- Employee: Nguyễn Văn Chinh
- Amount: 86.665 ₫
- Approver: Lê Thùy Linh
- Reason: Test lần ##32

---

**Last Updated:** 2025-12-26  
**Status:** Frontend OK, cần kiểm tra Backend logs

