# Hướng dẫn Test Voucher_History

## 🔍 Vấn đề

Voucher data được gửi từ frontend nhưng không thấy trong sheet Voucher_History.

## ✅ Test Functions

Đã tạo 3 functions test trong `VOUCHER_WORKFLOW_BACKEND.gs`:

### 1. `testVoucherHistorySheet()`

**Mục đích:** Kiểm tra sheet có tồn tại và có thể truy cập không

**Cách chạy:**
1. Mở Google Apps Script: https://script.google.com
2. Vào project "Phiếu Thu Chi - Email & Sheets Sync"
3. Chọn function `testVoucherHistorySheet`
4. Click **Run**
5. Xem logs trong **Executions**

**Kết quả mong đợi:**
```
=== TEST VOUCHER HISTORY SHEET START ===
VOUCHER_HISTORY_SHEET_ID: 1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c
VH_SHEET_NAME: Voucher_History
✅ Spreadsheet opened successfully
✅ Sheet found: Voucher_History
Sheet last row: X
Headers: VoucherNumber, VoucherType, Company, ...
```

### 2. `testAppendHistory()`

**Mục đích:** Test trực tiếp function `appendHistory_()` có hoạt động không

**Cách chạy:**
1. Chọn function `testAppendHistory`
2. Click **Run**
3. Xem logs

**Kết quả mong đợi:**
```
=== TEST APPEND HISTORY START ===
=== appendHistory_ START ===
✅ Sheet accessed successfully
✅ Row appended to sheet
✅ Last row in sheet: X
✅ TEST APPEND HISTORY SUCCESS
```

### 3. `setupVoucherHistorySheet()`

**Mục đích:** Setup/refresh sheet với headers và formatting

**Cách chạy:**
1. Chọn function `setupVoucherHistorySheet`
2. Click **Run**
3. Kiểm tra sheet đã được setup

---

## 📋 Checklist Debug

### Bước 1: Test Sheet Access

```javascript
// Chạy trong Apps Script editor
testVoucherHistorySheet()
```

**Kiểm tra:**
- [ ] Spreadsheet có mở được không?
- [ ] Sheet "Voucher_History" có tồn tại không?
- [ ] Headers có đúng không?
- [ ] Có dữ liệu cũ không?

### Bước 2: Test Append Function

```javascript
// Chạy trong Apps Script editor
testAppendHistory()
```

**Kiểm tra:**
- [ ] Function có chạy không?
- [ ] Có lỗi gì không?
- [ ] Row có được append không?
- [ ] Sheet có dòng mới không?

### Bước 3: Kiểm tra Logs từ Submit thực tế

1. Submit một voucher mới
2. Vào **Executions** trong Apps Script
3. Tìm execution mới nhất
4. Xem logs:

**Logs cần tìm:**
```
=== handleSendEmail START ===
voucher object: {...}
=== CHECKING VOUCHER DATA FOR HISTORY ===
✅ Voucher number found: TL-202512-XXXX
✅ Attempting to append history...
=== appendHistory_ START ===
✅ Sheet accessed successfully
✅ Row appended to sheet
✅ History appended successfully
```

**Nếu có lỗi:**
```
❌ ERROR appending history: [Error message]
History error name: [Error name]
History error message: [Error message]
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot open spreadsheet"

**Nguyên nhân:**
- Spreadsheet ID sai
- Apps Script không có quyền truy cập

**Giải pháp:**
1. Kiểm tra `VOUCHER_HISTORY_SHEET_ID` đúng chưa
2. Share spreadsheet với Apps Script service account
3. Đảm bảo Apps Script có quyền Editor

### Lỗi: "Sheet not found"

**Nguyên nhân:**
- Sheet chưa được tạo

**Giải pháp:**
1. Chạy `setupVoucherHistorySheet()`
2. Hoặc tạo sheet thủ công trong spreadsheet

### Lỗi: "Cannot read properties of null"

**Nguyên nhân:**
- Sheet không được access đúng cách
- SpreadsheetApp.openById() trả về null

**Giải pháp:**
1. Kiểm tra spreadsheet ID
2. Đảm bảo Apps Script có quyền
3. Thử chạy `testVoucherHistorySheet()` để debug

### Không có lỗi nhưng không có dòng mới

**Nguyên nhân:**
- `appendRow()` không throw error nhưng không append được
- Sheet bị protect
- Quota exceeded

**Giải pháp:**
1. Kiểm tra sheet có bị protect không
2. Kiểm tra quota của Google Sheets API
3. Thử append thủ công trong spreadsheet

---

## 📊 Kiểm tra Spreadsheet

1. **Mở spreadsheet:**
   https://docs.google.com/spreadsheets/d/1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c/edit

2. **Vào sheet "Voucher_History"**

3. **Kiểm tra:**
   - Headers có đúng không? (Row 1)
   - Có dòng dữ liệu nào không?
   - Dòng cuối cùng là gì?

4. **Nếu không có sheet:**
   - Chạy `setupVoucherHistorySheet()` trong Apps Script
   - Hoặc tạo sheet thủ công với tên "Voucher_History"

---

## 🔧 Quick Fix

Nếu vẫn không hoạt động, thử:

1. **Chạy setup:**
   ```javascript
   setupVoucherHistorySheet()
   ```

2. **Test append:**
   ```javascript
   testAppendHistory()
   ```

3. **Kiểm tra sheet:**
   ```javascript
   testVoucherHistorySheet()
   ```

4. **Submit voucher mới và kiểm tra logs**

---

## 📝 Test Data từ Console

**Voucher đã submit:**
- Number: TL-202512-8820
- Type: Chi
- Company: CÔNG TY TNHH EGG VENTURES
- Employee: Nguyễn Văn Chinh
- Amount: 10.050 ₫
- Requestor Email: chinh.nguyen@mediainsider.vn

**Payload đã gửi:**
- Action: sendApprovalEmail
- Voucher data: đầy đủ
- Response: status 0 (no-cors mode)

---

**Last Updated:** 2025-12-26  
**Next Step:** Chạy test functions trong Apps Script để tìm nguyên nhân

