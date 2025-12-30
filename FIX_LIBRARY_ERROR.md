# 🔧 Fix Library Error - Remove Unused Library

## ❌ Lỗi
```
You do not have access to library 1iiT-o7Q1DFEGaKBEUgTSJAaCcd2z9n5Nj9zul8YZglYFoysHBvwLa1KX, 
used by your script, or it has been deleted.
```

## ✅ Giải pháp: Xóa Library không cần thiết

### Bước 1: Mở Google Apps Script Project

1. Truy cập: https://script.google.com
2. Mở project có lỗi này

### Bước 2: Xóa Library

**Cách 1: Qua Menu Libraries**

1. Click **"Libraries"** ở menu bên trái (biểu tượng 📚)
2. Tìm library có ID: `1iiT-o7Q1DFEGaKBEUgTSJAaCcd2z9n5Nj9zul8YZglYFoysHBvwLa1KX`
3. Click icon **❌** (Xóa) bên cạnh library
4. Xác nhận xóa

**Cách 2: Qua Project Settings**

1. Click **"Project Settings"** (⚙️ icon) ở menu bên trái
2. Scroll xuống phần **"Libraries"**
3. Tìm library có ID trên
4. Click **"Remove"** hoặc icon X
5. Xác nhận xóa

**Cách 3: Qua Code Editor (nếu có reference trong code)**

1. Mở file `Code.gs` hoặc file có chứa library reference
2. Tìm dòng có dạng:
   ```javascript
   // @OnlyCurrentDoc
   // @libraryId=1iiT-o7Q1DFEGaKBEUgTSJAaCcd2z9n5Nj9zul8YZglYFoysHBvwLa1KX
   ```
3. **Xóa** các dòng comment này
4. Lưu file (Ctrl+S)

### Bước 3: Xác nhận

1. **Lưu project** (Ctrl+S hoặc Cmd+S)
2. **Kiểm tra:**
   - Không còn error message về library
   - Project có thể save được
   - Code có thể run được

### Bước 4: Deploy lại (nếu cần)

Nếu đã deploy trước đó, có thể cần deploy lại:

1. Click **"Deploy"** → **"Manage deployments"**
2. Click icon **✏️** (Edit) ở deployment hiện tại
3. Chọn **"New version"**
4. Click **"Deploy"**

---

## ✅ Xác nhận Code không cần Library

Code trong `VOUCHER_WORKFLOW_BACKEND.gs` **KHÔNG sử dụng** library này. 

Code chỉ sử dụng các **built-in Google Apps Script services**:
- ✅ `SpreadsheetApp` - Để đọc/ghi Google Sheets
- ✅ `GmailApp` - Để gửi email
- ✅ `DriveApp` - Để upload files (nếu có)
- ✅ `Utilities` - Để hash passwords, encode/decode
- ✅ `ContentService` - Để trả về JSON response
- ✅ `Logger` - Để log debug

**Không cần thêm library bên ngoài.**

---

## 🔍 Nếu vẫn gặp lỗi

1. **Kiểm tra lại Libraries:**
   - Vào "Libraries" menu
   - Đảm bảo không còn library nào
   - Hoặc chỉ giữ các library thực sự cần thiết

2. **Tạo Project mới (nếu cần):**
   - Tạo project hoàn toàn mới
   - Copy code từ `VOUCHER_WORKFLOW_BACKEND.gs`
   - Deploy lại từ đầu

3. **Kiểm tra Code:**
   - Search trong code: `1iiT-o7Q1DFEGaKBEUgTSJAaCcd2z9n5Nj9zul8YZglYFoysHBvwLa1KX`
   - Nếu tìm thấy → Xóa reference đó

---

## 📝 Checklist

- [ ] Đã xóa library từ menu "Libraries"
- [ ] Đã check "Project Settings" → "Libraries" (không còn library)
- [ ] Đã search trong code (không có reference)
- [ ] Project có thể save được (không còn error)
- [ ] Có thể run function test (ví dụ: doGet)
- [ ] Có thể deploy được

