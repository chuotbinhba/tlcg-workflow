# Hướng dẫn Setup Workflow trên Domain workflow.egg-ventures.com

## 📋 Tổng quan

Hướng dẫn này giúp bạn setup hệ thống workflow trên domain `https://workflow.egg-ventures.com`.

## ✅ Đã cấu hình sẵn

### 1. Google Apps Script URL
- ✅ Đã cập nhật URL mới trong tất cả các file:
  - `tlcgroup-intranet.html`
  - `phieu_thu_chi.html`
  - `approve_voucher.html`
  - `reject_voucher.html`
  - `script.js`

**URL hiện tại:**
```
https://script.google.com/macros/s/AKfycbwTbvtCOS5GVNCHDeRguD8CKnvIh0XeubKpke4_gdIizOvh_V24h3F2nwpyKnFos_Om/exec
```

### 2. Relative Paths
- ✅ Tất cả các file đã sử dụng relative paths:
  - `tlcgroup-intranet.html` → `phieu_thu_chi.html`
  - `phieu_thu_chi.html` → `tlcgroup-intranet.html`
  - Links trong email → `approve_voucher.html`, `reject_voucher.html`

## 🚀 Các bước Setup

### Bước 1: Upload Files lên Server

Upload tất cả các file sau lên thư mục root của domain `workflow.egg-ventures.com`:

**Files cần thiết:**
```
/
├── tlcgroup-intranet.html      # Trang chính
├── phieu_thu_chi.html          # Form tạo phiếu
├── approve_voucher.html         # Trang approve
├── reject_voucher.html         # Trang reject
└── script.js                   # (nếu có sử dụng)
```

### Bước 2: Kiểm tra Google Apps Script Deployment

1. Mở Google Apps Script project
2. Vào **Deploy** → **Manage deployments**
3. Đảm bảo deployment đang **Active**
4. Kiểm tra **Web app URL** khớp với URL trong code

### Bước 3: Cấu hình CORS (nếu cần)

Nếu gặp lỗi CORS, đảm bảo:

1. **Google Apps Script:**
   - Vào **Deploy** → **Manage deployments**
   - Chọn deployment → **Edit**
   - **Execute as:** Me
   - **Who has access:** Anyone (hoặc Anyone with Google account)
   - **Save** và **Deploy new version**

2. **Server Headers:**
   - Đảm bảo server không block CORS
   - Nếu cần, thêm headers trong `.htaccess` hoặc server config:
   ```apache
   Header set Access-Control-Allow-Origin "*"
   Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
   Header set Access-Control-Allow-Headers "Content-Type"
   ```

### Bước 4: Kiểm tra Links trong Email

Đảm bảo các links trong email approval/rejection trỏ đúng domain:

**Trong `phieu_thu_chi.html` (dòng ~3257-3282):**
```javascript
const approvalLink = `https://workflow.egg-ventures.com/approve_voucher.html?${params.toString()}`;
const rejectionLink = `https://workflow.egg-ventures.com/reject_voucher.html?${params.toString()}`;
```

**Kiểm tra:**
- ✅ Links đã sử dụng domain `workflow.egg-ventures.com`
- ✅ Không có hardcoded `localhost` hoặc domain cũ

### Bước 5: Test các chức năng

1. **Test Login:**
   - Truy cập: `https://workflow.egg-ventures.com/tlcgroup-intranet.html`
   - Đăng nhập với credentials hợp lệ
   - Kiểm tra session persistence

2. **Test Voucher Flow:**
   - Tạo phiếu mới
   - Submit để gửi approval
   - Kiểm tra email có nhận được không
   - Click vào link approve/reject trong email
   - Kiểm tra approval/rejection hoạt động đúng

3. **Test Navigation:**
   - Từ `tlcgroup-intranet.html` → Click "Open Vouchers"
   - Từ `phieu_thu_chi.html` → Click "Quay lại Intranet"
   - Kiểm tra các links hoạt động đúng

## 🔍 Troubleshooting

### Lỗi: "Cannot access Google Apps Script"
- **Nguyên nhân:** URL không đúng hoặc deployment chưa active
- **Giải pháp:** 
  1. Kiểm tra URL trong code khớp với Web App URL
  2. Đảm bảo deployment đang active
  3. Kiểm tra permissions của deployment

### Lỗi: "CORS policy"
- **Nguyên nhân:** Server hoặc Google Apps Script chưa cho phép CORS
- **Giải pháp:**
  1. Kiểm tra deployment settings (Who has access)
  2. Thêm CORS headers trên server (nếu cần)
  3. Đảm bảo sử dụng `mode: 'no-cors'` trong fetch requests

### Lỗi: "404 Not Found" khi click links
- **Nguyên nhân:** File không tồn tại hoặc path không đúng
- **Giải pháp:**
  1. Kiểm tra tất cả files đã được upload
  2. Kiểm tra paths trong code (relative paths)
  3. Kiểm tra server config (rewrite rules, etc.)

### Email không nhận được
- **Nguyên nhân:** 
  - Google Apps Script chưa có quyền gửi email
  - Email bị spam filter
- **Giải pháp:**
  1. Kiểm tra Google Apps Script có quyền Gmail không
  2. Kiểm tra spam folder
  3. Kiểm tra logs trong Google Apps Script Executions

## 📝 Checklist Setup

- [ ] Upload tất cả files lên server
- [ ] Kiểm tra Google Apps Script URL đúng
- [ ] Test login functionality
- [ ] Test voucher creation và submission
- [ ] Test email approval/rejection links
- [ ] Test navigation giữa các pages
- [ ] Kiểm tra console logs (F12) không có errors
- [ ] Kiểm tra Google Apps Script logs

## 🔗 Links quan trọng

- **Main Intranet:** `https://workflow.egg-ventures.com/tlcgroup-intranet.html`
- **Voucher Form:** `https://workflow.egg-ventures.com/phieu_thu_chi.html`
- **Approve Page:** `https://workflow.egg-ventures.com/approve_voucher.html`
- **Reject Page:** `https://workflow.egg-ventures.com/reject_voucher.html`
- **Google Apps Script:** `https://script.google.com/macros/s/AKfycbwTbvtCOS5GVNCHDeRguD8CKnvIh0XeubKpke4_gdIizOvh_V24h3F2nwpyKnFos_Om/exec`

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Browser console (F12) để xem errors
2. Google Apps Script Executions để xem logs
3. Server logs để xem requests

---

**Last Updated:** 2025-12-26
**Version:** 1.0

