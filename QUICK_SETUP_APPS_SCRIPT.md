# Quick Setup Google Apps Script - 5 phút

## ⚡ Setup nhanh

### 1️⃣ Tạo Project (1 phút)

1. **Mở:** https://script.google.com
2. **Click:** "New Project"
3. **Đổi tên:** `TLCG Intranet Backend`

### 2️⃣ Copy Code (1 phút)

1. **Mở file:** `google-apps-script-auth.gs`
2. **Copy toàn bộ** code
3. **Paste** vào `Code.gs` trong Apps Script

**Nếu đã có code voucher:**
- Thêm phần authentication vào file hiện có
- Đảm bảo `doPost` có case `'login'`

### 3️⃣ Authorize (1 phút)

1. **Chọn function:** `hashPassword`
2. **Click:** "Run" (▶️)
3. **Click:** "Review Permissions" → "Allow"

### 4️⃣ Deploy (1 phút)

1. **Click:** "Deploy" → "New deployment"
2. **Type:** "Web app"
3. **Execute as:** "Me"
4. **Who has access:** "Anyone" ⚠️
5. **Click:** "Deploy"
6. **Copy** Web App URL

### 5️⃣ Update Frontend (1 phút)

1. **Mở:** `tlcgroup-intranet.html`
2. **Tìm:** `GOOGLE_APPS_SCRIPT_WEB_APP_URL`
3. **Paste** Web App URL
4. **Save**

### ✅ Test

1. **Mở** `tlcgroup-intranet.html`
2. **Click** "Order to Cash"
3. **Login** với email/password từ Google Sheet
4. **Done!** 🎉

---

## 🔧 Nếu gặp lỗi

### "Cannot access spreadsheet"
- Kiểm tra Spreadsheet ID đúng chưa
- Kiểm tra sheet có share với Apps Script account

### "Invalid action"
- Kiểm tra `doPost` có case `'login'` chưa

### "CORS error"
- Đảm bảo deployment chọn "Anyone"
- Kiểm tra Web App URL đúng

---

## 📋 Checklist

- [ ] Code đã paste vào Code.gs
- [ ] Đã authorize permissions
- [ ] Đã deploy as Web App
- [ ] Đã copy Web App URL
- [ ] Frontend đã cập nhật URL
- [ ] Test login thành công

---

**Xem chi tiết:** `SETUP_GOOGLE_APPS_SCRIPT.md`

