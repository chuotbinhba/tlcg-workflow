# Hướng dẫn Sử dụng Tính năng Trả lại / Từ chối Phiếu

## 📋 Tổng quan

Khi người phê duyệt phát hiện phiếu có sai sót, họ có thể **trả lại** phiếu để người đề nghị chỉnh sửa lại.

## 🔄 Quy trình

### 1. Người đề nghị gửi phiếu
- Điền form đầy đủ
- Click "Gửi phê duyệt"
- Email được gửi đến người phê duyệt

### 2. Người phê duyệt nhận email
- Email chứa thông tin phiếu đầy đủ
- Có 2 nút:
  - **✅ Phê duyệt** - Phê duyệt phiếu
  - **❌ Trả lại / Từ chối** - Trả lại để chỉnh sửa

### 3. Người phê duyệt trả lại phiếu
- Click nút **"❌ Trả lại / Từ chối"**
- Trang reject sẽ mở ra
- Điền **lý do trả lại** (bắt buộc)
- Click **"Xác nhận trả lại"**

### 4. Hệ thống tự động
- Gửi email thông báo đến người đề nghị
- Email chứa:
  - Thông tin phiếu
  - Lý do trả lại
  - Hướng dẫn chỉnh sửa

### 5. Người đề nghị nhận email
- Đọc lý do trả lại
- Chỉnh sửa phiếu theo yêu cầu
- Gửi lại yêu cầu phê duyệt

## 📁 Files liên quan

1. **`reject_voucher.html`** - Trang để người phê duyệt trả lại phiếu
2. **`google-apps-script-code.gs`** - Code xử lý reject và gửi email
3. **`phieu_thu_chi_auto_email_working (final).html`** - Form chính (đã có link reject)

## 🚀 Setup

### Bước 1: Đặt file reject_voucher.html
- Đặt file `reject_voucher.html` **cùng thư mục** với file HTML chính
- Hoặc host lên web server và update URL trong code

### Bước 2: Update Google Apps Script
- Copy code mới từ `google-apps-script-code.gs`
- Paste vào Google Apps Script editor
- Deploy lại (chọn "New version")

### Bước 3: Test
1. Gửi một phiếu test
2. Click link "Trả lại / Từ chối" trong email
3. Điền lý do và submit
4. Kiểm tra email thông báo đã được gửi

## 📧 Email thông báo trả lại

Email sẽ chứa:
- ✅ Thông tin phiếu đầy đủ
- ✅ Lý do trả lại (highlighted)
- ✅ Hướng dẫn chỉnh sửa
- ✅ Thông tin người trả lại

## 🎯 Các trường hợp sử dụng

### Trả lại vì:
- ❌ Thiếu thông tin
- ❌ Số tiền không đúng
- ❌ Cần bổ sung tài liệu
- ❌ Thông tin không hợp lệ
- ❌ Cần chỉnh sửa nội dung

### Phê duyệt khi:
- ✅ Thông tin đầy đủ
- ✅ Số tiền đúng
- ✅ Tài liệu đầy đủ
- ✅ Hợp lệ và đúng quy định

## 🔧 Customization

### Thay đổi URL reject
Trong file `phieu_thu_chi_auto_email_working (final).html`, tìm:
```javascript
const rejectionLink = `${baseUrl}/reject_voucher.html?...`;
```

Thay đổi thành URL của bạn nếu host ở nơi khác.

### Thay đổi email template
Trong `google-apps-script-code.gs`, tìm hàm `handleRejectVoucher` và chỉnh sửa `emailBodyHtml`.

## ⚠️ Lưu ý

1. **File reject_voucher.html phải accessible**
   - Nếu dùng local file → Phải cùng thư mục
   - Nếu host web → Update URL trong code

2. **Google Apps Script phải được deploy lại**
   - Sau khi update code
   - Chọn "New version" khi deploy

3. **Email người đề nghị phải đúng**
   - Đảm bảo `requestorEmail` có trong email map
   - Nếu không có → Email sẽ không được gửi

## 🐛 Troubleshooting

### Link reject không mở được
- Kiểm tra file `reject_voucher.html` có trong cùng thư mục không
- Kiểm tra URL trong code có đúng không

### Email thông báo không được gửi
- Kiểm tra Google Apps Script logs
- Kiểm tra `requestorEmail` có đúng không
- Kiểm tra quyền Gmail của Google Apps Script

### Lỗi khi submit reject
- Mở Console (F12) để xem lỗi
- Kiểm tra Google Apps Script URL đúng chưa
- Kiểm tra Google Apps Script đã được deploy chưa

## ✅ Checklist

- [ ] File `reject_voucher.html` đã được đặt đúng vị trí
- [ ] Google Apps Script code đã được update
- [ ] Google Apps Script đã được deploy lại
- [ ] Test gửi phiếu → Click reject → Điền lý do → Submit
- [ ] Email thông báo đã được gửi đến người đề nghị
- [ ] Email chứa đầy đủ thông tin và lý do trả lại


