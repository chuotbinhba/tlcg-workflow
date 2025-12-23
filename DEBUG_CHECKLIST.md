# Debug Checklist - Email Phê duyệt/Từ chối

## 📋 Checklist Debug từng bước

### ✅ Bước 1: Kiểm tra khi GỬI email phê duyệt

**Khi click "Gửi phê duyệt" trong form:**

1. Mở **Console** (F12)
2. Xem logs:
   ```
   === CREATING APPROVAL LINKS ===
   Requestor Name: Nguyễn Văn Chinh
   Requestor Email: chinh.nguyen@mediainsider.vn
   Approver Email: linh.le@tl-c.com.vn
   ```

3. **Kiểm tra:**
   - [ ] `Requestor Email:` có giá trị không?
   - [ ] `Approver Email:` có giá trị không?
   - [ ] Nếu empty → Vấn đề ở `employeeEmailMap` hoặc `approverEmailMap`

### ✅ Bước 2: Kiểm tra Link trong Email

**Khi nhận email phê duyệt:**

1. Mở email
2. Hover vào link "Phê duyệt" (không click)
3. Xem URL ở góc dưới browser (hoặc right-click → Copy link)
4. **Kiểm tra URL có:**
   ```
   ?requestorEmail=chinh.nguyen@mediainsider.vn&...
   ```
   - [ ] URL có parameter `requestorEmail`
   - [ ] `requestorEmail` có giá trị (không phải empty)
   - [ ] Nếu thiếu → Vấn đề ở code tạo link

### ✅ Bước 3: Kiểm tra khi MỞ trang Phê duyệt

**Khi click "Phê duyệt" trong email:**

1. Trang `approve_voucher.html` mở
2. Mở **Console** (F12)
3. Xem logs tự động:
   ```
   === APPROVE VOUCHER PAGE LOADED ===
   Full URL: https://...
   URL Parameters: {...}
   Requestor Email: chinh.nguyen@mediainsider.vn
   ✅ requestorEmail is valid: chinh.nguyen@mediainsider.vn
   ```
   - [ ] `Requestor Email:` có giá trị
   - [ ] Không có error `❌ ERROR: requestorEmail is empty!`
   - [ ] Nếu có error → Vấn đề ở URL parameters

### ✅ Bước 4: Kiểm tra khi CLICK "Xác nhận phê duyệt"

**Khi click nút "Xác nhận phê duyệt":**

1. Xem Console logs:
   ```
   === APPROVING VOUCHER ===
   Voucher Number: TL-202512-5931
   Requestor Email: chinh.nguyen@mediainsider.vn
   Approver Email: linh.le@tl-c.com.vn
   === SENDING APPROVAL REQUEST ===
   URL: https://script.google.com/...?action=approveVoucher&requestorEmail=...
   All Parameters: action=approveVoucher&voucherNumber=...&requestorEmail=...
   ```
   - [ ] URL có đầy đủ parameters
   - [ ] `requestorEmail` có trong URL
   - [ ] Không có error `❌ CRITICAL ERROR`

2. Xem **Network tab:**
   - [ ] Có request đến Google Apps Script
   - [ ] Request status: 200 hoặc (no-cors)
   - [ ] Nếu không có request → Vấn đề ở fetch

### ✅ Bước 5: Kiểm tra Google Apps Script Logs

**Trong Google Apps Script (https://script.google.com):**

1. Tab **"Executions"**
2. Xem execution gần nhất
3. **Kiểm tra logs:**

   **Nếu thành công:**
   ```
   === doGet called ===
   e.parameter: {"action":"approveVoucher","voucherNumber":"...","requestorEmail":"chinh.nguyen@mediainsider.vn",...}
   Action: approveVoucher
   Parsed requestorEmail: chinh.nguyen@mediainsider.vn
   Request body from GET: {"action":"approveVoucher","voucher":{...}}
   Calling handleApproveVoucher...
   === APPROVE VOUCHER ===
   Requestor Email: chinh.nguyen@mediainsider.vn
   Attempting to send email to: chinh.nguyen@mediainsider.vn
   ✅ Approval email sent successfully to: chinh.nguyen@mediainsider.vn
   ```

   **Nếu có lỗi:**
   ```
   ⚠️ WARNING: e.parameter.voucherNumber is missing!
   ```
   → Request không có parameters

   ```
   Error: Requestor email is missing or empty
   ```
   → `requestorEmail` không được parse

   ```
   Error sending email: ...
   ```
   → Vấn đề với Gmail API

### ✅ Bước 6: Kiểm tra Email đã được gửi

1. **Kiểm tra inbox người đề nghị:**
   - [ ] Inbox
   - [ ] Spam folder
   - [ ] All Mail

2. **Kiểm tra Gmail Sent (nếu dùng Gmail):**
   - [ ] Sent folder
   - [ ] Xem email có được gửi không

## 🔍 Các điểm cần kiểm tra

### Point 1: requestorEmail có được tìm thấy không?

**Kiểm tra trong Console khi gửi email:**
```javascript
// Chạy trong Console
console.log('Employee Email Map:', employeeEmailMap);
console.log('Requestor Name:', requestorName);
console.log('Requestor Email:', employeeEmailMap[requestorName]);
```

**Nếu `undefined`:**
- Tên người đề nghị không khớp với key trong `employeeEmailMap`
- Cần thêm email vào map

### Point 2: URL có đầy đủ parameters không?

**Kiểm tra URL khi click "Phê duyệt":**
- Copy URL từ address bar
- Paste vào text editor
- Kiểm tra có `requestorEmail=...` không

### Point 3: Google Apps Script có nhận được request không?

**Kiểm tra Executions tab:**
- Có execution mới không?
- Có logs `=== doGet called ===` không?
- Nếu không → Request không đến được

### Point 4: Email có được gửi không?

**Kiểm tra logs:**
- Có `✅ Approval email sent successfully` không?
- Có error `Error sending email` không?

## 🐛 Common Issues & Fixes

### Issue 1: requestorEmail empty trong Console

**Fix:**
1. Kiểm tra `employeeEmailMap` có key khớp với tên người đề nghị không
2. Thêm email vào map nếu thiếu
3. Đảm bảo tên khớp chính xác (kể cả dấu, khoảng trắng)

### Issue 2: URL không có requestorEmail

**Fix:**
1. Kiểm tra code tạo link trong `phieu_thu_chi_auto_email_working (final).html`
2. Đảm bảo `requestorEmail` có giá trị trước khi tạo URLSearchParams

### Issue 3: Google Apps Script không nhận được request

**Fix:**
1. Kiểm tra URL đúng chưa
2. Kiểm tra Network tab có request không
3. Kiểm tra deployment đã active chưa

### Issue 4: Email không được gửi mặc dù logs OK

**Fix:**
1. Kiểm tra spam folder
2. Kiểm tra Gmail quota (100 emails/ngày)
3. Kiểm tra quyền Gmail trong Google Apps Script

## 📝 Report Template

Khi báo lỗi, cung cấp:

1. **Console logs khi gửi email:**
   - Requestor Email: ...
   - Approver Email: ...

2. **Console logs khi mở approve_voucher.html:**
   - Requestor Email: ...
   - Có error không?

3. **Console logs khi click "Xác nhận phê duyệt":**
   - URL: ...
   - Có error không?

4. **Google Apps Script logs:**
   - Có `=== doGet called ===` không?
   - Có `Requestor Email: ...` không?
   - Có `✅ Approval email sent successfully` không?

5. **Email:**
   - Đã kiểm tra inbox/spam chưa?
   - Có email không?


