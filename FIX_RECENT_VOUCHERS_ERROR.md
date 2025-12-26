# Fix: Recent Vouchers Error - "Cannot read properties of null (reading 'getSheetByName')"

## 🐛 Lỗi

Khi click vào **Cash & Admin** trên intranet, phần **Recent Vouchers** báo lỗi:
```
Error loading vouchers
Error getting summary: Cannot read properties of null (reading 'getSheetByName')
```

## ✅ Đã Fix

### 1. Cải thiện Error Handling trong `handleGetVoucherSummary()`

**File:** `VOUCHER_WORKFLOW_BACKEND.gs`

**Thay đổi:**
- Thêm logging chi tiết cho `VOUCHER_HISTORY_SHEET_ID` và `VH_SHEET_NAME`
- Thêm try-catch riêng cho việc access sheet
- Thêm validation để đảm bảo sheet không null
- Thêm logging số rows retrieved

**Code mới:**
```javascript
function handleGetVoucherSummary(requestBody) {
  try {
    Logger.log('=== GET VOUCHER SUMMARY ===');
    Logger.log('VOUCHER_HISTORY_SHEET_ID: ' + VOUCHER_HISTORY_SHEET_ID);
    Logger.log('VH_SHEET_NAME: ' + VH_SHEET_NAME);
    
    // ... filter parameters ...
    
    Logger.log('Attempting to get voucher history sheet...');
    let sheet;
    try {
      sheet = getVoucherHistorySheet_();
      Logger.log('✅ Sheet accessed successfully');
    } catch (sheetError) {
      Logger.log('❌ ERROR accessing sheet: ' + sheetError.toString());
      return createResponse(false, 'Error accessing voucher history sheet: ' + sheetError.message);
    }
    
    if (!sheet) {
      Logger.log('❌ ERROR: Sheet is null');
      return createResponse(false, 'Voucher history sheet not found. Please run setupVoucherHistorySheet() first.');
    }
    
    Logger.log('Getting data range from sheet...');
    const data = sheet.getDataRange().getValues();
    Logger.log('Data rows retrieved: ' + data.length);
    
    // ... rest of the function ...
  }
}
```

### 2. Đảm bảo `getVoucherHistorySheet_()` dùng `openById()`

**File:** `VOUCHER_WORKFLOW_BACKEND.gs`

**Code đã đúng:**
```javascript
function getVoucherHistorySheet_() {
  try {
    // Use SpreadsheetApp.openById instead of getActiveSpreadsheet for Web App
    const ss = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID);
    if (!ss) {
      Logger.log('❌ ERROR: Cannot open spreadsheet with ID: ' + VOUCHER_HISTORY_SHEET_ID);
      throw new Error('Cannot open spreadsheet. Please check VOUCHER_HISTORY_SHEET_ID.');
    }
    
    let sheet = ss.getSheetByName(VH_SHEET_NAME);
    // ... rest of the function ...
  }
}
```

---

## 🔧 Cách Fix

### Bước 1: Update Code trong Google Apps Script

1. **Mở Google Apps Script:**
   https://script.google.com

2. **Vào project "Phiếu Thu Chi - Email & Sheets Sync"**

3. **Copy code mới từ file `VOUCHER_WORKFLOW_BACKEND.gs`**
   - Select All (Ctrl+A / Cmd+A)
   - Copy
   - Paste vào `Code.gs` trong Apps Script
   - Save (Ctrl+S / Cmd+S)

4. **Deploy lại (nếu cần):**
   - Deploy → Manage deployments
   - Edit deployment → New version
   - Deploy

### Bước 2: Setup Sheet (nếu chưa có)

1. **Chạy function `setupVoucherHistorySheet()`:**
   - Chọn function `setupVoucherHistorySheet`
   - Click **Run**
   - Authorize nếu được hỏi
   - Kiểm tra logs

2. **Hoặc test sheet access:**
   - Chạy function `testVoucherHistorySheet()`
   - Xem logs để kiểm tra sheet có accessible không

### Bước 3: Test

1. **Submit một voucher mới**
2. **Vào intranet:** https://workflow.egg-ventures.com/tlcgroup-intranet.html
3. **Click "Cash & Admin"**
4. **Kiểm tra "Recent Vouchers" có hiển thị không**

---

## 🐛 Troubleshooting

### Lỗi: "Cannot open spreadsheet"

**Nguyên nhân:**
- `VOUCHER_HISTORY_SHEET_ID` sai
- Apps Script không có quyền truy cập spreadsheet

**Giải pháp:**
1. Kiểm tra `VOUCHER_HISTORY_SHEET_ID = '1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c'`
2. Share spreadsheet với Apps Script service account
3. Đảm bảo Apps Script có quyền Editor

### Lỗi: "Sheet is null"

**Nguyên nhân:**
- Sheet "Voucher_History" chưa được tạo

**Giải pháp:**
1. Chạy function `setupVoucherHistorySheet()` trong Apps Script
2. Hoặc tạo sheet thủ công trong spreadsheet

### Lỗi: "No vouchers found"

**Nguyên nhân:**
- Sheet có nhưng chưa có dữ liệu
- Hoặc filter quá strict

**Giải pháp:**
1. Submit một voucher mới
2. Kiểm tra sheet có dòng mới không
3. Kiểm tra filter parameters trong logs

---

## 📋 Checklist

- [ ] Code đã được update trong Google Apps Script
- [ ] `VOUCHER_HISTORY_SHEET_ID` đúng
- [ ] Sheet "Voucher_History" tồn tại
- [ ] Apps Script có quyền Editor trên spreadsheet
- [ ] Đã chạy `setupVoucherHistorySheet()` (nếu cần)
- [ ] Đã submit voucher mới để test
- [ ] Recent Vouchers hiển thị đúng

---

## 🔍 Debug Steps

### 1. Kiểm tra Logs trong Apps Script

1. Vào **Executions** trong Apps Script
2. Tìm execution mới nhất (khi click Cash & Admin)
3. Xem logs:

**Logs cần tìm:**
```
=== GET VOUCHER SUMMARY ===
VOUCHER_HISTORY_SHEET_ID: 1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c
VH_SHEET_NAME: Voucher_History
Attempting to get voucher history sheet...
✅ Sheet accessed successfully
Getting data range from sheet...
Data rows retrieved: X
```

**Nếu có lỗi:**
```
❌ ERROR accessing sheet: [Error message]
❌ ERROR: Sheet is null
```

### 2. Test Functions

**Test sheet access:**
```javascript
testVoucherHistorySheet()
```

**Test append:**
```javascript
testAppendHistory()
```

**Setup sheet:**
```javascript
setupVoucherHistorySheet()
```

---

## 📝 Notes

- **Spreadsheet ID:** `1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c`
- **Sheet Name:** `Voucher_History`
- **URL:** https://docs.google.com/spreadsheets/d/1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c/edit

---

**Last Updated:** 2025-12-26  
**Status:** Fixed - Cần update code trong Apps Script

