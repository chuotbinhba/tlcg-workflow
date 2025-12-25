# ⚡ Quick Fix CORS Error - 30 giây

## 🐛 Vấn đề

Bạn đang mở file HTML trực tiếp từ Finder → CORS error!

**Error:**
```
Access to fetch from origin 'null' has been blocked by CORS policy
```

---

## ✅ Fix nhanh (30 giây)

### Cách 1: Chạy Local Server

**Mở Terminal và chạy:**

```bash
cd "/Volumes/MacEx01/TLCG Workflow"
python3 -m http.server 8000
```

**Sau đó mở browser:**
```
http://localhost:8000/tlcgroup-intranet.html
```

**✅ Done! CORS error sẽ hết!**

---

### Cách 2: Dùng Script

```bash
cd "/Volumes/MacEx01/TLCG Workflow"
./start-server.sh
```

**Sau đó mở:**
```
http://localhost:8000/tlcgroup-intranet.html
```

---

### Cách 3: Deploy lên Netlify

```bash
cd "/Volumes/MacEx01/TLCG Workflow"
netlify deploy --prod
```

**Mở URL từ Netlify** (không phải file://)

---

## 🎯 Tại sao?

- **File://** = Browser chặn CORS
- **http://localhost** = Browser cho phép CORS
- **https://** = Browser cho phép CORS

---

## 📝 Lưu ý

**Sau khi chạy server:**
- ✅ Mở `http://localhost:8000/tlcgroup-intranet.html`
- ❌ KHÔNG mở file trực tiếp từ Finder

**Để dừng server:**
- Press `Ctrl+C` trong Terminal

---

**🎉 Chạy local server → CORS error sẽ hết!**

