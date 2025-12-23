# Hướng dẫn Debug - Email không được gửi

## 🔍 Các bước kiểm tra

### Bước 1: Mở Console để xem logs
1. Mở file HTML trong trình duyệt
2. Nhấn **F12** (hoặc **Cmd+Option+I** trên Mac) để mở Developer Tools
3. Chuyển sang tab **Console**
4. Điền form và click "Gửi phê duyệt"
5. Xem các log messages bắt đầu với `=== DEBUG EMAIL ===`

### Bước 2: Kiểm tra thông tin hiển thị

Bạn sẽ thấy các thông tin sau trong console:
- `Selected Approver`: Tên người phê duyệt đã chọn
- `Company Name`: Tên công ty đã chọn
- `Company Data`: Dữ liệu công ty (có thể null)
- `Approver Email`: Email người phê duyệt (có thể undefined)
- `Director Email`: Email đại diện pháp luật
- `Chief Accountant Email`: Email kế toán trưởng
- `Final Recipients`: Danh sách email cuối cùng sẽ nhận

### Bước 3: Các trường hợp lỗi thường gặp

#### ❌ Lỗi: "Approver Email: undefined"
**Nguyên nhân:** Tên người phê duyệt không khớp với key trong `approverEmailMap`

**Giải pháp:**
1. Kiểm tra tên người phê duyệt trong dropdown
2. So sánh với tên trong code (dòng ~1150)
3. Đảm bảo tên khớp chính xác (kể cả dấu, khoảng trắng)

#### ❌ Lỗi: "Company Data: null"
**Nguyên nhân:** Tên công ty không khớp với dữ liệu

**Giải pháp:**
1. Kiểm tra tên công ty trong dropdown
2. So sánh với `data.companies_data` trong code
3. Đảm bảo tên khớp chính xác

#### ❌ Lỗi: "Final Recipients: []"
**Nguyên nhân:** Không tìm thấy email nào hợp lệ

**Giải pháp:**
1. Kiểm tra xem có email nào được tìm thấy không
2. Kiểm tra format email (phải có @ và domain)
3. Đảm bảo dữ liệu công ty có email

### Bước 4: Kiểm tra Google Apps Script

1. Mở https://script.google.com
2. Chọn project của bạn
3. Click tab **"Executions"**
4. Xem logs của lần chạy gần nhất
5. Kiểm tra có lỗi gì không

### Bước 5: Test Google Apps Script trực tiếp

1. Trong Google Apps Script editor
2. Chọn hàm `doGet` từ dropdown
3. Click **"Run"**
4. Nếu thành công → Script hoạt động
5. Nếu có lỗi → Xem error message

## 🛠️ Cách sửa nhanh

### Nếu không tìm thấy email người phê duyệt:

**Option 1: Thêm email vào code**
Tìm dòng ~1150, thêm email vào `approverEmailMap`:
```javascript
const approverEmailMap = {
    "Lê Ngân Anh": "anh.le@mediainsider.vn",
    "Tên Người Phê Duyệt": "email@example.com", // Thêm dòng này
    // ...
};
```

**Option 2: Kiểm tra dữ liệu công ty**
Đảm bảo trong `data.companies_data` có:
- `"Email Đại diện pháp luật"`
- `"Email Kế toán trưởng"`

### Nếu Google Apps Script không nhận được request:

1. Kiểm tra URL đúng chưa
2. Kiểm tra deployment đã active chưa
3. Kiểm tra quyền truy cập (phải là "Anyone" hoặc "Anyone with Google account")

## 📋 Checklist Debug

- [ ] Console hiển thị logs
- [ ] Có "Selected Approver" với tên đúng
- [ ] Có "Approver Email" không phải undefined
- [ ] Có "Company Data" không phải null
- [ ] "Final Recipients" có ít nhất 1 email
- [ ] Email có format hợp lệ (có @ và domain)
- [ ] Google Apps Script URL đúng
- [ ] Google Apps Script đã được deploy
- [ ] Google Apps Script có quyền gửi email

## 🔧 Quick Fix

Nếu vẫn không được, thử cách này:

1. **Tạm thời hardcode email để test:**
   Tìm dòng `const approverEmail = approverEmailMap[selectedApproverName];`
   Thay bằng:
   ```javascript
   const approverEmail = approverEmailMap[selectedApproverName] || 'your-test-email@example.com';
   ```

2. **Kiểm tra Google Apps Script logs:**
   - Mở script.google.com
   - Xem tab "Executions"
   - Xem có error gì không

3. **Test với email đơn giản:**
   Thử gửi đến 1 email đơn giản trước để xem Google Apps Script có hoạt động không

## 💡 Tips

- Luôn mở Console khi test để xem logs
- Kiểm tra cả tab "Network" trong Developer Tools để xem request có được gửi không
- Nếu thấy request trong Network nhưng không có email → Vấn đề ở Google Apps Script
- Nếu không thấy request trong Network → Vấn đề ở JavaScript


