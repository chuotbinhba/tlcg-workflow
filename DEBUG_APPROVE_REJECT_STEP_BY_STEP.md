# Debug Step-by-Step - Email Phê duyệt/Từ chối không được gửi

## 🔍 Debug từng bước

### Bước 1: Kiểm tra khi click "Phê duyệt" trong email

1. **Mở Developer Tools:**
   - Nhấn **F12** trong browser
   - Tab **Console**

2. **Click link "Phê duyệt" trong email:**
   - Trang `approve_voucher.html` sẽ mở
   - Xem Console logs:
     ```
     Requestor Email: email@example.com
     Approver Email: email@example.com
     ```

3. **Kiểm tra:**
   - ✅ `Requestor Email:` có giá trị không?
   - ✅ `Approver Email:` có giá trị không?
   - ❌ Nếu empty → Vấn đề ở URL parameters

### Bước 2: Kiểm tra URL Parameters

Khi trang `approve_voucher.html` mở, kiểm tra URL trong address bar:

```
https://workflow.egg-ventures.com/approve_voucher.html?
  voucherNumber=TL-202512-5931&
  voucherType=Chi&
  company=...&
  employee=...&
  amount=...&
  requestorEmail=email@example.com&  ← PHẢI CÓ
  approverEmail=email@example.com
```

**Nếu thiếu `requestorEmail`:**
- Vấn đề ở code tạo link trong email
- Kiểm tra `employeeEmailMap` có email không

### Bước 3: Kiểm tra khi click "Xác nhận phê duyệt"

1. **Trong Console, xem logs:**
   ```
   === APPROVING VOUCHER ===
   Voucher Number: TL-202512-5931
   Requestor Email: email@example.com
   Approver Email: email@example.com
   Sending GET request to: https://script.google.com/...?action=approveVoucher&...
   Response received (no-cors mode)
   ```

2. **Kiểm tra:**
   - ✅ URL có đầy đủ parameters không?
   - ✅ `requestorEmail` có trong URL không?

### Bước 4: Kiểm tra Google Apps Script Logs

1. **Mở Google Apps Script:**
   - https://script.google.com
   - Chọn project của bạn
   - Tab **"Executions"**

2. **Xem execution gần nhất:**
   - Click vào execution mới nhất
   - Xem logs:

   **Nếu dùng GET (đúng):**
   ```
   === doGet called ===
   e.parameter: {"action":"approveVoucher","voucherNumber":"...","requestorEmail":"..."}
   Request body from GET: {"action":"approveVoucher","voucher":{...}}
   === APPROVE VOUCHER ===
   Requestor Email: email@example.com
   Attempting to send email to: email@example.com
   ✅ Approval email sent successfully to: email@example.com
   ```

   **Nếu thấy lỗi:**
   ```
   Error: Requestor email is missing or empty
   ```
   → `requestorEmail` không được truyền

### Bước 5: Kiểm tra Email có được gửi không

1. **Kiểm tra inbox người đề nghị:**
   - Inbox
   - Spam folder
   - All Mail

2. **Kiểm tra Gmail Sent (nếu dùng Gmail):**
   - Sent folder
   - Xem email có được gửi không

## 🐛 Các trường hợp lỗi và cách fix

### Lỗi 1: "Requestor Email:" là empty trong Console

**Nguyên nhân:** Email không được tìm thấy trong `employeeEmailMap`

**Fix:**
1. Kiểm tra tên người đề nghị trong code
2. Thêm email vào `employeeEmailMap` nếu thiếu
3. Đảm bảo tên khớp chính xác

### Lỗi 2: URL không có `requestorEmail` parameter

**Nguyên nhân:** Code tạo link không truyền `requestorEmail`

**Fix:**
Kiểm tra code tạo link trong `phieu_thu_chi_auto_email_working (final).html`:
```javascript
const queryParams = new URLSearchParams({
    ...
    requestorEmail: requestorEmail || '',  // Phải có giá trị
    ...
});
```

### Lỗi 3: Google Apps Script logs không có "=== doGet called ==="

**Nguyên nhân:** Request không đến được Google Apps Script

**Fix:**
1. Kiểm tra URL đúng chưa
2. Kiểm tra network tab trong Developer Tools
3. Kiểm tra có lỗi CORS không

### Lỗi 4: "Error: Requestor email is missing or empty" trong Google Apps Script

**Nguyên nhân:** `requestorEmail` không được parse từ GET parameters

**Fix:**
1. Kiểm tra code `doGet` có parse đúng không
2. Kiểm tra parameter name có đúng không

### Lỗi 5: "Error sending email" trong Google Apps Script

**Nguyên nhân:** 
- Gmail API không có quyền
- Email không hợp lệ
- Quota exceeded

**Fix:**
1. Kiểm tra quyền Gmail trong Google Apps Script
2. Kiểm tra format email
3. Kiểm tra quota (100 emails/ngày free tier)

## 📋 Checklist Debug

### Khi click "Phê duyệt":
- [ ] Console hiển thị `Requestor Email:` với giá trị
- [ ] URL có parameter `requestorEmail`
- [ ] Console hiển thị `Sending GET request to: ...`
- [ ] Network tab có request đến Google Apps Script

### Trong Google Apps Script:
- [ ] Logs có `=== doGet called ===`
- [ ] Logs có `e.parameter: ...` với đầy đủ data
- [ ] Logs có `Request body from GET: ...`
- [ ] Logs có `=== APPROVE VOUCHER ===`
- [ ] Logs có `Requestor Email: ...` với giá trị
- [ ] Logs có `✅ Approval email sent successfully`

### Email:
- [ ] Email đã được gửi (kiểm tra inbox/spam)
- [ ] Email có đầy đủ thông tin
- [ ] Email đến đúng người nhận

## 🔧 Quick Test

### Test 1: Kiểm tra requestorEmail có được truyền không

Trong Console khi mở `approve_voucher.html`:
```javascript
// Chạy trong Console
const urlParams = new URLSearchParams(window.location.search);
console.log('Requestor Email:', urlParams.get('requestorEmail'));
```

Nếu empty → Vấn đề ở code tạo link

### Test 2: Test Google Apps Script trực tiếp

Mở URL này trong browser (thay các giá trị):
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?
  action=approveVoucher&
  voucherNumber=TEST-001&
  voucherType=Chi&
  company=Test&
  employee=Test User&
  amount=1000000&
  requestorEmail=your-email@example.com&
  approverEmail=approver@example.com
```

Nếu thấy logs trong Google Apps Script → Code hoạt động
Nếu không → Vấn đề ở deployment hoặc code

### Test 3: Kiểm tra employeeEmailMap

Trong Console khi gửi email:
```javascript
// Xem employeeEmailMap
console.log('Employee Email Map:', employeeEmailMap);
console.log('Requestor Name:', requestorName);
console.log('Requestor Email:', employeeEmailMap[requestorName]);
```

Nếu `undefined` → Cần thêm email vào map

## 💡 Tips

1. **Luôn kiểm tra Console trước** - Xem requestorEmail có giá trị không
2. **Kiểm tra Google Apps Script logs** - Xem request có đến không
3. **Kiểm tra Network tab** - Xem request có được gửi không
4. **Test với email cụ thể** - Hardcode email để test

## 🎯 Next Steps

Sau khi debug, báo lại:
1. Console logs khi click "Phê duyệt"
2. Google Apps Script logs
3. Có thấy request trong Network tab không
4. requestorEmail có giá trị không


