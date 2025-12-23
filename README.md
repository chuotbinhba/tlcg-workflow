# Phiếu Thu/Chi - Hệ Thống Kế Toán

## Cấu trúc file

Dự án đã được tổ chức lại thành các file riêng biệt để dễ bảo trì:

- **index.html** - File HTML chính chứa cấu trúc form
- **styles.css** - Tất cả CSS styles
- **script.js** - Tất cả JavaScript logic

## Tính năng

### ✅ Validation & UX Improvements
- Validation real-time với thông báo lỗi rõ ràng
- Visual feedback (màu đỏ/xanh cho trạng thái valid/invalid)
- Tự động scroll đến lỗi đầu tiên khi submit

### ✅ Auto-save
- Tự động lưu vào localStorage sau 2 giây không nhập
- Khôi phục dữ liệu khi tải lại trang
- Hiển thị trạng thái "Đang lưu..." và "Đã lưu tự động"

### ✅ Export Excel
- Xuất toàn bộ thông tin phiếu ra file Excel
- 3 sheets: Thông tin phiếu, Chi tiết chi phí, Lịch sử phê duyệt
- Tự động đặt tên file với số phiếu và ngày

### ✅ Code Organization
- Tách CSS và JavaScript ra file riêng
- Dễ bảo trì và phát triển
- Code structure rõ ràng

## Cách sử dụng

1. Mở file `index.html` trong trình duyệt
2. Điền form - dữ liệu sẽ tự động lưu
3. Sử dụng các nút:
   - **Lưu phiếu** - Lưu vào localStorage
   - **Gửi phê duyệt** - Gửi email qua Google Apps Script
   - **Xuất PDF** - Tạo file PDF
   - **Xuất Excel** - Tạo file Excel với đầy đủ thông tin
   - **Nhập từ Excel** - Import dữ liệu từ Excel

## Lưu ý

- File gốc: `phieu_thu_chi_auto_email_working (final).html` vẫn được giữ lại
- File mới: `index.html` là phiên bản đã được tổ chức lại
- Cần cấu hình Google Apps Script URL trong `script.js` để gửi email tự động

## Dependencies

- html2pdf.js - Xuất PDF
- XLSX (SheetJS) - Xử lý Excel
- Google Apps Script - Gửi email (cần cấu hình)

