# Debug - Email Phê duyệt không được gửi

## 🔍 Các bước kiểm tra

### Bước 1: Kiểm tra requestorEmail có được truyền không

1. Mở trang `approve_voucher.html`
2. Nhấn **F12** để mở Developer Tools
3. Chuyển sang tab **Console**
4. Click "Xác nhận phê duyệt"
5. Xem logs:
   - `Requestor Email:` - Phải có giá trị
   - Nếu là empty → Vấn đề ở URL parameters

### Bước 2: Kiểm tra URL parameters

Khi click link "Phê duyệt" trong email, URL phải có:
```
?requestorEmail=email@example.com&...
```

Nếu thiếu `requestorEmail` → Cần kiểm tra code tạo link trong email.

### Bước 3: Kiểm tra Google Apps Script Logs

1. Mở https://script.google.com
2. Chọn project của bạn
3. Click tab **"Executions"**
4. Xem logs của lần chạy gần nhất
5. Tìm:
   - `=== APPROVE VOUCHER ===`
   - `Requestor Email: ...`
   - `✅ Approval email sent successfully` hoặc `❌ Error sending email`

### Bước 4: Kiểm tra Email có được gửi không

1. Kiểm tra inbox của người đề nghị
2. Kiểm tra spam folder
3. Kiểm tra trong Gmail → Sent (nếu dùng Gmail)

## 🐛 Các lỗi thường gặp

### Lỗi: "Requestor email is required"
**Nguyên nhân:** `requestorEmail` không được truyền hoặc empty

**Giải pháp:**
1. Kiểm tra URL có `requestorEmail` parameter không
2. Kiểm tra code tạo link trong email có truyền `requestorEmail` không
3. Kiểm tra `employeeEmailMap` có email của người đề nghị không

### Lỗi: "Error sending email"
**Nguyên nhân:** 
- Gmail API không có quyền
- Email không hợp lệ
- Quota exceeded

**Giải pháp:**
1. Kiểm tra quyền Gmail trong Google Apps Script
2. Kiểm tra format email (phải có @ và domain)
3. Kiểm tra quota Gmail (100 emails/ngày cho free tier)

### Lỗi: requestorEmail là empty string
**Nguyên nhân:** Email không được tìm thấy trong `employeeEmailMap`

**Giải pháp:**
1. Kiểm tra tên người đề nghị có trong `employeeEmailMap` không
2. Thêm email vào `employeeEmailMap` nếu thiếu

## 🔧 Quick Fix

### Fix 1: Đảm bảo requestorEmail được truyền

Trong file `phieu_thu_chi_auto_email_working (final).html`, kiểm tra code tạo link:

```javascript
const queryParams = new URLSearchParams({
    voucherNumber: voucherNumber,
    voucherType: voucherType,
    company: companyName,
    employee: requestorName,
    amount: totalAmount,
    requestorEmail: requestorEmail || '',  // Đảm bảo có giá trị
    approverEmail: approverEmail || ''
});
```

### Fix 2: Thêm validation trong approve_voucher.html

Đã thêm validation để kiểm tra `requestorEmail` trước khi gửi.

### Fix 3: Kiểm tra Google Apps Script

Đảm bảo:
- Code đã được update với hàm `handleApproveVoucher`
- Đã deploy lại (chọn "New version")
- Có quyền Gmail

## 📝 Checklist Debug

- [ ] Console hiển thị `Requestor Email:` với giá trị
- [ ] URL có parameter `requestorEmail`
- [ ] Google Apps Script logs hiển thị `=== APPROVE VOUCHER ===`
- [ ] Google Apps Script logs hiển thị `Requestor Email: ...`
- [ ] Google Apps Script logs hiển thị `✅ Approval email sent successfully`
- [ ] Email đã được gửi (kiểm tra inbox/spam)
- [ ] Không có error trong Google Apps Script logs

## 🎯 Test lại

1. Gửi một phiếu mới
2. Click link "Phê duyệt" trong email
3. Mở Console (F12) → Xem logs
4. Click "Xác nhận phê duyệt"
5. Kiểm tra Google Apps Script logs
6. Kiểm tra email đã được gửi


