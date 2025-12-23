# Fix Links Phê duyệt / Từ chối trong Email

## 🔴 Vấn đề

Các nút "Phê duyệt" và "Từ chối" trong email không hoạt động vì:
- Link dùng `file://` khi mở file local
- Email client không thể mở `file://` links
- Cần host files lên web server

## ✅ Giải pháp

### Option 1: Host lên Web Server (Khuyến nghị)

1. **Upload các files lên web server:**
   - `phieu_thu_chi_auto_email_working (final).html`
   - `approve_voucher.html`
   - `reject_voucher.html`

2. **Update URL trong code:**
   - Tìm dòng tạo `baseUrl` trong file HTML
   - Thay bằng URL web server của bạn:
   ```javascript
   const baseUrl = 'https://your-domain.com/path/to/files';
   ```

3. **Test:**
   - Gửi email từ web version
   - Click link trong email
   - Links sẽ hoạt động

### Option 2: Dùng Google Apps Script để xử lý (Alternative)

Thay vì dùng HTML pages, có thể dùng Google Apps Script để xử lý trực tiếp qua URL parameters.

## 📁 Files cần có

1. **`approve_voucher.html`** ✅ Đã tạo
2. **`reject_voucher.html`** ✅ Đã tạo
3. **`phieu_thu_chi_auto_email_working (final).html`** ✅ Đã cập nhật

## 🔧 Cách hoạt động

### Khi click "Phê duyệt":
1. Mở `approve_voucher.html` với thông tin phiếu
2. Click "Xác nhận phê duyệt"
3. Gửi request đến Google Apps Script
4. Google Apps Script gửi email thông báo đến người đề nghị

### Khi click "Từ chối":
1. Mở `reject_voucher.html` với thông tin phiếu
2. Điền lý do trả lại
3. Click "Xác nhận trả lại"
4. Gửi request đến Google Apps Script
5. Google Apps Script gửi email thông báo đến người đề nghị

## 🚀 Quick Fix cho Local Testing

Nếu bạn muốn test local, có thể:

1. **Dùng ngrok hoặc localtunnel:**
   ```bash
   # Install ngrok
   ngrok http 8000
   
   # Hoặc localtunnel
   npx localtunnel --port 8000
   ```

2. **Host local với Python:**
   ```bash
   # Python 3
   python3 -m http.server 8000
   ```

3. **Update baseUrl trong code:**
   ```javascript
   const baseUrl = 'https://your-ngrok-url.ngrok.io';
   ```

## 📝 Update Google Apps Script

Đã thêm hàm `handleApproveVoucher()` vào Google Apps Script code.

**Cần làm:**
1. Copy code mới từ `google-apps-script-code.gs`
2. Paste vào Google Apps Script editor
3. Deploy lại (chọn "New version")

## ✅ Checklist

- [ ] Files `approve_voucher.html` và `reject_voucher.html` đã được tạo
- [ ] Code HTML đã được cập nhật với link mới
- [ ] Google Apps Script đã được update với hàm `handleApproveVoucher`
- [ ] Google Apps Script đã được deploy lại
- [ ] Files đã được host lên web server (hoặc dùng ngrok cho test)
- [ ] Test gửi email → Click link → Hoạt động

## 🎯 Best Practice

**Cho Production:**
- Host tất cả files lên web server
- Dùng HTTPS
- Update `baseUrl` thành URL production

**Cho Development:**
- Dùng ngrok/localtunnel
- Hoặc test trực tiếp trên web server staging


