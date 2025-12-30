# 🚨 URGENT: Fix CORS Error - Google Apps Script

## ⚠️ Vấn đề:
Google Apps Script Web Apps có giới hạn với CORS. Headers được set trong code có thể không hoạt động đúng cách.

## ✅ GIẢI PHÁP ĐÚNG:

### Bước 1: Kiểm tra Deployment Settings (QUAN TRỌNG NHẤT)

1. **Mở Google Apps Script:** https://script.google.com
2. **Click "Deploy"** → **"Manage deployments"**
3. **Click icon ✏️ (Edit)** ở deployment hiện tại
4. **PHẢI đảm bảo:**
   - ✅ **Execute as:** `Me (your-email@gmail.com)`
   - ✅ **Who has access:** `Anyone` ⚠️⚠️⚠️ **BẮT BUỘC PHẢI LÀ "ANYONE"**
5. **Click "Save"**

### Bước 2: Deploy Lại (Bắt buộc)

**Google Apps Script chỉ tự động handle CORS khi deploy với "Anyone" access**

1. **Click "Deploy"** → **"New deployment"**
2. **Click icon ⚙️ (Settings)** bên cạnh "Select type"
3. **Chọn "Web app"**
4. **Settings:**
   - Description: `TLCG Voucher v1.2 (CORS fix)`
   - Execute as: `Me`
   - **Who has access: `Anyone`** ⚠️⚠️⚠️
5. **Click "Deploy"**
6. **Authorize** nếu được hỏi
7. **Copy Web App URL mới**

### Bước 3: Cập nhật Code trong Google Apps Script

1. **Mở file `VOUCHER_WORKFLOW_BACKEND.gs`** trong folder này
2. **Copy toàn bộ code**
3. **Paste vào Google Apps Script editor**
4. **Save** (Ctrl+S / Cmd+S)

### Bước 4: Cập nhật URL trong Frontend

Bạn đã cập nhật URL mới rồi: ✅
```
AKfycbyWsXrR-2PzxvzsFBdowy6m10au5VSAwsq1Ayk-fZm5YfeiGjBbMNjjhr-itAV4SVOs
```

Nhưng cần **deploy lại** với code mới có CORS headers!

### Bước 5: Test

1. **Clear browser cache:** Ctrl+Shift+Delete
2. **Hard refresh:** Ctrl+F5 (hoặc Cmd+Shift+R)
3. **Test lại**

---

## 🔍 Tại sao vẫn lỗi?

### Nguyên nhân có thể:

1. **Deployment không đúng:**
   - "Who has access" không phải "Anyone"
   - Deployment cũ chưa được update

2. **Code chưa được deploy:**
   - Code đã có CORS headers nhưng chưa deploy
   - Phải deploy lại sau khi update code

3. **Browser cache:**
   - Browser đang cache response cũ
   - Phải clear cache

---

## ✅ Checklist bắt buộc:

- [ ] Deployment settings: **"Anyone"** access (KHÔNG phải "Only myself")
- [ ] Đã copy code mới vào Google Apps Script
- [ ] Đã **Save** code trong Google Apps Script
- [ ] Đã **Deploy lại** với version mới
- [ ] Đã copy Web App URL mới (nếu có)
- [ ] Đã cập nhật URL trong frontend
- [ ] Đã clear browser cache
- [ ] Đã test lại

---

## 🆘 Nếu vẫn không được:

Google Apps Script có một bug/limitation với CORS. Nếu đã thử tất cả mà vẫn lỗi:

### Workaround 1: Sử dụng JSONP (cho GET requests)

Thay vì fetch, có thể dùng script tag:
```javascript
const script = document.createElement('script');
script.src = `${GOOGLE_APPS_SCRIPT_WEB_APP_URL}?action=getVoucherSummary&callback=handleResponse`;
document.body.appendChild(script);
```

Nhưng điều này yêu cầu sửa backend để hỗ trợ JSONP.

### Workaround 2: Proxy Server

Tạo một proxy server (Node.js/PHP) để forward requests đến Google Apps Script.

### Workaround 3: Contact Google Support

Nếu là bug từ phía Google Apps Script.

---

## 📝 Notes quan trọng:

- Google Apps Script Web Apps **tự động** handle CORS khi deploy với "Anyone"
- Headers trong code chỉ là **backup**, không đảm bảo 100%
- **Phải deploy lại** sau khi update code
- Mỗi lần update code, nên tạo deployment mới để đảm bảo

