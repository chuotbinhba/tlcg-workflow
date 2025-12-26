# Debug: Voucher_History không ghi khi Submit

## 🔍 Vấn đề

Khi Submit yêu cầu phê duyệt, không có hành động nào được ghi vào sheet `Voucher_History`.

## ✅ Đã thêm Logging

### 1. Trong `handleSendEmail()` (dòng 627-670)

Đã thêm logging chi tiết để debug:
- Log voucher object đầy đủ
- Log từng field của voucher
- Log khi bắt đầu append history
- Log khi hoàn thành hoặc có lỗi

### 2. Trong `appendHistory_()` (dòng 174-230)

Đã thêm logging chi tiết:
- Log entry data
- Log khi access sheet
- Log row data trước khi append
- Log sau khi append và verify

## 🔧 Cách Debug

### Bước 1: Submit một voucher test

1. Mở `phieu_thu_chi.html`
2. Điền đầy đủ form
3. Click "Gửi phê duyệt"
4. Mở Browser Console (F12) để xem logs

### Bước 2: Kiểm tra Google Apps Script Logs

1. Mở: https://script.google.com
2. Vào project "Phiếu Thu Chi - Email & Sheets Sync"
3. Vào **Executions** (bên trái)
4. Click vào execution mới nhất
5. Xem logs:

**Logs cần kiểm tra:**
```
=== handleSendEmail START ===
Full requestBody: {...}
voucher object: {...}
voucher.voucherNumber: TL-202512-XXXX
=== CHECKING VOUCHER DATA FOR HISTORY ===
✅ Voucher number found, attempting to append history...
=== appendHistory_ START ===
Entry data: {...}
✅ Sheet accessed successfully
Row data to append: [...]
✅ Row appended to sheet
✅ Last row in sheet: X
✅ History appended successfully
```

### Bước 3: Kiểm tra Sheet

1. Mở: https://docs.google.com/spreadsheets/d/1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c/edit
2. Vào sheet "Voucher_History"
3. Kiểm tra có dòng mới không

## 🐛 Các nguyên nhân có thể

### 1. Voucher Number không có

**Triệu chứng:**
```
⚠️ WARNING: voucher.voucherNumber is missing! Cannot append history.
```

**Nguyên nhân:**
- `voucherNumber` không được tạo trong frontend
- `voucherNumber` bị null/undefined

**Giải pháp:**
- Kiểm tra function tạo `voucherNumber` trong `phieu_thu_chi.html`
- Đảm bảo `voucherNumber` được set trước khi gửi payload

### 2. Sheet không được tạo/access

**Triệu chứng:**
```
❌ ERROR appending history: Cannot read properties of null (reading 'appendRow')
```

**Nguyên nhân:**
- Sheet "Voucher_History" chưa được tạo
- Spreadsheet ID sai
- Không có quyền truy cập spreadsheet

**Giải pháp:**
- Chạy function `setupVoucherHistorySheet()` trong Apps Script
- Kiểm tra `VOUCHER_HISTORY_SHEET_ID` đúng chưa
- Đảm bảo Apps Script có quyền Editor trên spreadsheet

### 3. Lỗi khi append row

**Triệu chứng:**
```
❌ ERROR appending history: [Error message]
```

**Nguyên nhân:**
- Row data không đúng format
- Sheet bị lock
- Quota exceeded

**Giải pháp:**
- Kiểm tra row data có đúng 13 columns không
- Kiểm tra sheet có bị protect không
- Kiểm tra quota của Google Sheets API

### 4. Voucher data không đầy đủ

**Triệu chứng:**
```
voucher object: {} hoặc {voucherNumber: null}
```

**Nguyên nhân:**
- Payload từ frontend không đầy đủ
- `requestBody.voucher` không được parse đúng

**Giải pháp:**
- Kiểm tra payload trong Browser Console
- Kiểm tra `doPost()` có parse đúng không

## 📋 Checklist Debug

- [ ] Voucher Number được tạo đúng trong frontend
- [ ] Payload có đầy đủ voucher data
- [ ] `handleSendEmail()` được gọi
- [ ] `voucher.voucherNumber` có giá trị
- [ ] `appendHistory_()` được gọi
- [ ] Sheet "Voucher_History" tồn tại
- [ ] Apps Script có quyền truy cập spreadsheet
- [ ] Row được append thành công
- [ ] Không có lỗi trong logs

## 🔧 Quick Fix

Nếu vẫn không hoạt động, thử:

1. **Chạy setup function:**
   ```javascript
   // Trong Apps Script editor
   setupVoucherHistorySheet()
   ```

2. **Test appendHistory_ trực tiếp:**
   ```javascript
   // Trong Apps Script editor
   function testAppendHistory() {
     appendHistory_({
       voucherNumber: 'TEST-001',
       voucherType: 'Chi',
       company: 'Test Company',
       employee: 'Test Employee',
       amount: '1000000',
       status: 'Pending',
       action: 'Submit',
       by: 'Test Employee',
       note: 'Test note',
       requestorEmail: 'test@example.com',
       approverEmail: 'approver@example.com'
     });
   }
   ```

3. **Kiểm tra sheet ID:**
   ```javascript
   // Trong Apps Script editor
   function checkSheet() {
     const ss = SpreadsheetApp.openById('1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c');
     const sheet = ss.getSheetByName('Voucher_History');
     Logger.log('Sheet exists: ' + (sheet !== null));
     if (sheet) {
       Logger.log('Last row: ' + sheet.getLastRow());
     }
   }
   ```

## 📞 Next Steps

1. Submit một voucher test
2. Kiểm tra logs trong Apps Script Executions
3. Copy logs và gửi để phân tích thêm
4. Kiểm tra sheet "Voucher_History" có dòng mới không

---

**Last Updated:** 2025-12-26
**Version:** 1.0

