# Hướng dẫn Test - Phiếu Thu/Chi

## 🚀 File để test

**File:** `phieu_thu_chi_auto_email_working (final).html`

Đây là file độc lập, tất cả code trong 1 file, dễ test nhất.

## ✅ Checklist Test

### 1. Test Cơ bản
- [ ] Mở file trong trình duyệt
- [ ] Form hiển thị đầy đủ
- [ ] Dropdown có dữ liệu (Công ty, Nhân viên, v.v.)
- [ ] Số phiếu tự động generate
- [ ] Ngày tự động điền

### 2. Test Validation
- [ ] Bỏ trống trường bắt buộc → Hiển thị lỗi màu đỏ
- [ ] Điền đúng → Border chuyển xanh
- [ ] Error message hiển thị dưới mỗi field
- [ ] Click "Lưu phiếu" khi thiếu thông tin → Hiển thị lỗi

### 3. Test Bảng Chi tiết
- [ ] Click "Thêm dòng" → Thêm dòng mới
- [ ] Nhập nội dung và số tiền
- [ ] Tổng cộng tự động tính
- [ ] Số tiền bằng chữ tự động cập nhật
- [ ] Click × để xóa dòng → Có confirmation dialog

### 4. Test File Upload
- [ ] Click "Đính kèm" → Chọn file
- [ ] Upload ảnh → Hiển thị thumbnail
- [ ] Click vào ảnh → Mở preview modal
- [ ] Upload PDF → Có nút Preview
- [ ] Click Preview → Mở PDF trong modal
- [ ] Upload file > 10MB → Hiển thị lỗi
- [ ] Click × trên file → Xóa file

### 5. Test Excel Import/Export
- [ ] Click "Dán từ Excel" → Dán dữ liệu từ clipboard
- [ ] Click "Nhập file Excel" → Chọn file Excel
- [ ] Click "Xuất Excel" → Tải file Excel với 3 sheets
- [ ] Mở file Excel → Kiểm tra dữ liệu đúng

### 6. Test Auto-save
- [ ] Điền một số thông tin
- [ ] Đợi 2 giây → Hiển thị "Đã lưu tự động"
- [ ] Refresh trang → Dữ liệu được khôi phục
- [ ] Indicator hiển thị "Đang lưu..." khi đang lưu

### 7. Test Template
- [ ] Điền đầy đủ form
- [ ] Click "Lưu Template" → Nhập tên template
- [ ] Clear form
- [ ] Click "Load Template" → Chọn template
- [ ] Dữ liệu được load lại

### 8. Test Search Dropdown
- [ ] Click vào dropdown "Công ty"
- [ ] Gõ tên công ty → Filter options
- [ ] Chọn option → Value được set
- [ ] Test với các dropdown khác (Nhân viên, Người phê duyệt)

### 9. Test Gửi Email (Google Apps Script)
- [ ] Điền đầy đủ form
- [ ] Chọn người phê duyệt
- [ ] Click "Gửi phê duyệt"
- [ ] Kiểm tra email đã được gửi
- [ ] Kiểm tra email có đầy đủ thông tin
- [ ] Kiểm tra email có bảng chi tiết

### 10. Test Google Sheets Sync
- [ ] Tạo Google Sheet mới
- [ ] Copy Spreadsheet ID từ URL
- [ ] Điền đầy đủ form
- [ ] Click "Đồng bộ với Google Sheets"
- [ ] Nhập Spreadsheet ID
- [ ] Kiểm tra dữ liệu đã được ghi vào sheet
- [ ] Kiểm tra sheet có header format đẹp
- [ ] Kiểm tra sheet chi tiết được tạo

### 11. Test PDF Export
- [ ] Điền đầy đủ form
- [ ] Click "Xuất PDF"
- [ ] File PDF được tải về
- [ ] Mở PDF → Kiểm tra format đúng

### 12. Test Toast Notifications
- [ ] Thực hiện các action → Toast hiển thị
- [ ] Toast tự động ẩn sau 5 giây
- [ ] Click × trên toast → Đóng ngay
- [ ] Toast có màu sắc đúng (success/error/info/warning)

