# Fix - Email Phê duyệt không được gửi

## 🔴 Vấn đề
Sau khi approve từ người có thẩm quyền, không có email thông báo đến người đề nghị.

## ✅ Đã cập nhật
- ✅ URL Google Apps Script mới đã được update vào tất cả files
- ✅ Code Google Apps Script đã có logging chi tiết
- ✅ Code approve_voucher.html đã có validation

## 🔍 Các bước kiểm tra

### Bước 1: Kiểm tra Google Apps Script có code mới chưa

1. **Mở Google Apps Script:**
   - https://script.google.com
   - Chọn project của bạn

2. **Kiểm tra code:**
   - Tìm hàm `handleApproveVoucher`
   - Đảm bảo có logging: `Logger.log('=== APPROVE VOUCHER ===')`
   - Nếu không có → Cần copy code mới từ `google-apps-script-code.gs`

3. **Deploy lại:**
   - Deploy → Manage deployments
   - Edit deployment → New version
   - Deploy

### Bước 2: Kiểm tra requestorEmail có được truyền không

1. **Khi click "Phê duyệt" trong email:**
   - Mở Developer Tools (F12)
   - Tab Console
   - Xem logs:
     ```
     Requestor Email: email@example.com
     ```
   - Nếu empty → Vấn đề ở code tạo link

2. **Kiểm tra URL:**
   - URL phải có: `?requestorEmail=email@example.com&...`
   - Nếu thiếu → Vấn đề ở code tạo link trong email

### Bước 3: Kiểm tra Google Apps Script Logs

1. **Mở Executions:**
   - https://script.google.com
   - Tab "Executions"
   - Xem execution gần nhất

2. **Tìm logs:**
   ```
   === APPROVE VOUCHER ===
   Requestor Email: email@example.com
   Attempting to send email to: email@example.com
   ✅ Approval email sent successfully to: email@example.com
   ```

3. **Nếu thấy lỗi:**
   - `Error: Requestor email is missing` → requestorEmail không được truyền
   - `Error sending email: ...` → Vấn đề với Gmail API

### Bước 4: Kiểm tra Email

1. **Kiểm tra inbox người đề nghị:**
   - Inbox
   - Spam folder
   - All Mail

2. **Kiểm tra Gmail Sent:**
   - Nếu dùng Gmail → Kiểm tra Sent folder
   - Xem email có được gửi không

## 🐛 Các lỗi thường gặp

### Lỗi 1: "Requestor email is required"
**Nguyên nhân:** `requestorEmail` không được truyền hoặc empty

**Giải pháp:**
1. Kiểm tra URL có `requestorEmail` parameter không
2. Kiểm tra `employeeEmailMap` có email của người đề nghị không
3. Kiểm tra code tạo link trong email

### Lỗi 2: Email không được gửi nhưng không có error
**Nguyên nhân:** 
- Gmail quota exceeded
- Email bị spam filter
- Gmail API không có quyền

**Giải pháp:**
1. Kiểm tra Gmail quota (100 emails/ngày free tier)
2. Kiểm tra spam folder
3. Kiểm tra quyền Gmail trong Google Apps Script

### Lỗi 3: requestorEmail là empty string
**Nguyên nhân:** Email không được tìm thấy trong `employeeEmailMap`

**Giải pháp:**
1. Kiểm tra tên người đề nghị có trong `employeeEmailMap` không
2. Thêm email vào `employeeEmailMap` nếu thiếu
3. Kiểm tra tên có khớp chính xác không (kể cả dấu, khoảng trắng)

## 🔧 Quick Fix

### Fix 1: Đảm bảo Google Apps Script có code mới

1. Copy code từ `google-apps-script-code.gs`
2. Paste vào Google Apps Script editor
3. Deploy lại (New version)

### Fix 2: Kiểm tra requestorEmail trong code

Trong `phieu_thu_chi_auto_email_working (final).html`, tìm:
```javascript
const requestorEmail = employeeEmailMap[requestorName] || '';
```

Đảm bảo:
- `requestorName` có giá trị
- `employeeEmailMap` có key khớp với `requestorName`
- `requestorEmail` không phải empty string

### Fix 3: Test với email cụ thể

Tạm thời hardcode email để test:
```javascript
const requestorEmail = employeeEmailMap[requestorName] || 'test@example.com';
```

Nếu email được gửi → Vấn đề ở `employeeEmailMap`
Nếu vẫn không → Vấn đề ở Google Apps Script

## 📝 Checklist

- [ ] Google Apps Script URL đã được update
- [ ] Google Apps Script có hàm `handleApproveVoucher` với logging
- [ ] Google Apps Script đã được deploy lại
- [ ] Console logs hiển thị `Requestor Email:` với giá trị
- [ ] URL có parameter `requestorEmail`
- [ ] Google Apps Script logs hiển thị `=== APPROVE VOUCHER ===`
- [ ] Google Apps Script logs hiển thị `✅ Approval email sent successfully`
- [ ] Email đã được gửi (kiểm tra inbox/spam)

## 🎯 Test lại

1. **Gửi phiếu mới:**
   - Điền form đầy đủ
   - Click "Gửi phê duyệt"
   - Kiểm tra email được gửi

2. **Click "Phê duyệt" trong email:**
   - Mở Console (F12)
   - Xem `Requestor Email:` có giá trị không
   - Click "Xác nhận phê duyệt"

3. **Kiểm tra Google Apps Script:**
   - Xem Executions tab
   - Xem logs có `✅ Approval email sent successfully` không

4. **Kiểm tra email:**
   - Inbox người đề nghị
   - Spam folder
   - Gmail Sent (nếu dùng Gmail)

## 💡 Tips

- Luôn kiểm tra Google Apps Script logs trước
- Nếu logs không có → Request không đến được Google Apps Script
- Nếu logs có nhưng không gửi email → Vấn đề với Gmail API
- Nếu logs có và gửi email → Kiểm tra spam folder

