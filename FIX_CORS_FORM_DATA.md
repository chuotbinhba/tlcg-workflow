# Fix CORS với FormData

## ✅ Đã sửa

### 1. Frontend: Dùng FormData thay vì JSON

**Trước (bị CORS):**
```javascript
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'login', email, password })
});
```

**Sau (không bị CORS):**
```javascript
const formData = new FormData();
formData.append('action', 'login');
formData.append('email', email);
formData.append('password', password);

fetch(url, {
  method: 'POST',
  body: formData
  // Không set Content-Type - browser tự set
});
```

### 2. Backend: Parse FormData trong doPost

**Đã cập nhật `TLCG_INTRANET_BACKEND_COMPLETE.gs`** để parse form data:
```javascript
if (e.parameter.action) {
  requestBody = {
    action: e.parameter.action,
    email: e.parameter.email,
    password: e.parameter.password
  };
}
```

---

## 🧪 Test

1. **Refresh browser** (Ctrl+R / Cmd+R)
2. **Thử login** lại
3. **Kiểm tra console** - không còn CORS error

---

## 📝 Lưu ý

- **FormData** không trigger CORS preflight
- **Google Apps Script** xử lý form data tốt hơn JSON
- **Password** vẫn được gửi an toàn (POST, không phải GET)

---

## 🔧 Nếu vẫn không được

1. **Kiểm tra Google Apps Script** đã update code chưa
2. **Deploy lại** Web App
3. **Kiểm tra logs** trong Apps Script

---

**🎉 FormData sẽ fix CORS issue!**