### 13. Test Confirmation Dialogs
- [ ] Click × để xóa dòng → Hiển thị dialog
- [ ] Click "Hủy" → Không xóa
- [ ] Click "Xác nhận" → Xóa dòng

### 14. Test Error Handling
- [ ] Gửi email khi chưa cấu hình URL → Hiển thị cảnh báo
- [ ] Sync khi chưa có Sheets ID → Prompt nhập ID
- [ ] Sync khi sheet chưa share → Hiển thị lỗi rõ ràng

## 🐛 Các lỗi thường gặp khi test

### Lỗi: "Cannot access spreadsheet"
**Nguyên nhân:** Sheet chưa được share với Google Apps Script
**Giải pháp:** Share sheet với email Google Apps Script (quyền Editor)

### Lỗi: Email không được gửi
**Nguyên nhân:** 
- Google Apps Script chưa được cấp quyền Gmail
- URL chưa đúng
**Giải pháp:** 
- Kiểm tra quyền trong Google Apps Script
- Kiểm tra URL đã đúng chưa

### Lỗi: "Script timeout"
**Nguyên nhân:** Request quá lâu
**Giải pháp:** 
- Kiểm tra kết nối mạng
- Kiểm tra sheet đã share chưa
- Xem logs trong Google Apps Script

### Lỗi: Dữ liệu không khôi phục
**Nguyên nhân:** localStorage bị clear
**Giải pháp:** 
- Kiểm tra browser cho phép localStorage
- Không dùng chế độ Incognito

## 📝 Test Cases Chi tiết

### Test Case 1: Tạo phiếu mới hoàn chỉnh
1. Mở file
2. Chọn công ty
3. Chọn loại phiếu: "Chi"
4. Chọn nhân viên
5. Nhập người nộp/nhận
6. Chọn loại tiền: "VND"
7. Thêm 3 dòng chi tiết với số tiền
8. Upload file đính kèm
9. Nhập lý do
10. Chọn người phê duyệt
11. Click "Lưu phiếu"
12. **Expected:** Toast "Phiếu đã được lưu thành công!"

### Test Case 2: Gửi email phê duyệt
1. Điền đầy đủ form (theo Test Case 1)
2. Click "Gửi phê duyệt"
3. **Expected:** 
   - Loading indicator hiển thị
   - Email được gửi thành công
   - Toast "Đã gửi yêu cầu phê duyệt"
   - Trạng thái chuyển "Đã gửi phê duyệt"
   - Lịch sử phê duyệt được cập nhật

### Test Case 3: Đồng bộ Google Sheets
1. Tạo Google Sheet mới
2. Share với email Google Apps Script
3. Copy Spreadsheet ID
4. Điền đầy đủ form
5. Click "Đồng bộ với Google Sheets"
6. Nhập Spreadsheet ID
7. **Expected:**
   - Loading spinner hiển thị
   - Toast "Đã đồng bộ thành công"
   - Dữ liệu xuất hiện trong sheet
   - Sheet chi tiết được tạo

### Test Case 4: Template
1. Điền form với dữ liệu thường dùng
2. Click "Lưu Template" → Nhập tên "Template Test"
3. Clear toàn bộ form
4. Click "Load Template" → Chọn "Template Test"
5. **Expected:**
   - Tất cả dữ liệu được load lại
   - Bảng chi tiết được khôi phục

## ✅ Kết quả mong đợi

Sau khi test, bạn sẽ có:
- ✅ Form hoạt động mượt mà
- ✅ Validation real-time
- ✅ Auto-save hoạt động
- ✅ Email được gửi tự động
- ✅ Dữ liệu sync vào Google Sheets
- ✅ Tất cả tính năng mới hoạt động tốt

## 🎯 Next Steps sau khi test

1. Nếu có lỗi → Báo lại để fix
2. Nếu hoạt động tốt → Có thể deploy
3. Có thể tùy chỉnh thêm theo nhu cầu


