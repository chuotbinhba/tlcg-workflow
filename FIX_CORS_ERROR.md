# 🔧 Fix CORS Error - Google Apps Script Deployment

## ❌ Lỗi hiện tại:
```
Access to fetch at 'https://script.google.com/macros/s/.../exec' from origin 
'https://workflow.egg-ventures.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Giải pháp:

### Bước 1: Đảm bảo Deployment Settings đúng

1. **Mở Google Apps Script:** https://script.google.com
2. **Click "Deploy"** → **"Manage deployments"**
3. **Click icon ✏️ (Edit)** ở deployment hiện tại
4. **Kiểm tra settings:**
   - ✅ **Execute as:** `Me (your-email@gmail.com)`
   - ✅ **Who has access:** `Anyone` ⚠️ QUAN TRỌNG!
5. **Click "Save"**

### Bước 2: Deploy lại với version mới

1. **Click "Deploy"** → **"New deployment"**
2. **Type:** Web app
3. **Settings:**
   - Description: `TLCG Voucher Workflow v1.1 (CORS fix)`
   - Execute as: `Me`
   - Who has access: `Anyone` ⚠️
4. **Click "Deploy"**
5. **Copy Web App URL mới**

### Bước 3: Cập nhật Code Backend (Đã được sửa)

Code đã được cập nhật để thêm CORS headers:
- ✅ `createResponse()` function đã có CORS headers
- ✅ `doGet()` function đã có CORS headers

**Nếu bạn chưa copy code mới:**
1. Mở file `VOUCHER_WORKFLOW_BACKEND.gs`
2. Copy toàn bộ code
3. Paste vào Google Apps Script
4. **Save** và **Deploy lại**

### Bước 4: Cập nhật URL trong Frontend

1. Mở file `phieu_thu_chi.html`
2. Tìm dòng 2253:
   ```javascript
   const GOOGLE_APPS_SCRIPT_WEB_APP_URL = '...';
   ```
3. Cập nhật với Web App URL mới từ Bước 2
4. **Lưu file**

### Bước 5: Clear Browser Cache

1. **Clear cache:** Ctrl+Shift+Delete (hoặc Cmd+Shift+Delete)
2. **Hoặc:** Hard refresh: Ctrl+F5 (hoặc Cmd+Shift+R)
3. **Hoặc:** Mở trang ở Incognito/Private mode

### Bước 6: Test lại

1. Mở `phieu_thu_chi.html`
2. Submit form
3. Mở **Developer Console** (F12)
4. Kiểm tra:
   - ✅ Không còn CORS error
   - ✅ Response được nhận thành công

---

## 🔍 Troubleshooting

### Vẫn gặp CORS error?

1. **Kiểm tra deployment:**
   - Đảm bảo "Who has access" = **"Anyone"** (KHÔNG phải "Only myself")
   - Thử deploy lại với version mới

2. **Kiểm tra URL:**
   - URL phải có `/exec` ở cuối
   - URL KHÔNG có `/u/9/` trong đường dẫn

3. **Kiểm tra code backend:**
   - Đảm bảo `createResponse()` có CORS headers
   - Xem Execution logs trong Google Apps Script

4. **Thử cách khác (nếu vẫn lỗi):**
   - Deploy lại project hoàn toàn mới
   - Hoặc contact Google support (CORS là vấn đề của Google Apps Script)

---

## 📝 Notes

- Google Apps Script Web Apps **nên tự động** handle CORS khi deploy với "Anyone"
- CORS headers trong code là **backup** để đảm bảo
- Nếu vẫn lỗi sau khi thử tất cả → Có thể là issue từ phía Google Apps Script

---

## ✅ Checklist

- [ ] Deployment settings: "Anyone" access
- [ ] Code backend đã có CORS headers
- [ ] Đã deploy lại với version mới
- [ ] URL đã được cập nhật trong frontend
- [ ] Đã clear browser cache
- [ ] Đã test lại và không còn CORS error
