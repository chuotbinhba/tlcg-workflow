# Fix Lỗi 401 (Unauthorized) - Google Apps Script

## 🔴 Lỗi
```
POST https://script.google.com/.../exec net::ERR_ABORTED 401 (Unauthorized)
```

## 🔍 Nguyên nhân

Lỗi 401 xảy ra khi:
1. **Deployment chưa được cấu hình đúng quyền truy cập**
2. **Deployment đã bị disable hoặc expired**
3. **URL không đúng hoặc deployment đã bị xóa**
4. **Cần authorize lại Google Apps Script**

## ✅ Giải pháp

### Giải pháp 1: Kiểm tra và Re-deploy (Khuyến nghị)

1. **Mở Google Apps Script:**
   - Truy cập: https://script.google.com
   - Tìm project của bạn

2. **Kiểm tra Deployment:**
   - Click **"Deploy"** → **"Manage deployments"**
   - Xem deployment hiện tại
   - Nếu có → Click icon **✏️ (Edit)**
   - Nếu không có → Tạo deployment mới

3. **Cấu hình Deployment:**
   - **Execute as**: `Me (your-email@tl-c.com.vn)`
   - **Who has access**: `Anyone` hoặc `Anyone with Google account`
   - **Important**: Phải chọn "Anyone" nếu muốn gửi từ bất kỳ đâu

4. **Deploy lại:**
   - Click **"Deploy"**
   - **Copy Web App URL mới** (nếu có)
   - **Lưu ý**: URL có thể thay đổi nếu tạo deployment mới

5. **Update URL trong HTML:**
   - Mở file HTML
   - Tìm `GOOGLE_APPS_SCRIPT_WEB_APP_URL`
   - Paste URL mới (nếu có)

### Giải pháp 2: Kiểm tra Quyền

1. **Kiểm tra quyền Google Apps Script:**
   - Mở project trong script.google.com
   - Click **"Run"** → Chọn hàm `doGet`
   - Click **"Run"**
   - Nếu yêu cầu authorize → Click **"Review Permissions"** → **"Allow"**

2. **Kiểm tra quyền Gmail:**
   - Đảm bảo đã cấp quyền gửi email
   - Nếu chưa → Chạy lại hàm `doGet` và authorize

### Giải pháp 3: Test URL trực tiếp

1. **Mở URL trong browser:**
   ```
   https://script.google.com/a/macros/tl-c.com.vn/s/AKfycbww9cmz_Fvy06pb3z2BSmXqWBkydbP-_Y4LAe9MWjg4uzzN7OBZ9FyVQ4hpVBE2aNLr/exec
   ```

2. **Nếu thấy:**
   - ✅ "Google Apps Script is running!" → URL hoạt động, vấn đề ở code
   - ❌ "401 Unauthorized" → Cần re-deploy
   - ❌ "404 Not Found" → URL sai hoặc deployment đã bị xóa

### Giải pháp 4: Tạo Deployment mới

1. **Xóa deployment cũ (nếu cần):**
   - Deploy → Manage deployments
   - Click **🗑️ (Delete)** trên deployment cũ

2. **Tạo deployment mới:**
   - Deploy → New deployment
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (quan trọng!)
   - Click **Deploy**

3. **Copy URL mới và update vào HTML**

## 🔧 Alternative: Sử dụng GET thay vì POST (Tạm thời)

Nếu vẫn không được, có thể thử dùng GET (nhưng không khuyến nghị cho production):

```javascript
// Thay vì POST, dùng GET với query params
const url = `${GOOGLE_APPS_SCRIPT_WEB_APP_URL}?action=sendApprovalEmail&data=${encodeURIComponent(JSON.stringify(payload))}`;
await fetch(url, { method: 'GET', mode: 'no-cors' });
```

**Lưu ý:** Cách này có giới hạn về kích thước data.

## 📋 Checklist

- [ ] Deployment đã được tạo
- [ ] "Who has access" = "Anyone"
- [ ] "Execute as" = "Me"
- [ ] Đã authorize Google Apps Script
- [ ] Đã authorize Gmail
- [ ] URL trong HTML đúng với deployment
- [ ] Test URL trực tiếp trong browser → Thấy message thành công

## 🎯 Quick Fix

**Cách nhanh nhất:**

1. Mở https://script.google.com
2. Tìm project
3. Deploy → Manage deployments
4. Nếu có deployment → Edit → Chọn "Anyone" → Deploy
5. Nếu không có → New deployment → Web app → "Anyone" → Deploy
6. Copy URL mới → Update vào HTML

## ⚠️ Lưu ý quan trọng

- **"Who has access"** PHẢI là **"Anyone"** hoặc **"Anyone with Google account"**
- Nếu chọn "Only myself" → Sẽ bị lỗi 401 khi gửi từ browser khác
- URL có thể thay đổi khi tạo deployment mới
- Mỗi lần update code, cần tạo "New version" trong deployment

## 🐛 Debug thêm

Nếu vẫn không được, kiểm tra:

1. **Console logs:**
   - Xem có log nào khác không
   - Kiểm tra request có được gửi không

2. **Network tab:**
   - F12 → Network tab
   - Click "Gửi phê duyệt"
   - Xem request có được gửi không
   - Xem response status code

3. **Google Apps Script Executions:**
   - script.google.com → Executions tab
   - Xem có request nào đến không
   - Xem có error gì không


