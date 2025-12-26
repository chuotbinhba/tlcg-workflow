# Hướng dẫn Update Code Google Apps Script

## File cần update
- **File trong Google Apps Script:** `Code.gs`
- **File local:** `VOUCHER_WORKFLOW_BACKEND.gs`

## Các thay đổi quan trọng cần kiểm tra:

### 1. Function `handleSendEmail()` - Xử lý email cho requester
**Dòng 244-354:** Đảm bảo có logic:
- Priority 1: `requesterEmailData.to` từ frontend
- Priority 2: `voucher.requestorEmail` (fallback)
- Logging chi tiết để debug

### 2. Function `handleApproveVoucher()` - Gửi email thông báo phê duyệt
**Dòng 490-578:** Đảm bảo có:
- Validation `requestorEmail`
- Gửi email thông báo đến requester
- Logging chi tiết

### 3. Function `handleRejectVoucher()` - Gửi email thông báo từ chối
**Dòng 582-680:** Đảm bảo có:
- Validation `requestorEmail` và `rejectReason`
- Gửi email thông báo đến requester
- Logging chi tiết

### 4. Function `handleLogin_()` - Xử lý login
**Dòng 1002-1035:** Đảm bảo có function này trong `doPost` switch case

### 5. Function `handleGetVoucherSummary()` - Lấy summary cho dashboard
**Dòng 684-790:** Đảm bảo có function này trong `doPost` switch case

## Cách update:

1. Mở Google Apps Script: https://script.google.com/home/projects/1iiT-o7Q1DFEGaKBEUgTSJAaCcd2z9n5Nj9zul8YZglYFoysHBvwLa1KX/edit
2. Chọn file `Code.gs`
3. Select All (Ctrl+A / Cmd+A)
4. Copy toàn bộ code từ file `VOUCHER_WORKFLOW_BACKEND.gs`
5. Paste vào editor
6. Save (Ctrl+S / Cmd+S)
7. Deploy lại nếu cần

## Kiểm tra sau khi update:

1. Kiểm tra function `handleSendEmail()` có đầy đủ logic Priority 1 và Priority 2
2. Kiểm tra function `handleApproveVoucher()` có gửi email đến requester
3. Kiểm tra function `handleRejectVoucher()` có gửi email đến requester
4. Kiểm tra `doPost` có case `'login'` và `'getVoucherSummary'`

## Code đã được kiểm tra và đảm bảo:
✅ Logic xử lý requester email (Priority 1 & 2)
✅ Gửi email thông báo cho requester sau khi submit
✅ Gửi email thông báo phê duyệt/từ chối cho requester
✅ Logging chi tiết để debug
✅ Authentication functions
✅ Voucher summary functions

